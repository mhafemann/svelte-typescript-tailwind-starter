<script lang="ts">
  import { Code } from '../components/index'
  let cssSource = `code[class*="language-"],
pre[class*="language-"] {
	-moz-tab-size: 4;
	-o-tab-size: 4;
	tab-size: 4;
	-webkit-hyphens: none;
	-moz-hyphens: none;
	-ms-hyphens: none;
	hyphens: none;
	white-space: pre;
	white-space: pre-wrap;
	word-break: break-all;
	word-wrap: break-word;
	line-height: 1.5;
	color: #59ca56;
	text-shadow: 0;
}`
  // prettier-ignore
  let svelteSource = `<script lang="ts">
  export let title = ''
<\/script>

<!-- prettier-ignore -->
<header class="flex items-center py-6">
  <div class="flex justify-between items-center container">
    <h1 class="title" on:click={() => console.log("Hello")}>
      {title}
    </h1>
    <slot></slot>
  </div>
</header>

<style>
  .bg-red {
    background-color: red;
  }
<\/style>`
  let htmlSource = `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset='utf-8'>
  <meta 
    name='viewport' 
    content='width=device-width,initial-scale=1'>
  <title>Svelte TS Tailwind</title>
  <link rel='icon' type='image/png' href='/favicon.png'>
  <link rel='stylesheet' href='/build/bundle.css'>
  <link rel='stylesheet' href='prism-pojoaque.css'>
  <script defer src='/build/bundle.js'><\/script>
</head>
<body>
</body>
</html>`
</script>

<!-- prettier-ignore -->
<div class="flex justify-center">
  <div class="container">
    <h2 class="h2 mb-2">CSS</h2>
    <div class="mb-4">
      <Code source={cssSource} lang="css"/>
    </div>
    <h2 class="h2 mb-2">Svelte</h2>
    <div class="mb-4">
      <Code source={svelteSource} lang="svelte"/>
    </div>
    <h2 class="h2 mb-2">HTML</h2>
    <div class="mb-4">
      <Code source={htmlSource} lang="html"/>
    </div>
  </div>
</div>
