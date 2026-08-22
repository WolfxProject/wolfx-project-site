<script setup lang="ts">
import { wolfxMc } from '~~/data/wolfxmc'

const { t } = useI18n()
const route = useRoute()
const { localizeWolfxMc } = usePublicPath()
const { displayLocale } = useSiteContext()
const { status } = useMinecraftStatus()

const preservesExplicitChinese = computed(() => /^\/zh(?:\/|$)/.test(route.path))
const rulesPath = computed(() => localizeWolfxMc('/mc/rules', displayLocale.value, preservesExplicitChinese.value))
const joinPath = computed(() => localizeWolfxMc('/mc/join', displayLocale.value, preservesExplicitChinese.value))

const props = defineProps<{
  eyebrow: string
  title: string
  mainRouteLabel: string
  mainCopyLabel: string
  overseasRouteLabel: string
  overseasCopyLabel: string
  routeNotice: string
  rulesLabel: string
  joinLabel: string
  minecraftLabel: string
  coreLabel: string
  versionLabel: string
  sinceLabel: string
}>()

const serverRoutes = computed(() => [
  {
    key: 'main' as const,
    label: props.mainRouteLabel,
    copyLabel: props.mainCopyLabel,
    address: wolfxMc.serverAddresses.main,
  },
  {
    key: 'overseas' as const,
    label: props.overseasRouteLabel,
    copyLabel: props.overseasCopyLabel,
    address: wolfxMc.serverAddresses.overseas,
  },
])

function tr(key: string) {
  return t(key, {}, { locale: displayLocale.value })
}

const statusLabel = computed(() => {
  if (status.value.state === 'online')
    return tr('mc.statusOnline')
  if (status.value.state === 'offline')
    return tr('mc.statusOffline')
  if (status.value.state === 'unknown')
    return tr('mc.statusUnknown')
  return tr('mc.statusLoading')
})

const playerLabel = computed(() => {
  if (status.value.state !== 'online')
    return ''
  return t('mc.playersOnline', { count: status.value.players }, { locale: displayLocale.value })
})
</script>

<template>
  <section class="mc-hero">
    <div
      class="mc-hero__terrain"
      aria-hidden="true"
    >
      <span
        v-for="index in 16"
        :key="index"
      />
    </div>
    <div class="site-container mc-hero__inner">
      <div class="mc-hero__content">
        <p class="eyebrow">
          {{ eyebrow }}
        </p>
        <h1>{{ title }}</h1>
        <div class="mc-hero__description">
          <slot />
        </div>
        <div class="mc-hero__actions">
          <div class="mc-server-access">
            <div class="mc-server-routes">
              <div
                v-for="serverRoute in serverRoutes"
                :key="serverRoute.key"
                class="mc-server-route"
                :data-route="serverRoute.key"
              >
                <span class="mc-server-route__label">{{ serverRoute.label }}</span>
                <div class="mc-server-chip">
                  <code>{{ serverRoute.address }}</code>
                  <CopyButton
                    :value="serverRoute.address"
                    :aria-label="serverRoute.copyLabel"
                  />
                </div>
              </div>
            </div>
            <div
              class="mc-server-status"
              :data-state="status.state"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <span
                class="mc-server-status__indicator"
                aria-hidden="true"
              />
              <span>{{ statusLabel }}</span>
              <span
                v-if="playerLabel"
                class="mc-server-status__players"
              >{{ playerLabel }}</span>
            </div>
            <p class="mc-route-notice">
              {{ routeNotice }}
            </p>
          </div>
          <UButton
            :to="joinPath"
            :locale="false"
            size="xl"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ joinLabel }}
          </UButton>
          <UButton
            :to="rulesPath"
            size="xl"
            color="neutral"
            variant="outline"
          >
            {{ rulesLabel }}
          </UButton>
          <UButton
            :to="wolfxMc.links.minecraft"
            target="_blank"
            rel="noopener noreferrer"
            size="xl"
            color="neutral"
            variant="ghost"
          >
            {{ minecraftLabel }}
          </UButton>
        </div>
      </div>
      <dl class="mc-hero__facts">
        <div>
          <dt>{{ coreLabel }}</dt>
          <dd>{{ wolfxMc.currentCoreVersion }}</dd>
        </div>
        <div>
          <dt>{{ versionLabel }}</dt>
          <dd>{{ wolfxMc.supportedVersion }}</dd>
        </div>
        <div>
          <dt>{{ sinceLabel }}</dt>
          <dd><time :datetime="wolfxMc.openedOn">2019 / 05 / 18</time></dd>
        </div>
      </dl>
    </div>
  </section>
</template>
