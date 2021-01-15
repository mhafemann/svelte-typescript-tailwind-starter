<script lang="ts">
  import { onMount } from 'svelte'
  import { theme } from './stores'

  function toggleTheme(): void {
    const t = $theme === 'dark' ? theme.set('light') : theme.set('dark')
    // @ts-ignore
    document.body.className = $theme
  }

  // prettier-ignore
  function getUserThemePreference(): void {
    const prefersDark = window.matchMedia && 
      window.matchMedia('(prefers-color-schemprefersDark)').matches ?
      theme.set('dark') :
      theme.set('light')
  }

  // Immediately invoked function to set the theme on mounting of the component.
  // prettier-ignore
  onMount(async () => {
    
    const t = !$theme ? 
      getUserThemePreference() : 
      // @ts-ignore
      document.body.className = $theme
  })
</script>

<!-- prettier-ignore -->
<button
  data-message="Toggle dark mode"
  aria-pressed={$theme === 'dark'}
  on:click={toggleTheme}
  class="w-8 h-8 m-0 p-0 rounded dark:border-gray-600 flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-700 tr-200 text-blue-500 dark:text-yellow-400">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill="currentColor"
    viewBox="0 0 256 256"
    style="--darkreader-inline-fill:#000000">
    <path fill="none" style="--darkreader-inline-fill:none" d="M0 0h256v256H0z" />
    <circle cx="128" cy="128" r="68" />
    <path
      d="M128 44a8 8 0 008-8V16a8 8 0 00-16 0v20a8 8 0 008 8zM57.29 68.603A8 8 0 1068.603 57.29L54.461 43.147a8 8 0 10-11.314 11.314zM44 128a8 8 0 00-8-8H16a8 8 0 000 16h20a8 8 0 008-8zM57.29 187.397l-14.143 14.142a8 8 0 1011.314 11.314l14.142-14.143a8 8 0 10-11.313-11.313zM128 212a8 8 0 00-8 8v20a8 8 0 0016 0v-20a8 8 0 00-8-8zM198.71 187.397a8 8 0 10-11.313 11.313l14.142 14.143a8 8 0 1011.314-11.314zM240 120h-20a8 8 0 000 16h20a8 8 0 000-16zM193.054 70.946a7.975 7.975 0 005.656-2.343l14.143-14.142a8 8 0 10-11.314-11.314L187.397 57.29a8 8 0 005.657 13.656z"/>
  </svg>
</button>

<style>
  :global(body:not(.user-is-tabbing) button:focus, body:not(.user-is-tabbing) input:focus, body:not(.user-is-tabbing)
      select:focus, body:not(.user-is-tabbing) textarea:focus) {
    outline: none;
  }
  :global(body.user-is-tabbing button:focus) {
    outline: none;
    box-shadow: 0 0 0 4px #0ea5e9;
  }
  :global(body.user-is-tabbing button.disabled:focus) {
    outline: none;
    box-shadow: none;
  }
</style>
