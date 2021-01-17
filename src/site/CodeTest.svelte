<script lang="ts">
  import { Code } from '../components/index'
  // prettier-ignore
  let svelteSource = `<script lang="ts">
  // Title
  export let title = ''
  console.log(title)
<\/script>

<!-- HEADER -->
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
  // console.log()
</script>

<!-- prettier-ignore -->
<div class="flex justify-center">
  <div class="container">
    <Code source={svelteSource} lang="svelte"/>
  </div>
</div>
