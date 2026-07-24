<script lang="ts">
  import { entriesStore } from '../stores/entries.svelte'
  import { formatClock } from '../lib/time'

  let now = $state(Date.now())

  $effect(() => {
    if (!entriesStore.active) return
    const id = setInterval(() => (now = Date.now()), 1000)
    return () => clearInterval(id)
  })

  const elapsedMs = $derived(entriesStore.active ? now - entriesStore.active.start : 0)

  function toggle() {
    if (entriesStore.active) {
      entriesStore.clockOut()
    } else {
      entriesStore.clockIn()
    }
  }
</script>

<button class="clock-button" class:active={!!entriesStore.active} onclick={toggle}>
  {#if entriesStore.active}
    <span class="label">Clock Out</span>
    <span class="elapsed">{formatClock(elapsedMs)}</span>
  {:else}
    <span class="label">Clock In</span>
  {/if}
</button>

<style lang="scss">
  @use '../styles/variables' as *;

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
  }
</style>
