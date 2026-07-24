<script lang="ts">
  import { entriesStore } from '../stores/entries.svelte'
  import { entryDurationMs, formatHoursMinutes, formatTimeOfDay } from '../lib/time'
  import type { TimeEntry } from '../types'
  import EntryEditModal from './EntryEditModal.svelte'

  let view = $state<'today' | 'week'>('today')
  let editingEntry = $state<TimeEntry | null>(null)

  const entries = $derived(view === 'today' ? entriesStore.todayEntries : entriesStore.weekEntries)
</script>

<div class="entry-list">
  <div class="tabs">
    <button class:active={view === 'today'} onclick={() => (view = 'today')}>Today</button>
    <button class:active={view === 'week'} onclick={() => (view = 'week')}>This week</button>
  </div>

  {#if entries.length === 0}
    <p class="empty">No entries yet {view === 'today' ? 'today' : 'this week'} — tap the button to clock in.</p>
  {:else}
    <ul>
      {#each entries as entry (entry.id)}
        <li>
          <button class="entry-row" onclick={() => (editingEntry = entry)}>
            <span class="range">
              {formatTimeOfDay(entry.start)} – {entry.end ? formatTimeOfDay(entry.end) : 'now'}
            </span>
            <span class="duration">{formatHoursMinutes(entryDurationMs(entry, Date.now()))}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

{#if editingEntry}
  <EntryEditModal entry={editingEntry} onClose={() => (editingEntry = null)} />
{/if}

<style lang="scss">
  @use '../styles/variables' as *;

  .entry-list {
    flex: 1;
  }

  .tabs {
    display: flex;
    gap: $spacing-xs;
    margin-bottom: $spacing-sm;

    button {
      flex: 1;
      padding: $spacing-xs $spacing-sm;
      border-radius: $radius-md;
      color: $color-text-muted;
      background: $color-surface;

      &.active {
        color: $color-text;
        background: $color-surface-alt;
        font-weight: 600;
      }
    }
  }

  .empty {
    color: $color-text-muted;
    text-align: center;
    padding: $spacing-lg $spacing-md;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
  }

  .entry-row {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-sm $spacing-md;
    background: $color-surface;
    border-radius: $radius-md;

    .range {
      color: $color-text;
    }

    .duration {
      color: $color-text-muted;
      font-variant-numeric: tabular-nums;
    }
  }
</style>
