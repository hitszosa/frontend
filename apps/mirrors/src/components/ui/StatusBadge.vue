<template>
  <Tooltip :content="resolvedStatus" placement="top" align="start">
    <span
      class="inline-flex shrink-0 items-center justify-center"
      role="status"
      :aria-label="`Mirror status: ${resolvedStatus}`"
    >
      <span
        class="h-2 w-2 rounded-full sm:hidden"
        :class="resolvedStatus === 'syncing' && 'status-breathe'"
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
  </Tooltip>
</template>

<script setup lang="ts">
import Tooltip from '@hitszosa/ui/components/Tooltip.vue'
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

<style scoped>
@keyframes status-breathe {
  0%,
  100% {
    opacity: 0.55;
    box-shadow: 0 0 0 color-mix(in srgb, var(--ui-info) 0%, transparent);
  }

  50% {
    opacity: 1;
    box-shadow: 0 0 0.45rem color-mix(in srgb, var(--ui-info) 75%, transparent);
  }
}

.status-breathe {
  animation: status-breathe 1.6s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .status-breathe {
    animation: none;
  }
}
</style>
