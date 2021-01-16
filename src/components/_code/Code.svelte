<script lang="ts">
  import { strToLines } from '../../utils/regex_patterns'
  import Prism from 'prismjs'
  import 'prism-svelte'
  export let source = ''
  export let lang = 'html'

  // prettier-ignore
  const svelteLang = Prism.languages.svelte
  const html = Prism.languages.html
  const css = Prism.languages.css

  const highlighted =
    lang === 'html'
      ? Prism.highlight(source, html, 'html')
      : lang === 'css'
      ? Prism.highlight(source, css, 'css')
      : Prism.highlight(source, svelteLang, 'svelte')

  const lines = strToLines(source)
</script>

<!-- prettier-ignore -->
<div class="text-xs overflow-auto leading-6 font-mono rounded bg-gray-100 dark:bg-gray-800 tr-200 mb-4 pt-4 pr-4 pb-4 text-gray-700 dark:text-gray-300">
  <div class="w-80">
    <div class="flex h-full">
      <div class="w-12 h-full text-xs leading-6 flex flex-col justify-center text-gray-600 dark:text-gray-400">
        {#each lines as l, i}
          <div class="flex justify-center select-none w-12 tr-200">
            {i + 1}
          </div>
        {/each}
      </div>
      <div class="px-2">
        <pre>
          <code>
            {@html highlighted || ""}
          </code>
        </pre>
      </div>
    </div>
  </div>
  </div>
