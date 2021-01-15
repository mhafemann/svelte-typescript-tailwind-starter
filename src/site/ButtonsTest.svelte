<script lang="ts">
  import { Button } from '../components/index'

  // prettier-ignore
  let buttons = [
    { text: 'Button 1', color: 'blue' }, 
    { text: 'Button 2', color: 'red' },
    { text: 'Button 3', color: 'yellow'},
  ]
  let iconButtons = [
    {
      text: 'Button 1',
      color: 'blue',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /> </svg>`,
    },
    {
      text: 'Button 1',
      color: 'red',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /> </svg>`,
    },
    {
      text: 'Button 1',
      color: 'yellow',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" /> </svg>`,
    },
  ]
</script>

<!-- prettier-ignore -->
<div class="flex items-center">
  <div class="container">
      <h2 class="h2">Small Filled</h2>
      <div class="flex mb-4">
        {#each buttons as btn, i}
          <span class="mr-4">
            <Button id={i} color={btn.color}>
              {btn.text}
            </Button>
          </span>
        {/each}
      </div>
      <h2 class="h2">Icon Buttons</h2>
      <div class="flex">
        {#each iconButtons as btn, i}
          <span class="mr-4">
            <Button id={i} color={btn.color} hasIcon={true}>
              {@html btn.icon}
            </Button>
          </span>
        {/each}
      </div>
  </div>
</div>

<style type="text/postcss">
</style>
