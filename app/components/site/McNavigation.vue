<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()
const { localizeWolfxMc, unlocalize } = usePublicPath()
const { displayLocale } = useSiteContext()

function tr(key: string) {
  return t(key, {}, { locale: displayLocale.value })
}

function mcPath(path: string) {
  return localizeWolfxMc(path, displayLocale.value, /^\/zh(?:\/|$)/.test(route.path))
}

const links = computed(() => [
  { label: tr('mc.overview'), to: mcPath('/mc'), path: '/mc' },
  { label: tr('mc.rules'), to: mcPath('/mc/rules'), path: '/mc/rules' },
  { label: tr('mc.join'), to: mcPath('/mc/join'), path: '/mc/join' },
  { label: tr('mc.vote'), to: mcPath('/mc/vote'), path: '/mc/vote' },
])

const activePath = computed(() => unlocalize(route.path))
</script>

<template>
  <div class="mc-navigation">
    <div class="site-container mc-navigation__inner">
      <NuxtLink
        class="mc-navigation__brand"
        :to="mcPath('/mc')"
      >
        <span aria-hidden="true">🐾</span>
        Wolfx Survival
      </NuxtLink>
      <nav :aria-label="tr('mc.navigation')">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          :aria-current="activePath === link.path ? 'page' : undefined"
        >{{ link.label }}</NuxtLink>
      </nav>
    </div>
  </div>
</template>
