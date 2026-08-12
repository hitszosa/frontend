<script setup lang="ts">
import { onMounted, ref } from 'vue'

import generatedHelpPages from '@generated/help/help-list.json'
import Tooltip from '@hitszosa/ui/components/Tooltip.vue'

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
  <Tooltip
    class="help-coverage-stat items-center rounded-full border border-surface-border bg-surface px-3 py-1.5 text-sm text-muted-fg"
    content="有帮助文档的镜像数 / 镜像总数"
    aria-live="polite"
    aria-label="有帮助文档的镜像数 / 镜像总数"
  >
    <span class="ui-mono font-medium text-surface-fg">
      {{ availableHelpCount ?? '-' }}
      / {{ totalMirrorCount ?? '-' }} 个镜像有帮助文档
    </span>
  </Tooltip>
</template>
