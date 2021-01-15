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
<div class="text-sm leading-6 font-mono rounded-md bg-gray-800 mb-4 p-6 text-gray-300">
    <pre>
      <code>
        {@html highlighted || ""}
      </code>
    </pre>
</div>
