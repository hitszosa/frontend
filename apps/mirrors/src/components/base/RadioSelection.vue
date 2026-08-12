<template>
  <div
    role="radiogroup"
    aria-orientation="vertical"
    class="flex flex-col h-full p-2 overflow-y-auto overscroll-contain list-none rounded-lg border border-surface-border bg-page-bg whitespace-nowrap"
  >
    <div v-for="(item, idx) in $props.items" :key="item" role="presentation">
      <!-- biome-ignore lint/a11y/useSemanticElements: the styled button implements the WAI-ARIA roving-tabindex radio pattern. -->
      <button
        type="button"
        role="radio"
        :aria-checked="props.index === idx"
        :tabindex="props.index === idx ? 0 : -1"
        class="w-full rounded-lg p-2 text-left text-muted-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        :class="getButtonStyle(idx)"
        @click="onSelect(item, idx)"
      >
        {{ item }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

const props = defineProps<{
  items: string[]
  index: number
}>()
const emit = defineEmits<{
  'update:index': [item: string, index: number]
}>()

const getButtonStyle = (idx: number) => {
  return idx === props.index
    ? 'bg-surface text-primary ring-1 ring-surface-border'
    : 'hocus:text-surface-fg cursor-pointer'
}

const emitUpdate = () => {
  if (props.items.length === 0) {
    return
  }

  emit('update:index', props.items[0], 0)
}

const onSelect = (item: string, index: number) => {
  emit('update:index', item, index)
}

onMounted(() => {
  emitUpdate()
})
</script>
