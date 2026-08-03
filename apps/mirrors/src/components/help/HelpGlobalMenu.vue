<script setup lang="ts">
import { onMounted, reactive } from 'vue'

import { createInitialState } from '@hitszosa/mirrorz-parser/runtime'
import type { InputType, MenuValue } from '@hitszosa/mirrorz-parser/runtime'
import {
  helpGlobalVariablesEvent,
  type HelpGlobalVariablesDetail,
} from './template-runtime'

const props = defineProps<{
  id: string
  menus: InputType[]
}>()

const menuValues = reactive<MenuValue[]>(
  props.menus.map((menu) => createInitialState([menu])),
)

const publish = () => {
  const value = menuValues.reduce<MenuValue>(
    (result, current) => ({ ...result, ...current }),
    {},
  )
  window.dispatchEvent(
    new CustomEvent<HelpGlobalVariablesDetail>(helpGlobalVariablesEvent, {
      detail: { id: props.id, value },
    }),
  )
}

const updateSelect = (menuIndex: number, event: Event) => {
  const menu = props.menus[menuIndex]
  if (!menu || !('items' in menu)) return
  const optionIndex = Number((event.target as HTMLSelectElement).value)
  menuValues[menuIndex] = menu.items[optionIndex]?.[1] ?? {}
  publish()
}

const updateBoolean = (menuIndex: number, event: Event) => {
  const menu = props.menus[menuIndex]
  if (!menu || !('trueValue' in menu)) return
  menuValues[menuIndex] = {
    [menu.name]: (event.target as HTMLInputElement).checked
      ? menu.trueValue
      : menu.falseValue,
  }
  publish()
}

const updateText = (menuIndex: number, event: Event) => {
  const menu = props.menus[menuIndex]
  if (!menu || !('name' in menu) || 'trueValue' in menu) return
  menuValues[menuIndex] = {
    [menu.name]: (event.target as HTMLInputElement).value,
  }
  publish()
}

onMounted(publish)
</script>

<template>
  <section
    class="not-prose my-6 rounded-xl border border-surface-border bg-page-bg/55 p-4"
  >
    <div class="grid gap-4 sm:grid-cols-2">
      <label
        v-for="(menu, index) in menus"
        :key="`${menu.title}-${index}`"
        class="text-sm"
        :class="
          'trueValue' in menu
            ? 'flex items-start justify-between gap-3 rounded-lg border border-surface-border bg-surface px-3 py-2.5'
            : 'grid gap-1.5'
        "
      >
        <template v-if="'trueValue' in menu">
          <span class="min-w-0">
            <span class="block font-medium text-surface-fg"
              >{{ menu.title }}</span
            >
            <span
              v-if="menu.note"
              class="mt-0.5 block text-xs leading-5 text-muted-fg"
              >{{ menu.note }}</span
            >
          </span>
          <input
            type="checkbox"
            :checked="menu.defaultValue"
            class="mt-0.5 h-4 w-4 shrink-0 accent-primary"
            @change="updateBoolean(index, $event)"
          >
        </template>
        <template v-else>
          <span class="font-medium text-surface-fg">{{ menu.title }}</span>
          <span v-if="menu.note" class="text-xs leading-5 text-muted-fg"
            >{{ menu.note }}</span
          >
          <select
            v-if="'items' in menu"
            class="h-10 rounded-lg border border-surface-border bg-surface px-3 text-surface-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            @change="updateSelect(index, $event)"
          >
            <option
              v-for="([ label ], optionIndex) in menu.items"
              :key="label"
              :value="optionIndex"
            >
              {{ label }}
            </option>
          </select>
          <input
            v-else
            type="text"
            :value="menu.defaultValue"
            class="h-10 rounded-lg border border-surface-border bg-surface px-3 text-surface-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary"
            @input="updateText(index, $event)"
          >
        </template>
      </label>
    </div>
  </section>
</template>
