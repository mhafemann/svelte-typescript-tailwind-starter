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
<div class="rounded-lg overflow-hidden elevation-3 text-xs leading-5 font-mono">
  <div class="code-grid bg-gray-800">
    <div class="code-grid-child">
      <div class="flex h-full">

          <!-- LINE NUMBERS -->
          <div class="h-full w-14 flex flex-col justify-center bg-gray-850 select-none">
            <div class="h-4"/>
            <div class="flex justify-center w-full">
              <div class="flex flex-col justify-center items-center text-gray-500">
                {#each lines as l, i}
                  <div class="w-full text-right">
                    {i + 1}
                  </div>
                {/each}
              </div>
            </div>
            <div class="h-4" />
          </div>

          <!-- CODE -->
          <pre
            class="p-4 text-gray-300">
            <code>
              {@html highlighted || ""}
            </code>
          </pre>

        </div>
    </div>
  </div>
</div>

<style>
  .code-grid {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr;
    align-content: start;
  }
  .code-grid-child {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    grid-auto-flow: column;
    grid-auto-columns: 1fr;
    overflow-x: auto;
    scrollbar-color: #0079d3 #2e3645 !important;
    -webkit-overflow-scrolling: touch;
  }
</style>
