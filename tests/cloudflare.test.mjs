import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { test } from 'node:test'
import worker from '../worker/index.ts'

test('the default Workers Builds command produces a release that passes the static site checks', () => {
  const options = { env: { ...process.env, WORKERS_CI: '1' }, stdio: 'inherit' }
  execFileSync(process.execPath, ['--run', 'build'], options)
  execFileSync(process.execPath, ['--run', 'check'], options)
})

test('a failure to fetch the static 404 page retains the Assets error response', async () => {
  const ASSETS = {
    fetch(request) {
      assert.equal(new URL(request.url).pathname, '/404')
      return new Response('Asset service unavailable', { status: 503 })
    },
  }
  const response = await worker.fetch(new Request('https://wolfx.jp/missing'), { ASSETS })
  assert.equal(response.status, 503)
  assert.equal(await response.text(), 'Asset service unavailable')
})
