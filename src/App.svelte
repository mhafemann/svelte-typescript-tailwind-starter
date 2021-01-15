<script lang="ts">
  import Tailwindcss from './Tailwindcss.svelte'

  // prettier-ignore
  import { ThemeToggle, SideBar, Typography, TabManager} from './components/index'
  import { ButtonsTest, CodeTest, TypographyTest, Layout, Header } from './site/index'

  const navItems = [
    { type: 'heading', text: 'utilities' },
    { type: 'link', text: 'Typography', component: TypographyTest },
    { type: 'link', text: 'Layouts' },
    { type: 'heading', text: 'components' },
    { type: 'link', text: 'Buttons', component: ButtonsTest },
    { type: 'link', text: 'Code', component: CodeTest },
  ]
  let active = 5
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
</style>
