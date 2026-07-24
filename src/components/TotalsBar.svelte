<script lang="ts">
  import { entriesStore } from '../stores/entries.svelte'
  import { totalDurationMs, formatHoursMinutes } from '../lib/time'

  let now = $state(Date.now())

  $effect(() => {
    if (!entriesStore.active) return
    const id = setInterval(() => (now = Date.now()), 1000)
    return () => clearInterval(id)
  })

  const todayTotal = $derived(totalDurationMs(entriesStore.todayEntries, now))
  const weekTotal = $derived(totalDurationMs(entriesStore.weekEntries, now))
</script>

<div class="totals-bar">
  <div class="stat">
    <span class="value">{formatHoursMinutes(todayTotal)}</span>
    <span class="caption">Today</span>
  </div>
  <div class="stat">
    <span class="value">{formatHoursMinutes(weekTotal)}</span>
    <span class="caption">This week</span>
  </div>
</div>

<style lang="scss">
  @use '../styles/variables' as *;

  .totals-bar {
    display: flex;
    justify-content: center;
    gap: $spacing-lg;
    padding: $spacing-md;
  }

  .stat {
    display: flex;
    flex-direction: column;
    align-items: center;

    .value {
      font-size: 1.5rem;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
    }

    .caption {
      font-size: 0.8rem;
      color: $color-text-muted;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  }
</style>
