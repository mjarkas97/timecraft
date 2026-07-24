<script lang="ts">
  import { entriesStore } from '../stores/entries.svelte'
  import { toTimeInputValue, withTimeOfDay } from '../lib/time'
  import type { TimeEntry } from '../types'

  let { entry, onClose }: { entry: TimeEntry; onClose: () => void } = $props()

  let startValue = $state(toTimeInputValue(entry.start))
  let endValue = $state(entry.end !== null ? toTimeInputValue(entry.end) : '')

  function save() {
    const start = withTimeOfDay(entry.start, startValue)
    const end = entry.end === null ? null : withTimeOfDay(entry.end, endValue)
    entriesStore.updateEntry(entry.id, { start, end })
    onClose()
  }

  function remove() {
    if (confirm('Delete this entry?')) {
      entriesStore.deleteEntry(entry.id)
      onClose()
    }
  }
</script>

<div
  class="backdrop"
  role="button"
  tabindex="0"
  aria-label="Close dialog"
  onclick={onClose}
  onkeydown={(event) => {
    if (event.key === 'Escape' || event.key === 'Enter') onClose()
  }}
>
  <!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
  <div class="modal" onclick={(event) => event.stopPropagation()}>
    <h2>Edit entry</h2>

    <label>
      Start
      <input type="time" bind:value={startValue} />
    </label>

    {#if entry.end !== null}
      <label>
        End
        <input type="time" bind:value={endValue} />
      </label>
    {:else}
      <p class="hint">Still clocked in — clock out first to set an end time.</p>
    {/if}

    <div class="actions">
      <button class="delete" onclick={remove}>Delete</button>
      <div class="spacer"></div>
      <button class="cancel" onclick={onClose}>Cancel</button>
      <button class="save" onclick={save}>Save</button>
    </div>
  </div>
</div>

<style lang="scss">
  @use '../styles/variables' as *;

  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 10;
  }

  .modal {
    width: 100%;
    max-width: 480px;
    background: $color-surface;
    border-radius: $radius-lg $radius-lg 0 0;
    padding: $spacing-lg;
    display: flex;
    flex-direction: column;
    gap: $spacing-md;

    h2 {
      margin: 0;
      font-size: 1.1rem;
    }

    label {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
      font-size: 0.85rem;
      color: $color-text-muted;

      input {
        font: inherit;
        color: $color-text;
        background: $color-surface-alt;
        border: 1px solid $color-border;
        border-radius: $radius-md;
        padding: $spacing-sm;
      }
    }

    .hint {
      font-size: 0.85rem;
      color: $color-text-muted;
      margin: 0;
    }
  }

  .actions {
    display: flex;
    align-items: center;
    gap: $spacing-sm;

    .spacer {
      flex: 1;
    }

    button {
      padding: $spacing-sm $spacing-md;
      border-radius: $radius-md;
    }

    .delete {
      color: $color-accent-active;
    }

    .cancel {
      color: $color-text-muted;
    }

    .save {
      background: $color-accent;
      color: white;
      font-weight: 600;
    }
  }
</style>
