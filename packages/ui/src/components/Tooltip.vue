<script setup lang="ts">
import { onUnmounted, ref, useId } from 'vue'

const {
  content,
  placement = 'bottom',
  align = 'center',
  delay = 500,
} = defineProps<{
  content: string
  placement?: 'top' | 'bottom'
  align?: 'center' | 'start'
  delay?: number
}>()

const tooltipId = useId()
const isVisible = ref(false)
const isHovered = ref(false)
const isFocused = ref(false)
let showTimer: ReturnType<typeof setTimeout> | undefined
let touchTimer: ReturnType<typeof setTimeout> | undefined

const clearShowTimer = () => {
  if (showTimer === undefined) return
  clearTimeout(showTimer)
  showTimer = undefined
}

const clearTouchTimer = () => {
  if (touchTimer === undefined) return
  clearTimeout(touchTimer)
  touchTimer = undefined
}

const updateVisibility = () => {
  clearShowTimer()
  if (!isHovered.value && !isFocused.value) {
    isVisible.value = false
    return
  }
  showTimer = setTimeout(() => {
    isVisible.value = true
    showTimer = undefined
  }, delay)
}

const onMouseEnter = () => {
  isHovered.value = true
  updateVisibility()
}

const onMouseLeave = () => {
  isHovered.value = false
  updateVisibility()
}

const onFocusIn = () => {
  isFocused.value = true
  updateVisibility()
}

const onFocusOut = (event: FocusEvent) => {
  const currentTarget = event.currentTarget
  if (
    currentTarget instanceof HTMLElement &&
    event.relatedTarget instanceof Node &&
    currentTarget.contains(event.relatedTarget)
  ) {
    return
  }
  isFocused.value = false
  updateVisibility()
}

const onTouchStart = () => {
  clearShowTimer()
  clearTouchTimer()
  isVisible.value = true
  touchTimer = setTimeout(() => {
    if (!isHovered.value && !isFocused.value) isVisible.value = false
    touchTimer = undefined
  }, 2500)
}

onUnmounted(() => {
  clearShowTimer()
  clearTouchTimer()
})
</script>

<template>
  <span
    class="relative inline-flex cursor-help"
    tabindex="0"
    :aria-describedby="tooltipId"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @focusin="onFocusIn"
    @focusout="onFocusOut"
    @touchstart.passive="onTouchStart"
  >
    <slot />
    <span
      :id="tooltipId"
      role="tooltip"
      :class="[
        'pointer-events-none absolute z-30 w-max max-w-64 rounded-lg border border-surface-border bg-surface px-2.5 py-1.5 text-center text-xs text-surface-fg shadow-sm transition-opacity',
        align === 'start' ? 'left-0' : 'left-1/2 -translate-x-1/2',
        isVisible ? 'opacity-100' : 'opacity-0',
        placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
      ]"
    >
      {{ content }}
    </span>
  </span>
</template>
