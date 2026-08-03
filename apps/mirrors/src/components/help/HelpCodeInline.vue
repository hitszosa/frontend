<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

import type { MenuValue } from '@hitszosa/mirrorz-parser/runtime'
import {
  helpGlobalVariablesEvent,
  type HelpGlobalVariablesDetail,
  type HelpProtocol,
  helpProtocolEvent,
  helpSudoEvent,
  readHelpProtocol,
  readHelpSudo,
  renderHelpTemplate,
} from './template-runtime'

const props = defineProps<{
  pageId: string
  template: string
  globalVariables: Record<string, MenuValue>
}>()

const globalVariables = reactive<Record<string, MenuValue>>({
  ...props.globalVariables,
})
const protocol = ref<HelpProtocol>('https')
const sudoEnabled = ref(true)
const renderedCode = computed(() =>
  renderHelpTemplate(
    props.template,
    props.pageId,
    {},
    globalVariables,
    protocol.value,
    sudoEnabled.value,
  ),
)

const onGlobalVariables = (event: Event) => {
  const { id, value } = (event as CustomEvent<HelpGlobalVariablesDetail>).detail
  globalVariables[id] = value
}
const onProtocol = (event: Event) => {
  protocol.value = (event as CustomEvent<HelpProtocol>).detail
}
const onSudo = (event: Event) => {
  sudoEnabled.value = (event as CustomEvent<boolean>).detail
}

onMounted(() => {
  protocol.value = readHelpProtocol()
  sudoEnabled.value = readHelpSudo()
  window.addEventListener(helpGlobalVariablesEvent, onGlobalVariables)
  window.addEventListener(helpProtocolEvent, onProtocol)
  window.addEventListener(helpSudoEvent, onSudo)
})

onUnmounted(() => {
  window.removeEventListener(helpGlobalVariablesEvent, onGlobalVariables)
  window.removeEventListener(helpProtocolEvent, onProtocol)
  window.removeEventListener(helpSudoEvent, onSudo)
})
</script>

<template>
  <code
    class="rounded-md border border-surface-border bg-inset px-1.5 py-0.5 text-[0.9em] text-surface-fg"
    >{{ renderedCode }}</code
  >
</template>
