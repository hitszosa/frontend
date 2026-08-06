<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

import { createInitialState } from '@hitszosa/mirrorz-parser/runtime'
import type { InputType, MenuValue } from '@hitszosa/mirrorz-parser/runtime'
import type {
  HelpGlobalVariablesDetail,
  HelpProtocol,
} from './template-runtime'
import {
  helpGlobalVariablesEvent,
  helpProtocolEvent,
  helpSudoEvent,
  readHelpProtocol,
  readHelpSudo,
  renderHelpTemplate,
} from './template-runtime'

const props = withDefaults(
  defineProps<{
    pageId: string
    template: string
    menus?: InputType[]
    globalVariables?: Record<string, MenuValue>
    codeLanguage?: string
    filepath?: string
    append?: boolean
    enableQuickSetup?: boolean
  }>(),
  {
    menus: () => [],
    globalVariables: () => ({}),
    codeLanguage: 'text',
    filepath: undefined,
    append: false,
    enableQuickSetup: false,
  },
)
const menuColumns = computed(() => {
  const indexedMenus = props.menus.map((menu, index) => ({ menu, index }))
  const midpoint = Math.ceil(indexedMenus.length / 2)
  return [indexedMenus.slice(0, midpoint), indexedMenus.slice(midpoint)]
})

const menuValues = reactive<MenuValue[]>(
  props.menus.map((menu) => createInitialState([menu])),
)
const globalVariables = reactive<Record<string, MenuValue>>({
  ...props.globalVariables,
})
const copied = ref(false)
const protocol = ref<HelpProtocol>('https')
const sudoEnabled = ref(true)
const localVariables = computed(() =>
  menuValues.reduce<MenuValue>(
    (result, value) => ({ ...result, ...value }),
    {},
  ),
)
const renderedCode = computed(() =>
  renderHelpTemplate(
    props.template,
    props.pageId,
    localVariables.value,
    globalVariables,
    protocol.value,
    sudoEnabled.value,
  ),
)

const updateSelect = (menuIndex: number, event: Event) => {
  const menu = props.menus[menuIndex]
  if (!menu || !('items' in menu)) return
  const optionIndex = Number((event.target as HTMLSelectElement).value)
  menuValues[menuIndex] = menu.items[optionIndex]?.[1] ?? {}
}

const updateBoolean = (menuIndex: number, event: Event) => {
  const menu = props.menus[menuIndex]
  if (!menu || !('trueValue' in menu)) return
  menuValues[menuIndex] = {
    [menu.name]: (event.target as HTMLInputElement).checked
      ? menu.trueValue
      : menu.falseValue,
  }
}

const updateText = (menuIndex: number, event: Event) => {
  const menu = props.menus[menuIndex]
  if (!menu || !('name' in menu) || 'trueValue' in menu) return
  menuValues[menuIndex] = {
    [menu.name]: (event.target as HTMLInputElement).value,
  }
}

const copyCode = async () => {
  await navigator.clipboard.writeText(renderedCode.value)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1600)
}

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
  <section
    class="not-prose my-6 overflow-hidden rounded-lg border border-surface-border bg-surface"
  >
    <div
      v-if="menus.length > 0"
      class="grid gap-x-6 border-b border-surface-border bg-page-bg/55 px-4 py-2 lg:grid-cols-2"
    >
      <div
        v-for="(column, columnIndex) in menuColumns"
        :key="columnIndex"
        class="min-w-0"
      >
        <label
          v-for="(item, itemIndex) in column"
          :key="`${item.menu.title}-${item.index}`"
          :class="[
            'grid min-h-16 grid-cols-[minmax(0,1fr)_minmax(8rem,14rem)] items-center gap-x-4 gap-y-1 border-b border-surface-border/80 text-sm',
            item.index === props.menus.length - 1 ? 'mb-0 border-b-0' :
              itemIndex === column.length - 1
                ? 'lg:mb-0 lg:border-b-0'
                : 'lg:mb-4 lg:pb-4',
          ]"
        >
          <span class="min-w-0 font-medium text-surface-fg"
            >{{ item.menu.title }}</span
          >
          <input
            v-if="'trueValue' in item.menu"
            type="checkbox"
            :checked="item.menu.defaultValue"
            class="h-4 w-4 shrink-0 justify-self-end accent-primary"
            @change="updateBoolean(item.index, $event)"
          >
          <select
            v-else-if="'items' in item.menu"
            class="h-10 w-full min-w-0 rounded-lg border border-surface-border bg-surface px-3 text-surface-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            @change="updateSelect(item.index, $event)"
          >
            <option
              v-for="([ label ], optionIndex) in item.menu.items"
              :key="label"
              :value="optionIndex"
            >
              {{ label }}
            </option>
          </select>
          <input
            v-else
            type="text"
            :value="item.menu.defaultValue"
            class="h-10 w-full min-w-0 rounded-lg border border-surface-border bg-surface px-3 text-surface-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            @input="updateText(item.index, $event)"
          >
          <span
            v-if="item.menu.note"
            class="col-span-2 text-xs leading-5 text-muted-fg"
            >{{ item.menu.note }}</span
          >
        </label>
      </div>
    </div>

    <header
      class="flex min-h-10 items-center justify-between gap-3 border-b border-surface-border px-4 py-2 text-xs text-muted-fg"
    >
      <div class="flex min-w-0 items-center gap-2">
        <span class="ui-mono uppercase">{{ codeLanguage }}</span>
        <span v-if="filepath" class="truncate">{{ filepath }}</span>
        <span
          v-if="append"
          class="rounded-full border border-surface-border px-2 py-0.5"
          >追加</span
        >
        <span
          v-else-if="enableQuickSetup"
          class="rounded-full border border-surface-border px-2 py-0.5"
          >替换</span
        >
      </div>
      <button
        type="button"
        class="shrink-0 rounded-lg border border-surface-border px-2.5 py-1 text-surface-fg transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        @click="copyCode"
      >
        {{ copied ? '已复制' : '复制' }}
      </button>
    </header>
    <pre
      class="m-0 overflow-x-auto bg-inset p-4 text-sm leading-6 text-surface-fg"
    ><code>{{ renderedCode }}</code></pre>
  </section>
</template>
