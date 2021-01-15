<!--<script lang="ts">
</script>-->

<!-- prettier-ignore -->
<div class="col-grid flex-1">
  <div class="h-full bg-white dark:bg-gray-800 sidebar px-4 md:p-4 flex items-center md:items-start tr-200">
    <slot name="sidebar"/>
  </div>
  <div class="h-full bg-gray-100 dark:bg-gray-900 body p-4 tr-200 overflow-y-auto">
    <slot name="content"/>
  </div>
</div>

<style type="text/postcss">
  .col-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 3rem;
    gap: 0;
  }
  .sidebar {
    grid-area: 2 / 1 / 3 / 2;
  }
  .body {
    grid-area: 1 / 1 / 2 / 2;
  }
  @media (min-width: 768px) {
    .col-grid {
      display: grid;
      grid-template-columns: minmax(200px, 300px) 1fr;
      grid-template-rows: 1fr;
      gap: 0;
    }
    .sidebar {
      grid-area: 1 / 1 / 2 / 2;
    }
    .body {
      grid-area: 1 / 2 / 2 / 3;
    }
  }
</style>
