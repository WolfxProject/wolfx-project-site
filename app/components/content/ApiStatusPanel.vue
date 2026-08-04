<script lang="ts">
type ApiStatusLocale = 'ja' | 'zh' | 'en'
type StatusState = 'loading' | 'ready' | 'error'
type ChartKey = 'nginxDaily' | 'nginxWeekly' | 'trafficDaily' | 'trafficWeekly'

interface WolfxWebSocketStatus {
  client_counts: number
  update_at: string
}

interface ChartDefinition {
  key: ChartKey
  periodKey: 'apiStatus.daily' | 'apiStatus.weekly'
  url: string
}

interface ActiveStatusRequest {
  controller: AbortController
  promise: Promise<WolfxWebSocketStatus>
}

const activeStatusRequests = new Map<ApiStatusLocale, ActiveStatusRequest>()
const apiStatusSubscribers = new Map<ApiStatusLocale, number>()
</script>

<script setup lang="ts">
const props = defineProps<{
  locale: ApiStatusLocale
}>()

const { t } = useI18n()

const stateKey = `api-status-${props.locale}`
const statusState = useState<StatusState>(`${stateKey}-state`, () => 'loading')
const clientCount = useState<number | null>(`${stateKey}-count`, () => null)
const updatedAt = useState(`${stateKey}-updated`, () => '')
const chartTimestamp = useState<number | null>(`${stateKey}-charts`, () => null)
const chartLoaded = useState<Record<ChartKey, boolean>>(`${stateKey}-loaded`, () => createChartState(false))
const chartErrors = useState<Record<ChartKey, boolean>>(`${stateKey}-errors`, () => createChartState(false))

let disposed = false

const chartGroups = computed(() => [
  {
    key: 'nginx',
    title: t('apiStatus.nginxRequests'),
    charts: [
      {
        key: 'nginxDaily',
        periodKey: 'apiStatus.daily',
        url: 'https://api.wolfx.jp/status/nginx_request-day.png',
      },
      {
        key: 'nginxWeekly',
        periodKey: 'apiStatus.weekly',
        url: 'https://api.wolfx.jp/status/nginx_request-week.png',
      },
    ] satisfies ChartDefinition[],
  },
  {
    key: 'traffic',
    title: t('apiStatus.networkTraffic'),
    charts: [
      {
        key: 'trafficDaily',
        periodKey: 'apiStatus.daily',
        url: 'https://api.wolfx.jp/status/if_eth0-day.png',
      },
      {
        key: 'trafficWeekly',
        periodKey: 'apiStatus.weekly',
        url: 'https://api.wolfx.jp/status/if_eth0-week.png',
      },
    ] satisfies ChartDefinition[],
  },
])

const formattedClientCount = computed(() => clientCount.value === null
  ? ''
  : new Intl.NumberFormat(props.locale).format(clientCount.value))

function createChartState(value: boolean): Record<ChartKey, boolean> {
  return {
    nginxDaily: value,
    nginxWeekly: value,
    trafficDaily: value,
    trafficWeekly: value,
  }
}

function parseStatus(value: unknown): WolfxWebSocketStatus | null {
  if (!value || typeof value !== 'object')
    return null

  const record = value as Record<string, unknown>
  const rawCount = record.client_counts
  const normalizedCount = typeof rawCount === 'number'
    ? rawCount
    : typeof rawCount === 'string' && rawCount.trim()
      ? Number(rawCount)
      : Number.NaN
  const updateAt = record.update_at

  if (!Number.isSafeInteger(normalizedCount) || normalizedCount < 0)
    return null
  if (typeof updateAt !== 'string' || !updateAt.trim())
    return null

  return {
    client_counts: normalizedCount,
    update_at: updateAt.trim(),
  }
}

function chartUrl(url: string) {
  return chartTimestamp.value === null ? undefined : `${url}?ts=${chartTimestamp.value}`
}

function chartAlt(groupTitle: string, periodKey: ChartDefinition['periodKey']) {
  return `${groupTitle} — ${t(periodKey)}`
}

function markChartLoaded(key: ChartKey) {
  chartLoaded.value[key] = true
}

function markChartError(key: ChartKey) {
  chartErrors.value[key] = true
}

async function fetchStatus() {
  statusState.value = 'loading'
  let activeRequest = activeStatusRequests.get(props.locale)

  if (!activeRequest) {
    const controller = new AbortController()
    const promise = (async () => {
      const timeout = setTimeout(() => controller.abort(), 10_000)
      try {
        const response = await fetch('https://api.wolfx.jp/ws_clients.json', {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok)
          throw new Error('Status request failed')

        const parsed = parseStatus(await response.json())
        if (!parsed)
          throw new Error('Invalid status response')
        return parsed
      }
      finally {
        clearTimeout(timeout)
        if (activeStatusRequests.get(props.locale)?.controller === controller)
          activeStatusRequests.delete(props.locale)
      }
    })()
    activeRequest = { controller, promise }
    activeStatusRequests.set(props.locale, activeRequest)
  }

  try {
    const parsed = await activeRequest.promise
    if (disposed)
      return

    clientCount.value = parsed.client_counts
    updatedAt.value = parsed.update_at
    statusState.value = 'ready'
  }
  catch {
    if (disposed)
      return
    clientCount.value = null
    updatedAt.value = ''
    statusState.value = 'error'
  }
}

function refresh() {
  const now = Date.now()
  chartTimestamp.value = Math.max(now, (chartTimestamp.value ?? 0) + 1)
  chartLoaded.value = createChartState(false)
  chartErrors.value = createChartState(false)
  void fetchStatus()
}

onMounted(() => {
  disposed = false
  apiStatusSubscribers.set(props.locale, (apiStatusSubscribers.get(props.locale) ?? 0) + 1)
  if (chartTimestamp.value === null) {
    const now = Date.now()
    chartTimestamp.value = Math.max(now, (chartTimestamp.value ?? 0) + 1)
    chartLoaded.value = createChartState(false)
    chartErrors.value = createChartState(false)
  }
  if (statusState.value !== 'ready')
    void fetchStatus()
})

onBeforeUnmount(() => {
  disposed = true
  const subscribers = Math.max(0, (apiStatusSubscribers.get(props.locale) ?? 1) - 1)
  apiStatusSubscribers.set(props.locale, subscribers)
  setTimeout(() => {
    if ((apiStatusSubscribers.get(props.locale) ?? 0) !== 0)
      return
    activeStatusRequests.get(props.locale)?.controller.abort()
    statusState.value = 'loading'
    clientCount.value = null
    updatedAt.value = ''
    chartTimestamp.value = null
    chartLoaded.value = createChartState(false)
    chartErrors.value = createChartState(false)
  }, 0)
})
</script>

<template>
  <section
    class="api-status-panel"
    data-api-status-panel
    :aria-label="t('apiStatus.title')"
  >
    <div class="api-status-panel__summary">
      <div class="api-status-panel__metric">
        <span
          class="api-status-panel__indicator"
          aria-hidden="true"
        />
        <div>
          <p class="api-status-panel__label">
            {{ t('apiStatus.activeClients') }}
          </p>
          <p
            class="api-status-panel__value"
            :class="{ 'api-status-panel__value--error': statusState === 'error' }"
            aria-live="polite"
          >
            <span v-if="statusState === 'ready'">{{ formattedClientCount }}</span>
            <span v-else-if="statusState === 'error'">{{ t('apiStatus.statusError') }}</span>
            <span v-else>{{ t('apiStatus.loading') }}</span>
          </p>
        </div>
      </div>

      <div class="api-status-panel__meta">
        <p v-if="statusState === 'ready'">
          <span>{{ t('apiStatus.updatedAt') }}</span>
          <strong>{{ updatedAt }}</strong>
        </p>
        <button
          type="button"
          class="api-status-panel__refresh"
          :disabled="statusState === 'loading'"
          @click="refresh"
        >
          {{ statusState === 'loading' ? t('apiStatus.refreshing') : t('apiStatus.refresh') }}
        </button>
      </div>
    </div>

    <div class="api-status-panel__groups">
      <section
        v-for="group in chartGroups"
        :key="group.key"
        class="api-status-panel__group"
      >
        <h3>{{ group.title }}</h3>
        <figure
          v-for="chart in group.charts"
          :key="chart.key"
          class="api-status-panel__chart"
        >
          <figcaption>{{ t(chart.periodKey) }}</figcaption>
          <div class="api-status-panel__chart-frame">
            <img
              v-if="chartTimestamp !== null && !chartErrors[chart.key]"
              :src="chartUrl(chart.url)"
              :alt="chartAlt(group.title, chart.periodKey)"
              loading="lazy"
              decoding="async"
              @load="markChartLoaded(chart.key)"
              @error="markChartError(chart.key)"
            >
            <p
              v-if="chartErrors[chart.key]"
              class="api-status-panel__chart-state api-status-panel__chart-state--error"
              role="status"
              aria-live="polite"
            >
              {{ t('apiStatus.chartError') }}
            </p>
            <p
              v-else-if="!chartLoaded[chart.key]"
              class="api-status-panel__chart-state"
              role="status"
            >
              {{ t('apiStatus.loading') }}
            </p>
          </div>
        </figure>
      </section>
    </div>
  </section>
</template>

<style scoped>
.api-status-panel {
  width: 100%;
  margin: 1.5rem 0 3rem;
  overflow: hidden;
  border: 1px solid var(--wolfx-line);
  border-radius: 1rem;
  background: var(--wolfx-surface);
  box-shadow: var(--wolfx-shadow);
}

.api-status-panel__summary {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  border-bottom: 1px solid var(--wolfx-line);
  background: linear-gradient(135deg, var(--wolfx-accent-soft), var(--wolfx-surface) 68%);
}

.api-status-panel__metric {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: .9rem;
}

.api-status-panel__indicator {
  width: .72rem;
  height: .72rem;
  flex: 0 0 auto;
  border: 2px solid var(--wolfx-surface);
  border-radius: 50%;
  background: var(--wolfx-accent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--wolfx-accent) 18%, transparent);
}

.api-status-panel__label,
.api-status-panel__value,
.api-status-panel__meta p,
.api-status-panel__chart-state {
  margin: 0;
}

.api-status-panel__label {
  color: var(--wolfx-muted) !important;
  font-size: .78rem;
  font-weight: 700;
  letter-spacing: .035em;
}

.api-status-panel__value {
  min-height: 2.3rem;
  color: var(--wolfx-text) !important;
  font-size: 1.75rem;
  font-weight: 760;
  line-height: 1.25;
}

.api-status-panel__value--error {
  color: var(--wolfx-danger) !important;
  font-size: .95rem;
}

.api-status-panel__meta {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
}

.api-status-panel__meta p {
  min-width: 0;
  display: flex;
  flex-direction: column;
  color: var(--wolfx-muted) !important;
  font-size: .75rem;
  text-align: right;
}

.api-status-panel__meta strong {
  overflow-wrap: anywhere;
  color: var(--wolfx-text);
  font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
  font-size: .78rem;
  font-weight: 600;
}

.api-status-panel__refresh {
  min-height: 2.45rem;
  padding: .45rem .8rem;
  flex: 0 0 auto;
  border: 1px solid var(--wolfx-line-strong);
  border-radius: .6rem;
  background: var(--wolfx-surface);
  color: var(--wolfx-accent-strong);
  cursor: pointer;
  font-size: .82rem;
  font-weight: 700;
}

.api-status-panel__refresh:hover:not(:disabled) {
  border-color: var(--wolfx-accent);
  background: var(--wolfx-accent-soft);
}

.api-status-panel__refresh:disabled {
  cursor: wait;
  opacity: .65;
}

.api-status-panel__groups {
  padding: 1.25rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.api-status-panel__group {
  min-width: 0;
}

.api-status-panel__group h3 {
  margin: 0 0 .8rem;
  color: var(--wolfx-text);
  font-size: 1rem;
}

.api-status-panel__chart {
  margin: 0 0 .9rem;
  overflow: hidden;
  border: 1px solid var(--wolfx-line);
  border-radius: .75rem;
  background: var(--wolfx-surface-raised);
}

.api-status-panel__chart:last-child {
  margin-bottom: 0;
}

.api-status-panel__chart figcaption {
  padding: .55rem .75rem;
  border-bottom: 1px solid var(--wolfx-line);
  color: var(--wolfx-muted);
  font-size: .75rem;
  font-weight: 700;
}

.api-status-panel__chart-frame {
  position: relative;
  aspect-ratio: 16 / 9;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: color-mix(in srgb, var(--wolfx-bg) 65%, var(--wolfx-surface));
}

.api-status-panel__chart img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.api-status-panel__chart-state {
  padding: 1rem;
  color: var(--wolfx-muted) !important;
  font-size: .8rem;
  text-align: center;
}

.api-status-panel__chart-state--error {
  color: var(--wolfx-danger) !important;
}

@media (max-width: 720px) {
  .api-status-panel__summary,
  .api-status-panel__meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .api-status-panel__meta {
    width: 100%;
    gap: .75rem;
  }

  .api-status-panel__meta p {
    text-align: left;
  }

  .api-status-panel__groups {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .api-status-panel__summary,
  .api-status-panel__groups {
    padding: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .api-status-panel *,
  .api-status-panel *::before,
  .api-status-panel *::after {
    transition: none !important;
  }
}
</style>
