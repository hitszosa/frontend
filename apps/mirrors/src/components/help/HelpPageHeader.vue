<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import {
  helpProtocolEvent,
  type HelpProtocol,
  helpSudoEvent,
} from './template-runtime'

interface MirrorStatusItem {
  name: string
  status: string
}

const props = defineProps<{
  pageId: string
  title: string
}>()

const status = ref('unknown')
const protocol = ref<HelpProtocol>('https')
const sudoEnabled = ref(true)
const statusColor = computed(() => {
  switch (status.value) {
    case 'success':
      return 'bg-success'
    case 'syncing':
      return 'bg-warn'
    case 'failed':
      return 'bg-danger'
    default:
      return 'bg-muted-fg'
  }
})

const publishProtocol = () => {
  document.documentElement.dataset.helpProtocol = protocol.value
  window.dispatchEvent(
    new CustomEvent<HelpProtocol>(helpProtocolEvent, {
      detail: protocol.value,
    }),
  )
}

const publishSudo = () => {
  document.documentElement.dataset.helpSudo = String(sudoEnabled.value)
  window.dispatchEvent(
    new CustomEvent<boolean>(helpSudoEvent, {
      detail: sudoEnabled.value,
    }),
  )
}

const setProtocol = (value: HelpProtocol) => {
  protocol.value = value
  publishProtocol()
}

onMounted(async () => {
  publishProtocol()
  publishSudo()
  try {
    const response = await fetch('/tunasync_status.json')
    if (!response.ok) return
    const rows = (await response.json()) as MirrorStatusItem[]
    status.value =
      rows.find((row) => row.name === props.pageId)?.status ?? 'unknown'
  } catch {
    status.value = 'unknown'
  }
})
</script>

<template>
  <div
    class="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
  >
    <div class="min-w-0">
      <p class="ui-mono mb-3 text-xs tracking-[0.18em] text-primary uppercase">
        Mirror Help
      </p>
      <div class="flex items-center gap-3">
        <h1
          class="m-0 min-w-0 text-3xl font-semibold tracking-tight text-surface-fg md:text-4xl"
        >
          {{ title }}
        </h1>
        <span
          class="group/status relative inline-flex shrink-0 cursor-help items-center"
          role="status"
          :aria-label="`镜像状态：${status}`"
          tabindex="0"
        >
          <span
            class="h-2.5 w-2.5 rounded-full"
            :class="statusColor"
            aria-hidden="true"
          />
          <span
            role="tooltip"
            class="ui-mono pointer-events-none absolute top-full left-1/2 z-20 mt-2 -translate-x-1/2 rounded-lg border border-surface-border bg-surface px-2.5 py-1.5 text-xs whitespace-nowrap text-surface-fg opacity-0 transition-opacity group-hover/status:opacity-100 group-focus/status:opacity-100"
          >
            {{ status }}
          </span>
        </span>
      </div>
      <p class="mt-3 mb-0 text-sm text-muted-fg">
        HITSZ OSA 开源软件镜像站使用帮助
      </p>
    </div>

    <div class="flex shrink-0 flex-wrap items-end gap-4 sm:pt-7">
      <div>
        <span class="mb-2 block text-xs text-muted-fg">访问协议</span>
        <div
          class="inline-flex rounded-xl border border-surface-border bg-surface p-1"
          role="group"
          aria-label="镜像访问协议"
        >
          <button
            v-for="value in (['http', 'https'] as const)"
            :key="value"
            type="button"
            class="ui-mono min-w-16 rounded-lg px-3 py-1.5 text-xs uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :class="
              protocol === value
                ? 'bg-primary text-white dark:text-page-bg'
                : 'text-muted-fg hover:bg-page-bg hover:text-surface-fg'
            "
            :aria-pressed="protocol === value"
            @click="setProtocol(value)"
          >
            {{ value }}
          </button>
        </div>
      </div>

      <label
        class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-surface-border bg-surface px-3 text-sm text-surface-fg"
      >
        <input
          v-model="sudoEnabled"
          type="checkbox"
          class="h-4 w-4 accent-primary"
          @change="publishSudo"
        >
        <span>使用 sudo</span>
      </label>
    </div>
  </div>
</template>
