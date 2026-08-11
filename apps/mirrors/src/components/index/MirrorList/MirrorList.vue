<template>
  <section class="min-w-0 space-y-4 my-4">
    <input
      :value="mirrorFilter"
      id="mirror-search-input"
      placeholder="按 / 键搜索镜像…"
      class="text-sm form-input w-full rounded-lg border border-surface-border bg-surface px-4 py-2 text-surface-fg outline-none transition placeholder:text-muted-fg focus:border-primary focus:ring-2 focus:ring-primary"
      @input="onSearchInput"
    >
    <AppTable
      :columns="columns"
      :rows="filteredRows"
      :sort="{ column: 'name', direction: 'asc' }"
      :loading="loading"
      :error-message="errorMessage"
    >
      <template #name-data="{ row }">
        <div class="flex items-baseline gap-1.5">
          <StatusBadge :status="row.status" compact />
          <a
            v-if="row.files"
            :href="row.files"
            target="_blank"
            rel="noreferrer noopener"
            class="whitespace-nowrap rounded-sm text-surface-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hocus:text-primary text-ellipsis"
          >
            {{ row.name }}
          </a>
          <span v-else class="whitespace-nowrap">
            {{ row.name }}
          </span>
        </div>
      </template>
      <template #help-data="{ row }">
        <a
          v-if="isShowHelp(row.name)"
          :href="getHelpUrl(row.name)"
          class="text-muted-fg after:w-0 hover:text-primary hover:after:w-full hover:after:bg-osa-fg/40"
        >
          帮助
        </a>
      </template>
      <template #lastUpdate-data="{ row }">
        <Tooltip
          :content="formatLocalDateTime(row.lastUpdate * 1000)"
          placement="top"
        >
          <time
            :datetime="formatDateTime(row.lastUpdate)"
            class="whitespace-nowrap inline sm:hidden"
          >
            {{ formatRelativeDate(row.lastUpdate * 1000, undefined, formatLocalMonthDay) }}
          </time>
          <time
            :datetime="formatDateTime(row.lastUpdate)"
            class="whitespace-nowrap hidden sm:inline"
          >
            {{ formatRelativeDate(row.lastUpdate * 1000) }}
          </time>
        </Tooltip>
      </template>
      <template #status-data="{ row }">
        <StatusBadge :status="row.status" />
      </template>
    </AppTable>
  </section>
</template>

<script setup lang="ts">
import Tooltip from '@hitszosa/ui/components/Tooltip.vue'
import {
  formatLocalDateTime,
  formatLocalMonthDay,
  formatRelativeDate,
} from '@hitszosa/ui/utils/time'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppTable from '@components/ui/AppTable.vue'
import StatusBadge from '@components/ui/StatusBadge.vue'
import { useHelpListStore } from './HelpListStore'
import { useMirrorListStore } from './MirrorListStore'

const { rows, loading, errorMessage } = storeToRefs(useMirrorListStore())
const { helpList } = storeToRefs(useHelpListStore())

const helpSet = computed(() => new Set(helpList.value))

const columns = [
  {
    key: 'name',
    label: '名称',
    indentedOnSmall: true,
    sortable: true,
  },
  {
    key: 'status',
    label: '状态',
    hiddenOnSmall: true,
    sortable: true,
  },
  {
    key: 'lastUpdate',
    label: '最近同步',
    sortable: true,
  },
  {
    key: 'help',
    label: '',
  },
]
const mirrorFilter = ref('')

const filteredRows = computed(() => {
  if (!mirrorFilter.value) {
    return rows.value
  }
  return rows.value.filter((row) => isNameMatched(row.name, mirrorFilter.value))
})

const isShowHelp = (mirror: string) => {
  return helpSet.value.has(mirror)
}

const isNameMatched = (mirror: string, filter: string) => {
  return mirror.toLowerCase().includes(filter.toLowerCase())
}

const getHelpUrl = (mirror: string) => {
  return `/help/${encodeURIComponent(mirror)}/`
}

const formatDateTime = (timestamp: number) => {
  return new Date(timestamp * 1000).toISOString()
}

const onSearchInput = (event: Event) => {
  mirrorFilter.value = (event.target as HTMLInputElement).value
}

const triggerSearchFocus = () => {
  document.getElementById('mirror-search-input')?.focus()
}

const isDialogOpen = () => {
  return document.querySelector('[role="dialog"][aria-modal="true"]') !== null
}

const isEditableElement = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
  )
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) {
    return
  }

  if (isDialogOpen()) {
    return
  }

  if (isEditableElement(event.target)) {
    return
  }

  event.preventDefault()
  triggerSearchFocus()
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>
