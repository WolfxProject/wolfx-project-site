<script setup lang="ts">
import { wolfxMc } from '~~/data/wolfxmc'

defineProps<{
  eyebrow: string
  title: string
  copyLabel: string
  rulesLabel: string
  joinLabel: string
  minecraftLabel: string
  versionLabel: string
  sinceLabel: string
}>()

const { t } = useI18n()
const { displayLocale } = useSiteContext()
const { status } = useMinecraftStatus()

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
          <div class="mc-server-connect">
            <div class="mc-server-chip">
              <code>{{ wolfxMc.serverAddress }}</code>
              <CopyButton
                :value="wolfxMc.serverAddress"
                :aria-label="copyLabel"
              />
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
          </div>
          <UButton
            to="https://mc.wolfx.jp/join"
            size="xl"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ joinLabel }}
          </UButton>
          <UButton
            to="https://mc.wolfx.jp/rules"
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
