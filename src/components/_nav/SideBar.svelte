<script lang="ts">
  export let active: number = 1
  export let navItems = []
</script>

<!-- prettier-ignore -->
<nav class="h-12 md:h-full overflow-y-auto md:px-12 md:pt-12 ">
<div class="flex flex-col h-full">
  <div class="flex-1">
  <ul>
    {#if navItems[0] != undefined}
      {#each navItems as item, i}
        <li class="my-px">
          {#if item.type === 'heading'}
            <span
              class="text-gray-700 dark:text-gray-300 text-sm uppercase font-semibold tracking-wider block pb-2 no-underline tr-200 select-none">
              {item.text}
            </span>
          {:else}
            <a
              href={null}
              class="text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 text-sm block mb-2 no-underline cursor-pointer tr-200 uppercase pl-2 select-none leading-none tracking-wider link"
              class:active={active === i}
              on:click={() => (active = i)}>
              {item.text}
            </a>
          {/if}
        </li>
      {/each}
    {:else}
      <li class="my-px">
        <div
          class="text-gray-700 dark:text-gray-300 text-sm uppercase font-semibold tracking-wide block pb-2 no-underline tr-200">
          Loading...
        </div>
        <div class="linear-background h-6 mx-4" />
      </li>
    {/if}
  </ul>
  </div>
  <div class="h-12 hidden md:block">
    <slot></slot>
  </div>
</div>

</nav>

<style global type="text/postcss">
  .link {
    border-left: 4px solid transparent;
  }
  .link.active {
    color: #ef4444 !important;
    border-left-color: #ef4444;
  }
</style>
