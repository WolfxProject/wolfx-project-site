<script setup lang="ts">
const { t } = useI18n()
const { sitePath } = useSiteContext()
const pages = useDocsNavigation()
const route = useRoute()

const groups = computed(() => [
  {
    label: t('docs.navigation'),
    items: pages.value,
  },
  {
    label: t('footer.legal'),
    items: [
      { label: t('footer.privacy'), to: sitePath('/legal/privacy'), icon: 'i-lucide-shield-check' },
      { label: t('footer.terms'), to: sitePath('/legal/terms'), icon: 'i-lucide-scale' },
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
