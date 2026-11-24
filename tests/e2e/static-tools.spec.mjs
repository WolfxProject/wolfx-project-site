import { expect, test } from '@playwright/test'

test('the station widget renders unavailable readings independently and clears stale values', async ({ page }) => {
  const urls = []
  page.on('request', request => urls.push(new URL(request.url())))
  let stationOnline = true
  await page.route('https://station.wolfx.jp/data.json*', route => route.fulfill(stationOnline
    ? { json: { temperature: null, humidity: 0, pressure: ' ', usv: 0.15, usv_avg: 0.14 } }
    : { status: 503 }))
  await page.route('https://station.wolfx.jp/data_seis.json*', route => route.fulfill({ json: { temperature: '24.2', humidity: 43, pressure: 1003 } }))
  await page.clock.install()
  await page.goto('/geiger/')
  await expect(page.locator('#c1')).toHaveText('24.2')
  await expect(page.locator('#temp')).toHaveText('--')
  await expect(page.locator('#atom')).toHaveText('--')
  await expect(page.locator('#hum')).toHaveText('0')
  await expect(page.locator('#rad')).toHaveText('0.15 μSv/h')
  stationOnline = false
  await page.clock.fastForward(5000)
  await expect(page.locator('#rad')).toHaveText('--')
  await expect(page.locator('#c1')).toHaveText('24.2')
  expect([...new Set(urls.filter(url => url.origin !== new URL(page.url()).origin).map(url => url.hostname))]).toEqual(['station.wolfx.jp'])
})

test('the station alarm triggers once for a valid high reading and ignores non-finite readings', async ({ page }) => {
  let radiation = '1e400'
  await page.addInitScript(() => {
    window.alarmCount = 0
    window.Audio = class {
      async play() { window.alarmCount++ }
    }
  })
  await page.route('https://station.wolfx.jp/data.json*', route => route.fulfill({ json: { temperature: 18, usv: radiation, usv_avg: 'Infinity' } }))
  await page.route('https://station.wolfx.jp/data_seis.json*', route => route.fulfill({ json: {} }))
  await page.clock.install()
  await page.goto('/geiger/')
  await expect(page.locator('#temp')).toHaveText('18.0')
  await expect(page.locator('#rad')).toHaveText('--')
  await expect(page.locator('#radavg')).toHaveText('--')
  expect(await page.evaluate(() => window.alarmCount)).toBe(0)
  radiation = 2
  await page.clock.fastForward(5000)
  await expect(page.locator('#rad')).toHaveText('2.00 μSv/h')
  expect(await page.evaluate(() => window.alarmCount)).toBe(1)
  radiation = 3
  await page.clock.fastForward(5000)
  await expect(page.locator('#rad')).toHaveText('3.00 μSv/h')
  expect(await page.evaluate(() => window.alarmCount)).toBe(1)
})

test('network diagnostics require a click and recover when the browser has no WebRTC', async ({ page }) => {
  const external = []
  await page.addInitScript(() => Object.defineProperty(window, 'RTCPeerConnection', { value: undefined }))
  await page.route('https://api.wolfx.jp/geoip.php*', (route) => {
    external.push(route.request().url())
    return route.fulfill({ json: { ip: '1.1.1.1' } })
  })
  await page.goto('/ipleak.html')
  expect(external).toEqual([])
  await page.locator('#startBtn').click()
  await expect(page.locator('#statusBox')).toContainText('WebRTC')
  await expect(page.locator('#startBtn')).toBeEnabled()
  expect(external).toEqual(['https://api.wolfx.jp/geoip.php'])
})

test('GeoIP place names are text in both diagnostic layouts', async ({ page }) => {
  const label = 'North <District> & Bay'
  const lookups = []
  await page.route('https://api.wolfx.jp/geoip.php*', (route) => {
    const ip = new URL(route.request().url()).searchParams.get('ip')
    lookups.push(ip)
    return route.fulfill({ json: { ip: ip ?? '1.1.1.1', country_code: 'JP', city: label } })
  })
  await page.addInitScript(() => {
    window.RTCPeerConnection = class {
      createDataChannel() {}
      async createOffer() { return {} }
      async setLocalDescription() {
        this.onicecandidate({ candidate: { type: 'host', address: '10.0.0.10', candidate: 'host' } })
        for (const address of ['100.64.0.1', 'fe90::1', '::', 'ff02::1', '192.0.2.4', '1.1.1.1', '8.8.8.8'])
          this.onicecandidate({ candidate: { type: 'srflx', address, candidate: 'srflx' } })
        this.onicecandidate({ candidate: null })
      }

      close() {}
    }
  })
  await page.goto('/ipleak.html')
  await page.locator('#startBtn').click()
  await expect(page.locator('#startBtn')).toBeEnabled()
  for (const selector of ['#stunTableBody', '#mobileCards']) {
    await expect(page.locator(selector)).toContainText(label)
    await expect(page.locator(`${selector} district`)).toHaveCount(0)
  }
  await expect(page.locator('#statusBox')).toContainText('不同于 HTTPS 出口')
  expect(lookups).toEqual([null, '8.8.8.8'])
})

for (const [scenario, expected] of [
  ['other family', '缺少对应的 HTTPS 地址'],
  ['mainland exit', '可能存在分流'],
  ['one unavailable server', '部分 STUN 服务器'],
]) {
  test(`network diagnostics reports ${scenario} for the observed addresses`, async ({ page }) => {
    await page.route('https://api.wolfx.jp/geoip.php*', (route) => {
      const ip = new URL(route.request().url()).searchParams.get('ip')
      return route.fulfill({ json: { ip: ip ?? '1.1.1.1', country_code: ip ? 'CN' : 'JP' } })
    })
    await page.addInitScript((scenario) => {
      window.RTCPeerConnection = class {
        constructor(config) {
          const isMiWifi = config.iceServers[0].urls.includes('miwifi')
          if (isMiWifi && scenario === 'one unavailable server') throw new Error('Unavailable')
          this.address = '1.1.1.1'
          if (isMiWifi && scenario === 'mainland exit') this.address = '8.8.8.8'
          if (isMiWifi && scenario === 'other family') this.address = '2001:4860:4860::8888'
        }

        createDataChannel() {}
        async createOffer() { return {} }
        async setLocalDescription() {
          this.onicecandidate({ candidate: { type: 'srflx', address: this.address, candidate: 'srflx' } })
          this.onicecandidate({ candidate: null })
        }

        close() {}
      }
    }, scenario)
    await page.goto('/ipleak.html')
    await page.locator('#startBtn').click()
    await expect(page.locator('#statusBox')).toContainText(expected)
    await expect(page.locator('#stunTableBody tr')).toHaveCount(4)
    await expect(page.locator('#startBtn')).toBeEnabled()
  })
}
