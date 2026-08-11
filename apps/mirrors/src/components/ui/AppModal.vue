<template>
  <Teleport to="body">
    <div
      v-show="modelValue"
      class="fixed inset-0 z-100 flex overscroll-contain items-center justify-center bg-slate-950/60 sm:p-2 backdrop-blur-sm sm:p-4 md:p-8"
      :aria-hidden="modelValue ? undefined : 'true'"
      @click="onBackdropClick"
      @wheel.stop
      @touchmove.stop
    >
      <div
        ref="dialogRef"
        v-bind="$attrs"
        role="dialog"
        :aria-modal="modelValue ? 'true' : undefined"
        tabindex="-1"
        class="h-full sm:h-[calc(100dvh-2rem)] md:h-[calc(100dvh-4rem)] sm:max-h-[max(52rem,85dvh)] w-full max-w-5xl overflow-hidden overscroll-contain sm:rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogRef = ref<HTMLDivElement | null>(null)
const previousActiveElement = ref<HTMLElement | null>(null)
let previousRootOverflow = ''
let pageScrollLocked = false

const lockPageScroll = () => {
  if (pageScrollLocked) {
    return
  }

  previousRootOverflow = document.documentElement.style.overflow
  document.documentElement.style.overflow = 'hidden'
  pageScrollLocked = true
}

const unlockPageScroll = () => {
  if (!pageScrollLocked) {
    return
  }

  document.documentElement.style.overflow = previousRootOverflow
  pageScrollLocked = false
}

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ')

const close = () => {
  emit('update:modelValue', false)
}

const onBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    close()
  }
}

const getFocusableElements = () => {
  if (!dialogRef.value) {
    return [] as HTMLElement[]
  }

  return Array.from(
    dialogRef.value.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter(
    (element) => !element.hasAttribute('disabled') && element.tabIndex !== -1,
  )
}

const focusFirstElement = () => {
  const focusableElements = getFocusableElements()
  const focusTarget = focusableElements[0] ?? dialogRef.value
  focusTarget?.focus()
}

const trapFocus = (event: KeyboardEvent) => {
  const focusableElements = getFocusableElements()
  if (focusableElements.length === 0) {
    event.preventDefault()
    dialogRef.value?.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  const activeElement = document.activeElement

  if (
    event.shiftKey &&
    (activeElement === firstElement || activeElement === dialogRef.value)
  ) {
    event.preventDefault()
    lastElement.focus()
    return
  }

  if (!event.shiftKey && activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Tab' && props.modelValue) {
    trapFocus(event)
    return
  }

  if (event.key === 'Escape' && props.modelValue) {
    close()
  }
}

watch(
  () => props.modelValue,
  (isOpen) => {
    if (typeof window === 'undefined') {
      return
    }

    if (isOpen) {
      previousActiveElement.value =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null
      lockPageScroll()
      window.addEventListener('keydown', onKeydown)
      nextTick(() => {
        focusFirstElement()
      })
      return
    }

    unlockPageScroll()
    window.removeEventListener('keydown', onKeydown)
    if (previousActiveElement.value?.isConnected) {
      previousActiveElement.value.focus()
    }
    previousActiveElement.value = null
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKeydown)
    unlockPageScroll()
  }
})
</script>
