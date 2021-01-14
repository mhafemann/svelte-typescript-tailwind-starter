<script lang="ts">
  import Tailwindcss from "../../Tailwindcss.svelte"
  export let visible: boolean = false
  export let duration: string = '0.3s'
</script>
<Tailwindcss />


<div class="h-full overflow-hidden">
  <div class="w-full h-full overflow-hidden flex relative">
    <div
      class="absolute top-0 right-0 bottom-0 left-0 transition-transform"
      style="transition-duration: {duration};"
      class:slide-right={!visible}
      class:visible>
      <slot></slot>
      <slot name="left"></slot>
    </div>
    <div
      class="absolute top-0 right-0 bottom-0 left-0 transition-transform"
      style="transition-duration: {duration};"
      class:slide-left={visible}
      class:visible={!visible}>
      <slot name="right"></slot>
    </div>
  </div>
</div>


<style>
  .slide-right {
    transform: translateX(-100%);
  }
  .visible {
    transform: translateX(0%);
  }
  .slide-left {
    transform: translateX(100%);
  }
  .visible {
    transform: translateX(0%);
  }
</style>