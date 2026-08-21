<script setup lang="ts">
const { t } = useI18n()
const { displayLocale, sitePath } = useSiteContext()
const route = useRoute()
const mobileOpen = ref(false)
const menuButton = useTemplateRef<HTMLButtonElement>('menuButton')
const mobileNavigation = useTemplateRef<{
  open: () => Promise<void>
  close: () => void
}>('mobileNavigation')

const navigation = computed(() => [
  { label: tr('nav.home'), to: sitePath('/') },
  { label: tr('nav.projects'), to: sitePath('/projects') },
  { label: tr('nav.docs'), to: sitePath('/docs/open-api') },
  { label: tr('nav.donate'), to: sitePath('/donate') },
])

function tr(key: string) {
  return t(key, {}, { locale: displayLocale.value })
}

watch(() => route.path, () => {
  mobileNavigation.value?.close()
})

async function openMobileNavigation() {
  mobileOpen.value = true
  await mobileNavigation.value?.open()
}

async function handleMobileNavigationClose() {
  mobileOpen.value = false
  await nextTick()
  menuButton.value?.focus()
}
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner site-container">
      <NuxtLink
        :to="sitePath('/')"
        class="brand"
        aria-label="Wolfx Project"
      >
        <img
          src="/images/logo.png"
          alt=""
          width="38"
          height="38"
        >
        <span>Wolfx Project</span>
      </NuxtLink>

      <nav
        class="desktop-nav"
        :aria-label="tr('nav.menu')"
      >
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
        >
          {{ item.label }}
        </NuxtLink>
        <NuxtLink
          to="https://github.com/WolfxProject"
          external
          target="_blank"
          rel="noopener noreferrer"
        >
          {{ tr('nav.github') }}
          <UIcon name="i-lucide-arrow-up-right" />
        </NuxtLink>
      </nav>

      <div class="header-actions">
        <DocsSearch />
        <ThemeSwitcher />
        <LanguageSwitcher />
        <button
          ref="menuButton"
          class="icon-button mobile-menu-button"
          type="button"
          :aria-label="tr('nav.menu')"
          :title="tr('nav.menu')"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-navigation"
          @click="openMobileNavigation"
        >
          <UIcon name="i-lucide-menu" />
        </button>
      </div>
    </div>
    <MobileNavigation
      id="mobile-navigation"
      ref="mobileNavigation"
      :navigation="navigation"
      :locale-override="displayLocale"
      @close="handleMobileNavigationClose"
    />
  </header>
</template>
