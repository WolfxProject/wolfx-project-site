<script setup lang="ts">
const { t } = useI18n()
const { displayLocale, internalPath } = useSiteContext()

function tr(key: string) {
  return t(key, {}, { locale: displayLocale.value })
}

const links = computed(() => [
  { label: tr('mc.overview'), href: 'https://mc.wolfx.jp/', internalPath: '/mc' },
  { label: tr('mc.rules'), href: 'https://mc.wolfx.jp/rules', internalPath: '/mc/rules' },
  { label: tr('mc.join'), href: 'https://mc.wolfx.jp/join', internalPath: '/mc/join' },
  { label: tr('mc.vote'), href: 'https://mc.wolfx.jp/vote', internalPath: '/mc/vote' },
])

const activePath = computed(() => internalPath.value.replace(/^\/(?:zh|en)(?=\/|$)/, ''))
</script>

<template>
  <div class="mc-navigation">
    <div class="site-container mc-navigation__inner">
      <a
        class="mc-navigation__brand"
        href="https://mc.wolfx.jp/"
      >
        <span aria-hidden="true">🐾</span>
        Wolfx Survival
      </a>
      <nav :aria-label="tr('mc.navigation')">
        <a
          v-for="link in links"
          :key="link.href"
          :href="link.href"
          :aria-current="activePath === link.internalPath ? 'page' : undefined"
        >{{ link.label }}</a>
      </nav>
    </div>
  </div>
</template>
