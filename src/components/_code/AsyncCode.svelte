<script lang="ts">
  import { strToLines } from '../../utils/regex_patterns'
  import { getData } from '../../utils/fetch'
  import Prism from 'prismjs'
  import 'prism-svelte'
  import { onMount } from 'svelte'

  onMount(async () => {
    res = await getData(url)
    let text = await res.text
    if (text) {
      highlighted = highlight(text)
      lines = strToLines(source)
    }
  })

  export let source = ''
  export let lang = 'html'
  export let url = 'http://localhost:3000/code'

  // prettier-ignore
  const svelteLang = Prism.languages.svelte
  const html = Prism.languages.html
  const css = Prism.languages.css

  let highlighted = ''
  let res

  let lines = []

  function highlight(src) {
    let code =
      lang === 'html'
        ? Prism.highlight(src, html, 'html')
        : lang === 'css'
        ? Prism.highlight(src, css, 'css')
        : Prism.highlight(src, svelteLang, 'svelte')
    return code
  }

  function getCode() {}
</script>

<!-- {#await res}
  <p>Waiting</p>
{:then data}
  {console.log(data)}
{/await} -->
<!-- prettier-ignore -->
<div class="text-xs overflow-auto leading-6 font-mono rounded-md bg-gray-100 dark:bg-gray-800 tr-200 mb-4 pt-4 pr-4 pb-4 text-gray-700 dark:text-gray-300">
<div class="w-80">
  <div class="flex h-full">
    <div class="w-12 h-full text-xs leading-6 flex flex-col justify-center text-gray-600 dark:text-gray-400">
      {#each lines as l, i}
        <div class="flex justify-center select-none w-12 tr-200">
          {i + 1}
        </div>
      {/each}
    </div>
    <div class="pl-2">
      <pre>
        <code>
          {@html highlighted || ""}
        </code>
      </pre>
    </div>
  </div>
</div>
</div>
