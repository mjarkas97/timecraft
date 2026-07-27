<script lang="ts">
  import { entriesStore } from '../stores/entries.svelte'
  import { projectsStore } from '../stores/projects.svelte'
  import { formatClock } from '../lib/time'

  let now = $state(Date.now())
  let selectedProject = $state('')
  let pending = $state(false)

  $effect(() => {
    if (!entriesStore.active) return
    const id = setInterval(() => (now = Date.now()), 1000)
    return () => clearInterval(id)
  })

  const elapsedMs = $derived(entriesStore.active ? now - entriesStore.active.start : 0)
  const activeProject = $derived(projectsStore.get(entriesStore.active?.project ?? null))

  async function toggle() {
    if (pending) return
    pending = true
    try {
      if (entriesStore.active) {
        await entriesStore.clockOut()
      } else {
        await entriesStore.clockIn(selectedProject || null)
      }
    } catch (err) {
      console.error(err)
      alert((err as Error).message)
    } finally {
      pending = false
    }
  }
</script>

{#if !entriesStore.active && projectsStore.projects.length > 0}
  <select class="project-select" bind:value={selectedProject}>
    <option value="">No project</option>
    {#each projectsStore.projects as project (project.id)}
      <option value={project.id}>{project.name}</option>
    {/each}
  </select>
{/if}

<button class="clock-button" class:active={!!entriesStore.active} disabled={pending} onclick={toggle}>
  {#if entriesStore.active}
    <span class="label">Clock Out</span>
    <span class="elapsed">{formatClock(elapsedMs)}</span>
    {#if activeProject}
      <span class="project">{activeProject.name}</span>
    {/if}
  {:else}
    <span class="label">Clock In</span>
  {/if}
</button>

<style lang="scss">
  @use '../styles/variables' as *;

  .project-select {
    display: block;
    margin: 0 auto;
    font: inherit;
    color: $color-text;
    background: $color-surface;
    border: 1px solid $color-border;
    border-radius: $radius-md;
    padding: $spacing-xs $spacing-sm;
  }

  .clock-button {
    width: 200px;
    height: 200px;
    border-radius: $radius-full;
    background: $color-accent;
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-xs;
    margin: $spacing-lg auto;
    transition:
      background $transition,
      transform $transition;

    &:active {
      transform: scale(0.97);
    }

    &.active {
      background: $color-accent-active;
    }

    .label {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .elapsed {
      font-variant-numeric: tabular-nums;
      font-size: 1rem;
      opacity: 0.9;
    }

    .project {
      font-size: 0.8rem;
      opacity: 0.85;
    }
  }
</style>
