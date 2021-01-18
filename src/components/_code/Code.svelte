<script lang="ts">
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
</script>

<!-- prettier-ignore -->
<div class="rounded-lg overflow-hidden  text-xs leading-5 font-mono">
  <div class="code-grid bg-white dark:bg-gray-800 tr-200">
    <div class="code-grid-child">
      <div class="flex h-full">

          <!-- CODE -->
          <pre class="p-4 text-gray-600 dark:text-gray-300 tr-200">
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
