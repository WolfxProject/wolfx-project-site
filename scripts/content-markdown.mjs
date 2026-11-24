import remarkGfm from 'remark-gfm'
import remarkMdc, { parseFrontMatter } from 'remark-mdc'
import remarkParse from 'remark-parse'
import { unified } from 'unified'

const parser = unified().use(remarkParse).use(remarkGfm).use(remarkMdc)

export function parsePage(markdown) {
  const { data, content } = parseFrontMatter(markdown)
  return { data, tree: parser.parse(content) }
}
