<template>
  <div class="site-shell">
    <SiteHeader />
    <main
      id="main-content"
      tabindex="-1"
    >
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
