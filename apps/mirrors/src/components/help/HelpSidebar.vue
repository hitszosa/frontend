<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import { useHelpListStore } from '@components/index/MirrorList/HelpListStore'
import { useMirrorListStore } from '@components/index/MirrorList/MirrorListStore'

const props = defineProps<{
  activePageId: string
}>()

const { rows, loading, errorMessage } = storeToRefs(useMirrorListStore())
const { helpList } = storeToRefs(useHelpListStore())
const filter = ref('')
const helpSet = computed(() => new Set(helpList.value))
const fallbackRows = computed(() =>
  helpList.value.map((name, id) => ({
    id,
    name,
    files: `/${name}/`,
    lastUpdate: '',
    status: '',
  })),
)
const visibleRows = computed(() => {
  const source = rows.value.length > 0 ? rows.value : fallbackRows.value
  const needle = filter.value.trim().toLowerCase()
  return needle
    ? source.filter((row) => row.name.toLowerCase().includes(needle))
    : source
})

const helpHref = (name: string) => `/help/${encodeURIComponent(name)}/`

const onSearchInput = (event: Event) => {
  filter.value = (event.target as HTMLInputElement).value
}

const onKeydown = (event: KeyboardEvent) => {
  if (
    event.key !== '/' ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement
  ) {
    return
  }
  event.preventDefault()
  document.getElementById('help-sidebar-search')?.focus()
}

let positionedActivePage = false
watch(
  rows,
  async () => {
    if (positionedActivePage) return
    await nextTick()
    const activeLink = document.querySelector<HTMLElement>(
      '#help-sidebar-nav [aria-current="page"]',
    )
    if (!activeLink) return
    activeLink.scrollIntoView({ block: 'center' })
    positionedActivePage = true
  },
  { flush: 'post' },
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="flex h-full min-h-0 flex-col bg-surface">
    <div
      class="sticky top-0 z-10 border-b border-surface-border bg-surface p-4"
    >
      <label for="help-sidebar-search" class="sr-only">搜索镜像</label>
      <div class="relative">
        <IconifyIcon
          icon="icon-park-outline:search"
          class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-fg"
        />
        <input
          id="help-sidebar-search"
          :value="filter"
          type="search"
          placeholder="搜索镜像…"
          class="h-10 w-full rounded-lg border border-surface-border bg-page-bg pr-3 pl-9 text-surface-fg outline-none placeholder:text-muted-fg focus:border-primary focus:ring-2 focus:ring-primary"
          @input="onSearchInput"
        >
      </div>
    </div>

    <nav
      id="help-sidebar-nav"
      class="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2"
      aria-label="镜像帮助列表"
    >
      <p
        v-if="loading && rows.length === 0"
        class="px-3 py-4 text-sm text-muted-fg"
      >
        正在加载镜像列表…
      </p>
      <p
        v-else-if="errorMessage && visibleRows.length === 0"
        class="px-3 py-4 text-sm text-muted-fg"
      >
        {{ errorMessage }}
      </p>
      <p
        v-else-if="visibleRows.length === 0"
        class="px-3 py-4 text-sm text-muted-fg"
      >
        没有匹配的镜像
      </p>
      <ul v-else class="m-0 list-none space-y-0.5 p-0">
        <li v-for="row in visibleRows" :key="row.name">
          <a
            v-if="helpSet.has(row.name)"
            :href="helpHref(row.name)"
            :aria-current="row.name === props.activePageId ? 'page' : undefined"
            class="group flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :class="
              row.name === props.activePageId
                ? 'bg-primary/10 text-primary'
                : 'text-surface-fg hover:bg-page-bg hover:text-primary'
            "
          >
            <span class="min-w-0 flex-1 truncate">{{ row.name }}</span>
            <IconifyIcon
              icon="icon-park-outline:right"
              class="text-xs text-muted-fg opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100"
            />
          </a>
          <div
            v-else
            class="flex min-h-10 items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-fg/65"
            :title="`${row.name} 暂无使用帮助`"
          >
            <span class="min-w-0 flex-1 truncate">{{ row.name }}</span>
          </div>
        </li>
      </ul>
    </nav>
  </div>
</template>
