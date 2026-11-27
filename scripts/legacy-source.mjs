import { execFile } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

export const legacyRoot = resolve(process.env.WOLFX_LEGACY_ROOT || fileURLToPath(new URL('../../wolfx-project', import.meta.url)))
const revision = '8cd8387d334d8301d4f6c9ed7eeb5cc522fd8b42'
const git = promisify(execFile)

export function migrateLegacyContactEmail(value) {
  return value.replaceAll(/(?<![\w.!#$%&'*+/=?^`{|}~@-])contact@mtf\.edu\.kg(?![\w@-]|\.[\w-])/g, 'contact@wolfx.jp')
}

export async function readLegacyFile(filename) {
  try {
    const { stdout } = await git('git', ['show', `${revision}:${filename}`], { cwd: legacyRoot, encoding: 'utf8' })
    return stdout
  }
  catch (cause) {
    throw new Error(`Reading the archived HTML requires revision ${revision} in ${legacyRoot}. Set WOLFX_LEGACY_ROOT to an archived Git checkout.`, { cause })
  }
}
