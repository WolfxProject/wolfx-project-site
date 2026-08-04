<script setup lang="ts">
const { localize } = usePublicPath()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__main site-container">
      <div>
        <NuxtLink
          :to="localize('/')"
          class="footer-brand"
        >Wolfx Project</NuxtLink>
        <p>{{ $t('footer.statement') }}</p>
      </div>
      <nav aria-label="Project">
        <NuxtLink :to="localize('/projects')">{{ $t('nav.projects') }}</NuxtLink>
        <NuxtLink
          to="https://github.com/WolfxProject"
          external
          target="_blank"
          rel="noopener noreferrer"
        >GitHub</NuxtLink>
        <NuxtLink
          :to="localize('/donate')"
        >{{ $t('footer.donate') }}</NuxtLink>
        <NuxtLink
          to="https://status.wolfx.jp"
          external
          target="_blank"
          rel="noopener noreferrer"
        >{{ $t('footer.status') }}</NuxtLink>
      </nav>
      <nav aria-label="Legal">
        <NuxtLink :to="localize('/legal/privacy')">{{ $t('footer.privacy') }}</NuxtLink>
        <NuxtLink :to="localize('/legal/terms')">{{ $t('footer.terms') }}</NuxtLink>
      </nav>
      <nav :aria-label="$t('footer.links')">
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
