<script lang="ts">
  import Tailwindcss from "./Tailwindcss.svelte"
  import NavBar from "./components/navbar/NavBar.svelte"
  import ThemeToggleBtn from './components/theme_toggle/ThemeToggleBtn.svelte'
  import {theme} from './components/theme_toggle/index.js'
</script>
<Tailwindcss />

<main class:dark={$theme === 'dark'} class="w-full h-full">
  <div
    class="nav bg-gray-200 dark:bg-gray-800 dark:text-gray-100 transition-colors duration-150">
    <NavBar>
      <span slot="left">
      <div class="flex">
      </div>
      </span>
      <span slot="right">
        <ThemeToggleBtn/>
      </span>
    </NavBar>
  </div>
  <div
    class="body bg-gray-100 dark:bg-gray-900 transition-colors duration-150 text-gray-700 dark:text-gray-200">
  </div>
  <div
    class="footer bg-gray-100 dark:bg-gray-900 dark:text-gray-100 transition-colors duration-150" />
</main>

<style>
  main {
    display: grid;
    grid-template-columns: 10rem 1fr 10rem;
    grid-template-rows: 3rem 1fr 2.5rem;
    grid-column-gap: 0px;
    grid-row-gap: 0px;
  }
  .nav {
    grid-area: 1 / 1 / 2 / 4;
  }
  .body {
    grid-area: 2 / 1 / 3 / 4;
    overflow-y: auto;
  }
  .footer {
    grid-area: 3 / 1 / 4 / 4;
  }
</style>