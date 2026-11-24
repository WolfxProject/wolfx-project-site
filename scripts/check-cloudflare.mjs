import { checkStaticDelivery } from './check-static-delivery.mjs'

await checkStaticDelivery(process.env.CLOUDFLARE_TEST_BASE_URL ?? 'http://127.0.0.1:8787', 'Cloudflare')
