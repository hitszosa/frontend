<script setup lang="ts">
import { onMounted, ref } from 'vue'

import generatedHelpPages from '@generated/help/help-list.json'

type MirrorStatusItem = {
  name: string
}

const availableHelpCount = ref<number | null>(null)
const totalMirrorCount = ref<number | null>(null)

onMounted(async () => {
  try {
    const response = await fetch('/tunasync_status.json')
    if (!response.ok) {
      throw new Error(`Mirror status request failed with ${response.status}`)
    }

    const mirrors = (await response.json()) as MirrorStatusItem[]
    const helpSet = new Set(generatedHelpPages as string[])

    totalMirrorCount.value = mirrors.length
    availableHelpCount.value = mirrors.filter((mirror) =>
      helpSet.has(mirror.name),
    ).length
  } catch {
    availableHelpCount.value = null
    totalMirrorCount.value = null
  }
})
</script>

<template>
  <span
    class="help-coverage-stat relative inline-flex cursor-help items-center rounded-full border border-surface-border bg-surface px-3 py-1.5 text-sm text-muted-fg"
    aria-live="polite"
    aria-label="文档可用数 / 镜像总数"
    tabindex="0"
  >
    <span class="ui-mono font-medium text-surface-fg">
      {{ availableHelpCount ?? '—' }}
      / {{ totalMirrorCount ?? '—' }} 篇帮助文档
    </span>
    <span
      role="tooltip"
      class="help-coverage-tooltip pointer-events-none absolute top-full left-1/2 z-30 mt-2 -translate-x-1/2 rounded-lg border border-surface-border bg-surface px-2.5 py-1.5 text-xs whitespace-nowrap text-surface-fg opacity-0 shadow-sm transition-opacity"
    >
      文档可用数 / 镜像总数
    </span>
  </span>
</template>

<style scoped>
.help-coverage-stat:hover .help-coverage-tooltip,
.help-coverage-stat:focus-visible .help-coverage-tooltip {
  opacity: 1;
}
</style>
