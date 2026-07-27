<script lang="ts">
  import { projectsStore } from '../stores/projects.svelte'

  let newName = $state('')

  function add() {
    const name = newName.trim()
    if (!name) return
    projectsStore.create(name)
    newName = ''
  }

  function remove(id: string) {
    if (confirm('Delete this project? Its entries stay, just become uncategorized.')) {
      projectsStore.delete(id)
    }
  }
</script>

<div class="project-manager">
  <h2>Projects</h2>

  {#if projectsStore.projects.length > 0}
    <ul>
      {#each projectsStore.projects as project (project.id)}
        <li>
          <input
            type="color"
            value={project.color}
            onchange={(event) => projectsStore.update(project.id, { color: event.currentTarget.value })}
          />
          <input
            type="text"
            value={project.name}
            onchange={(event) => projectsStore.update(project.id, { name: event.currentTarget.value })}
          />
          <button class="delete" onclick={() => remove(project.id)}>Delete</button>
        </li>
      {/each}
    </ul>
  {/if}

  <form
    onsubmit={(event) => {
      event.preventDefault()
      add()
    }}
  >
    <input type="text" placeholder="New project name" bind:value={newName} />
    <button type="submit">Add</button>
  </form>
</div>

<style lang="scss">
  @use '../styles/variables' as *;

  .project-manager {
    margin-top: $spacing-lg;

    h2 {
      font-size: 0.9rem;
      font-weight: 600;
      color: $color-text-muted;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0 0 $spacing-sm;
    }
  }

  ul {
    list-style: none;
    margin: 0 0 $spacing-sm;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  li {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-xs $spacing-sm;
    background: $color-surface;
    border-radius: $radius-md;

    input[type='color'] {
      width: 28px;
      height: 28px;
      padding: 0;
      border: none;
      border-radius: $radius-md;
      background: none;
    }

    input[type='text'] {
      flex: 1;
      font: inherit;
      color: $color-text;
      background: none;
      border: none;
    }

    .delete {
      color: $color-accent-active;
      font-size: 0.85rem;
    }
  }

  form {
    display: flex;
    gap: $spacing-xs;

    input {
      flex: 1;
      font: inherit;
      color: $color-text;
      background: $color-surface;
      border: 1px solid $color-border;
      border-radius: $radius-md;
      padding: $spacing-sm;
    }

    button {
      padding: $spacing-sm $spacing-md;
      border-radius: $radius-md;
      background: $color-accent;
      color: white;
      font-weight: 600;
    }
  }
</style>
