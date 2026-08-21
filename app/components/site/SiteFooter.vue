<script setup lang="ts">
const { t } = useI18n()
const { displayLocale, sitePath } = useSiteContext()
const year = new Date().getFullYear()

function tr(key: string) {
  return t(key, {}, { locale: displayLocale.value })
}
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__main site-container">
      <div>
        <NuxtLink
          :to="sitePath('/')"
          class="footer-brand"
        >Wolfx Project</NuxtLink>
        <p>{{ tr('footer.statement') }}</p>
      </div>
      <nav aria-label="Project">
        <NuxtLink :to="sitePath('/projects')">{{ tr('nav.projects') }}</NuxtLink>
        <NuxtLink
          to="https://github.com/WolfxProject"
          external
          target="_blank"
          rel="noopener noreferrer"
        >GitHub</NuxtLink>
        <NuxtLink
          :to="sitePath('/donate')"
        >{{ tr('footer.donate') }}</NuxtLink>
        <NuxtLink
          to="https://status.wolfx.jp"
          external
          target="_blank"
          rel="noopener noreferrer"
        >{{ tr('footer.status') }}</NuxtLink>
      </nav>
      <nav aria-label="Legal">
        <NuxtLink :to="sitePath('/legal/privacy')">{{ tr('footer.privacy') }}</NuxtLink>
        <NuxtLink :to="sitePath('/legal/terms')">{{ tr('footer.terms') }}</NuxtLink>
      </nav>
      <nav :aria-label="tr('footer.links')">
        <NuxtLink
          to="https://blog.yorushi.top"
          external
          target="_blank"
          rel="noopener noreferrer"
        >Yorushi</NuxtLink>
        <NuxtLink
          to="https://bousai.cn"
          external
          target="_blank"
          rel="noopener noreferrer"
        >Bousai.cn</NuxtLink>
        <NuxtLink
          to="https://n0w0n.com"
          external
          target="_blank"
          rel="noopener noreferrer"
        >n0w0n.com</NuxtLink>
        <NuxtLink
          to="https://rainsummer.top"
          external
          target="_blank"
          rel="noopener noreferrer"
        >RainSummer</NuxtLink>
      </nav>
    </div>
    <div class="site-footer__bottom site-container">
      <span>© 2017–{{ year }} Wolfx Project</span>
      <span>Open information · Responsible use</span>
    </div>
  </footer>
</template>
