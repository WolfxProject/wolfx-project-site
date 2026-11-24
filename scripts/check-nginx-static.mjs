import { checkStaticDelivery } from './check-static-delivery.mjs'

await checkStaticDelivery(process.env.NGINX_TEST_BASE_URL ?? 'http://127.0.0.1:8790', 'Nginx')
