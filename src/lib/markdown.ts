import { remark } from 'remark'
import html from 'remark-html'
import { rehype } from 'rehype'
import rehypePrettyCode, { type Options } from 'rehype-pretty-code'

const prettyCodeOptions: Options = {
  theme: 'github-dark-default',
  keepBackground: true,
}

export async function markdownToHtml(markdown: string): Promise<string> {
  const result = await remark().use(html, { sanitize: false }).process(markdown)

  const htmlContent = result.toString()

  // Process with rehype for syntax highlighting
  const processedHtml = await rehype()
    .use(rehypePrettyCode, prettyCodeOptions)
    .process(htmlContent)

  return processedHtml.toString()
}
