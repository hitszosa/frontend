<template>
  <dialog
    ref="dialogRef"
    role="dialog"
    :aria-modal="modelValue ? 'true' : undefined"
    class="fixed inset-0 m-auto h-full max-h-none w-full max-w-5xl overflow-hidden overscroll-contain border-0 bg-transparent p-0 sm:h-[calc(100dvh-2rem)] sm:max-h-[max(52rem,85dvh)] sm:rounded-lg md:h-[calc(100dvh-4rem)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary backdrop:bg-slate-950/60 backdrop:backdrop-blur-sm"
    @click="onBackdropClick"
    @close="close"
    @wheel.stop
    @touchmove.stop
  >
    <slot />
  </dialog>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const dialogRef = ref<HTMLDialogElement | null>(null)
const close = () => emit('update:modelValue', false)

const onBackdropClick = (event: MouseEvent) => {
  const dialog = dialogRef.value
  if (!dialog || event.target !== dialog) return
  const { left, right, top, bottom } = dialog.getBoundingClientRect()
  if (
    event.clientX < left ||
    event.clientX > right ||
    event.clientY < top ||
    event.clientY > bottom
  ) {
    close()
  }
}

watchEffect(
  () => {
    const dialog = dialogRef.value
    if (!dialog) return
    if (props.modelValue && !dialog.open) dialog.showModal()
    else if (!props.modelValue && dialog.open) dialog.close()
  },
  { flush: 'post' },
)
</script>
