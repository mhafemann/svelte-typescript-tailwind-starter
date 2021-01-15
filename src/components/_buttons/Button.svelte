<script lang="ts">
  export let id
  export let color = ''
  export let hasIcon = false
</script>

<!-- prettier-ignore -->
<button 
  id={id}
  class="font-semibold uppercase text-sm font-sans p-2 rounded outline-none focus:outline-none mb-0" type="button" style="transition: all .15s ease"
  class:btn-blue={color === 'blue'}
  class:btn-red={color === 'red'}
  class:btn-yellow={color === 'yellow'}
  class:px-4={!hasIcon}
  on:click>
  <slot></slot>
</button>

<style global type="text/postcss">
  .btn-blue {
    @apply bg-blue-500 text-white;
  }
  .btn-blue:active {
    @apply bg-blue-600;
  }
  .btn-red {
    @apply bg-red-500 text-white;
  }
  .btn-red:active {
    @apply bg-red-600;
  }
  .btn-yellow {
    @apply bg-yellow-500 text-white;
  }
  .btn-yellow:active {
    @apply bg-yellow-600;
  }
  button svg {
    width: 24px;
    height: 24px;
  }
</style>
