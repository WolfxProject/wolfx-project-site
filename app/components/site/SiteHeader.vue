<script setup lang="ts">
const { t } = useI18n()
const { localize } = usePublicPath()
const route = useRoute()
const mobileOpen = ref(false)

const navigation = computed(() => [
  { label: t('nav.home'), to: localize('/') },
  { label: t('nav.projects'), to: localize('/projects') },
  { label: t('nav.docs'), to: localize('/docs/open-api') },
  { label: t('nav.donate'), to: localize('/donate') },
])

watch(() => route.path, () => {
  mobileOpen.value = false
})
</script>

<template>
  <header class="site-header">
    <div class="site-header__inner site-container">
      <NuxtLink
        :to="localize('/')"
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
        :aria-label="t('nav.menu')"
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
          {{ t('nav.github') }}
          <UIcon name="i-lucide-arrow-up-right" />
        </NuxtLink>
      </nav>

      <div class="header-actions">
        <DocsSearch />
        <ThemeSwitcher />
        <LanguageSwitcher />
        <button
          class="icon-button mobile-menu-button"
          type="button"
          :aria-label="t('nav.menu')"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-navigation"
          @click="mobileOpen = !mobileOpen"
        >
          <UIcon :name="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" />
        </button>
      </div>
    </div>
    <nav
      v-if="mobileOpen"
      id="mobile-navigation"
      class="mobile-nav"
      :aria-label="t('nav.menu')"
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
        {{ t('nav.github') }}
      </NuxtLink>
    </nav>
  </header>
</template>
