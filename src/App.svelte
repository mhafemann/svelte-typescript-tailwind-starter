<script lang="ts">
  import Tailwindcss from './Tailwindcss.svelte'

  // prettier-ignore
  import { ThemeToggle, SideBar, Typography, TabManager, Sandbox } from './components/index'
  import { ButtonsTest, CodeTest, TypographyTest, Layout, Header } from './site/index'

  const navItems = [
    { type: 'heading', text: 'utilities' },
    { type: 'link', text: 'Typography', component: TypographyTest },
    { type: 'heading', text: 'components' },
    { type: 'link', text: 'Buttons', component: ButtonsTest },
    { type: 'link', text: 'Code', component: CodeTest },
    { type: 'link', text: 'Sandbox', component: Sandbox },
  ]
  let active = 4
</script>

<Tailwindcss />
<Typography />
<TabManager />

<!-- prettier-ignore -->
<main class="flex flex-col h-full w-full">
<Layout>
  <div slot="nav" style="height: 100%">
    <SideBar navItems={navItems} bind:active>
      
    </SideBar>
  </div>
  <span slot="main">
    <Header title={navItems[active].text}>
        <ThemeToggle/>
    </Header>
    <svelte:component this={navItems[active].component}/>
  </span>
</Layout>
  
</main>

<style global type="text/postcss">
  .tr-200 {
    @apply transition-colors duration-200;
  }
  .box-shadow {
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 1);
  }
</style>
