<script lang="ts">
  import { handleFirstTab } from '../../utils/focus'
  import { onMount } from 'svelte'
  onMount(() => {
    window.addEventListener('keydown', handleFirstTab)
  })
</script>

<style global type="text/postcss">
  body:not(.user-is-tabbing) button:focus,
  body:not(.user-is-tabbing) input:focus,
  body:not(.user-is-tabbing) select:focus,
  body:not(.user-is-tabbing) textarea:focus {
    outline: none !important;
  }
  body.user-is-tabbing button:focus {
    outline: none !important;
    box-shadow: 0 0 0 4px #0ea5e9;
  }
  body.user-is-tabbing button.disabled:focus {
    outline: none !important;
    box-shadow: none;
  }
</style>
