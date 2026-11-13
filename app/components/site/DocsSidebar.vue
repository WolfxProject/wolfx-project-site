<script setup lang="ts">
const { t } = useI18n()
const { localize } = usePublicPath()
const route = useRoute()

const groups = computed(() => [
  {
    label: t('docs.navigation'),
    items: [
      { label: 'Wolfx Open API', to: localize('/docs/open-api'), icon: 'i-lucide-braces' },
      { label: 'WebSocket API', to: localize('/docs/websocket'), icon: 'i-lucide-radio-tower' },
      { label: 'SeisJS API', to: localize('/docs/seisjs-api'), icon: 'i-lucide-audio-waveform' },
    ],
  },
  {
    label: 'Legal',
    items: [
      { label: t('footer.privacy'), to: localize('/legal/privacy'), icon: 'i-lucide-shield-check' },
      { label: t('footer.terms'), to: localize('/legal/terms'), icon: 'i-lucide-scale' },
    ],
  },
])
</script>

<template>
  <nav
    class="docs-sidebar"
    :aria-label="t('docs.navigation')"
  >
    <div
      v-for="group in groups"
      :key="group.label"
      class="docs-sidebar__group"
    >
      <p>{{ group.label }}</p>
      <NuxtLink
        v-for="item in group.items"
        :key="item.to"
        :to="item.to"
        :aria-current="route.path === item.to ? 'page' : undefined"
      >
        <UIcon :name="item.icon" />
        <span>{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>
