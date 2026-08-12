<script setup lang="ts">
import Tooltip from '@hitszosa/ui/components/Tooltip.vue'
import { computed, onMounted, ref } from 'vue'

import {
  type HelpProtocol,
  helpProtocolEvent,
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
  <div class="flex w-full flex-col gap-6">
    <div class="flex items-baseline justify-between gap-4">
      <p class="ui-mono m-0 text-xs tracking-[0.18em] text-primary uppercase">
        Mirror Help
      </p>
      <a
        href="/"
        class="inline-flex shrink-0 items-center gap-1 text-sm text-muted-fg no-underline transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <span aria-hidden="true">←</span>
        <span>主页</span>
      </a>
    </div>

    <div
      class="flex w-full flex-col gap-6 sm:flex-row sm:items-start sm:justify-between"
    >
      <div class="min-w-0">
        <div class="flex items-center gap-3">
          <h1
            class="m-0 min-w-0 text-3xl font-semibold tracking-tight text-surface-fg md:text-4xl"
          >
            {{ title }}
          </h1>
          <Tooltip
            class="shrink-0 items-center"
            role="status"
            :aria-label="`镜像状态：${status}`"
            :content="status"
          >
            <span
              class="h-2.5 w-2.5 rounded-full"
              :class="statusColor"
              aria-hidden="true"
            />
          </Tooltip>
        </div>
        <p class="mt-3 mb-0 text-sm text-muted-fg">
          HITSZ OSA 开源软件镜像站使用帮助
        </p>
      </div>

      <div
        class="flex shrink-0 flex-col items-start gap-4 sm:items-end sm:pt-1"
      >
        <div
          class="flex flex-wrap items-end justify-start gap-4 sm:justify-end"
        >
          <div>
            <span class="mb-2 block text-xs text-muted-fg">访问协议</span>
            <fieldset
              class="inline-flex rounded-lg border border-surface-border bg-surface p-1"
            >
              <legend class="sr-only">镜像访问协议</legend>
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
            </fieldset>
          </div>

          <label
            class="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-surface-border bg-surface px-3 text-sm text-surface-fg"
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
    </div>
  </div>
</template>
