<!-- prettier-ignore -->
<div class="flex-1 app-grid">
  <div class="sidebar bg-white dark:bg-gray-800 tr-200">
    <slot name="nav"/>
  </div>
  <main class=" bg-gray-100 dark:bg-gray-900 tr-200">
    <slot name="main"/>
  </main>
</div>

<style type="text/postcss">
  .app-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 3rem;
    gap: 0;
  }
  .sidebar {
    grid-area: 2 / 1 / 3 / 2;
  }
  main {
    grid-area: 1 / 1 / 2 / 2;
  }
  @media (min-width: 768px) {
    .app-grid {
      grid-template-columns: auto 1fr;
      grid-template-rows: 1fr;
    }
    .sidebar {
      grid-area: 1 / 1 / 2 / 2;
    }
    main {
      grid-area: 1 / 2 / 2 / 3;
    }
  }
</style>
