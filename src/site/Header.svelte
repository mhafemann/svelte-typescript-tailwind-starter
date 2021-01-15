<script lang="ts">
  export let title = ''
</script>

<!-- prettier-ignore -->
<header class="flex items-center py-6">
  <div class="flex justify-between items-center container">
    <h1 class="title">
      {title}
    </h1>
    <slot></slot>
  </div>
</header>

<!--<style type="text/postcss">
</style>-->
