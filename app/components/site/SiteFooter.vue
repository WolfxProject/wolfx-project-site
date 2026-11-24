<script setup lang="ts">
const { sitePath, tr } = useSiteContext()
const year = useState('copyright-year', () => new Date().getUTCFullYear())
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
      <nav :aria-label="tr('footer.project')">
        <NuxtLink :to="sitePath('/projects')">{{ tr('nav.projects') }}</NuxtLink>
        <NuxtLink
          to="https://github.com/WolfxProject"
          external
          target="_blank"
          rel="noopener noreferrer"
        >GitHub</NuxtLink>
        <NuxtLink
          :to="sitePath('/donate')"
        >{{ tr('nav.donate') }}</NuxtLink>
        <NuxtLink
          to="https://status.wolfx.jp"
          external
          target="_blank"
          rel="noopener noreferrer"
        >{{ tr('footer.status') }}</NuxtLink>
      </nav>
      <nav :aria-label="tr('footer.legal')">
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
        <NuxtLink
          to="https://weather.raineko.net"
          external
          target="_blank"
          rel="noopener noreferrer"
        >Raineko Weather</NuxtLink>
      </nav>
    </div>
    <div class="site-footer__bottom site-container">
      <span>© 2017–{{ year }} Wolfx Project</span>
    </div>
  </footer>
</template>
