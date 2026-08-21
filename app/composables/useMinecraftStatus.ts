import { z } from 'zod'
import { wolfxMc } from '~~/data/wolfxmc'

export type MinecraftStatus = { state: 'loading' }
  | { state: 'online', players: number }
  | { state: 'offline' }
  | { state: 'unknown' }

export const MINECRAFT_STATUS_REFRESH_MS = 5 * 60 * 1000
export const MINECRAFT_STATUS_TIMEOUT_MS = 8_000

const endpoint = new URL('https://mcapi.us/server/status')
endpoint.searchParams.set('ip', wolfxMc.serverAddress)
export const MINECRAFT_STATUS_ENDPOINT = endpoint.toString()

const responseSchema = z.object({
  status: z.string(),
  online: z.boolean(),
  players: z.object({
    now: z.number().int().nonnegative().optional(),
  }).optional(),
})

const sharedStatus = shallowRef<MinecraftStatus>({ state: 'loading' })
let subscriberCount = 0
let refreshTimer: ReturnType<typeof setTimeout> | undefined
let cleanupTimer: ReturnType<typeof setTimeout> | undefined
let lastRequestStartedAt = 0
let activeRequest: {
  controller: AbortController
  promise: Promise<MinecraftStatus>
} | undefined

async function requestStatus(controller: AbortController): Promise<MinecraftStatus> {
  const timeout = setTimeout(() => controller.abort(), MINECRAFT_STATUS_TIMEOUT_MS)

  try {
    const response = await fetch(MINECRAFT_STATUS_ENDPOINT, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })
    if (!response.ok)
      return { state: 'unknown' }

    const parsed = responseSchema.safeParse(await response.json())
    if (!parsed.success || parsed.data.status !== 'success')
      return { state: 'unknown' }
    if (!parsed.data.online)
      return { state: 'offline' }
    if (parsed.data.players?.now === undefined)
      return { state: 'unknown' }

    return { state: 'online', players: parsed.data.players.now }
  }
  catch {
    return { state: 'unknown' }
  }
  finally {
    clearTimeout(timeout)
  }
}

function getStatus(): Promise<MinecraftStatus> {
  if (activeRequest)
    return activeRequest.promise

  const controller = new AbortController()
  lastRequestStartedAt = Date.now()
  const promise = requestStatus(controller).finally(() => {
    if (activeRequest?.controller === controller)
      activeRequest = undefined
  })
  activeRequest = { controller, promise }
  return promise
}

async function refreshStatus() {
  const result = await getStatus()
  if (subscriberCount > 0)
    sharedStatus.value = result
}

function scheduleRefresh(delay: number) {
  if (refreshTimer)
    clearTimeout(refreshTimer)
  refreshTimer = setTimeout(() => {
    refreshTimer = undefined
    void refreshStatus().finally(() => {
      if (subscriberCount > 0)
        scheduleRefresh(MINECRAFT_STATUS_REFRESH_MS)
    })
  }, delay)
}

function start() {
  if (cleanupTimer) {
    clearTimeout(cleanupTimer)
    cleanupTimer = undefined
  }
  subscriberCount += 1
  if (subscriberCount > 1)
    return

  const elapsed = Date.now() - lastRequestStartedAt
  const remaining = lastRequestStartedAt === 0
    ? 0
    : Math.max(0, MINECRAFT_STATUS_REFRESH_MS - elapsed)

  if (remaining > 0) {
    scheduleRefresh(remaining)
    return
  }

  if (lastRequestStartedAt === 0)
    sharedStatus.value = { state: 'loading' }
  void refreshStatus().finally(() => {
    if (subscriberCount > 0)
      scheduleRefresh(MINECRAFT_STATUS_REFRESH_MS)
  })
}

function stop() {
  subscriberCount = Math.max(0, subscriberCount - 1)
  if (subscriberCount > 0)
    return

  cleanupTimer = setTimeout(() => {
    cleanupTimer = undefined
    if (subscriberCount > 0)
      return
    if (refreshTimer) {
      clearTimeout(refreshTimer)
      refreshTimer = undefined
    }
    if (activeRequest) {
      lastRequestStartedAt = 0
      activeRequest.controller.abort()
    }
  }, 0)
}

export function useMinecraftStatus() {
  onMounted(start)
  onBeforeUnmount(stop)

  return {
    status: readonly(sharedStatus),
  }
}
