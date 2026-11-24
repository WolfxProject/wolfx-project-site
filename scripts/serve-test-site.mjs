import { readFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { fileURLToPath } from 'node:url'
import sirv from 'sirv'

const root = new URL('../.output/public/', import.meta.url)
const notFound = await readFile(new URL('404.html', root))
createServer(sirv(fileURLToPath(root), {
  single: false,
  onNoMatch(_request, response) {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    response.end(notFound)
  },
})).listen(4381, '127.0.0.1')
