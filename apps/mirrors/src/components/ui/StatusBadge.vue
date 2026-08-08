<template>
  <span
    class="inline-flex shrink-0 items-center justify-center"
    role="status"
    :aria-label="`Mirror status: ${resolvedStatus}`"
  >
    <span
      class="h-2 w-2 rounded-full sm:hidden"
      :style="dotStyle"
      aria-hidden="true"
    />
    <span
      class="hidden w-[8.8ch] items-center justify-center rounded py-0.5 font-mono text-[11px] font-medium capitalize sm:inline-flex"
      :style="badgeStyle"
      aria-hidden="true"
    >
      {{ status }}
    </span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Status = 'success' | 'syncing' | 'failed' | 'unknown'

const props = defineProps<{
  status: string
}>()

const statusMap: Record<string, Status> = {
  success: 'success',
  syncing: 'syncing',
  failed: 'failed',
}

const resolvedStatus = computed<Status>(
  () => statusMap[props.status] ?? 'unknown',
)

const toneMap = {
  success: { bg: 'var(--ui-success)', fg: 'var(--ui-success)' },
  syncing: { bg: 'var(--ui-info)', fg: 'var(--ui-info-fg)' },
  failed: { bg: 'var(--ui-danger)', fg: 'var(--ui-danger-fg)' },
  unknown: { bg: 'var(--ui-muted-fg)', fg: 'var(--ui-muted-fg)' },
} as const

const badgeStyle = computed(() => {
  const tone = toneMap[resolvedStatus.value]
  return `background: color-mix(in srgb, ${tone.bg} 15%, transparent); color: ${tone.fg};`
})

const dotStyle = computed(
  () => `background-color: ${toneMap[resolvedStatus.value].bg};`,
)
</script>
