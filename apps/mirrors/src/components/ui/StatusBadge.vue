<template>
  <span
    class="inline-flex w-[8.8ch] shrink-0 items-center justify-center rounded py-0.5 font-mono text-[11px] font-medium capitalize"
    :style="badgeStyle"
  >
    {{ status }}
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
</script>
