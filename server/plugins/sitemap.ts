// Sitemap normalizes all trailing slashes. The two translated home pages have
// canonical directory URLs on both static hosts.
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('sitemap:output', (ctx) => {
    ctx.sitemap = ctx.sitemap.replace(/https:\/\/wolfx\.jp\/(en|zh)(?=["<])/g, 'https://wolfx.jp/$1/')
  })
})
