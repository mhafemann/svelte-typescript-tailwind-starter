<script lang="ts">
  import Tailwindcss from "../../Tailwindcss.svelte"
</script>
<Tailwindcss />

<div class="h-12 flex justify-between items-center px-4">
  <div>
    <slot></slot>
    <slot name="left"></slot>
  </div>
  <slot name="right"></slot>
</div>

<!-- <style>
</style> -->