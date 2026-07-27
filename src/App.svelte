<script lang="ts">
  import ClockButton from './components/ClockButton.svelte'
  import TotalsBar from './components/TotalsBar.svelte'
  import EntryList from './components/EntryList.svelte'
  import ProjectManager from './components/ProjectManager.svelte'
</script>

<main>
  <header>
    <h1>Timecraft</h1>
  </header>

  <ClockButton />
  <TotalsBar />
  <EntryList />
  <ProjectManager />
</main>

<style lang="scss">
  @use './styles/variables' as *;

  main {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: $spacing-md;
  }

  header {
    text-align: center;

    h1 {
      font-size: 1.1rem;
      font-weight: 600;
      color: $color-text-muted;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin: $spacing-md 0 0;
    }
  }
</style>
