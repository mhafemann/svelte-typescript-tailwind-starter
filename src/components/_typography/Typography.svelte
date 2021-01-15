<style global type="text/postcss">
  /* prettier-ignore */
  .title, .h1, .h2, .p, .small {
    @apply transition-colors duration-200;
  }
  .title {
    @apply font-sans text-xxl text-gray-800 font-bold;
  }
  .h1,
  .h2 {
    @apply font-mono text-gray-800;
  }
  .h1 {
    @apply text-xl;
  }
  .h2 {
    @apply text-lg;
  }
  .p {
    @apply font-sans font-normal text-md text-gray-700;
  }
  .small {
    @apply text-sm text-gray-500;
  }
  .dark .title,
  .dark .h1,
  .dark .h2 {
    @apply text-gray-200;
  }
  .dark .p {
    @apply text-gray-400;
  }
  .dark .small {
    @apply text-gray-500;
  }
</style>
