<template>
  <section class="min-w-0 space-y-4 my-4">
    <input
      :value="mirrorFilter"
      id="mirror-search-input"
      placeholder="Press '/' key to search for mirrors..."
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
        <div
          class="flex w-full min-w-0 items-center justify-between gap-2 whitespace-nowrap sm:justify-start"
        >
          <a
            v-if="row.files"
            :href="row.files"
            target="_blank"
            rel="noreferrer noopener"
            class="min-w-0 rounded-sm text-surface-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hocus:text-primary"
          >
            {{ row.name }}
          </a>
          <span v-else class="min-w-0">
            {{ row.name }}
          </span>
          <a
            v-if="isShowHelp(row.name)"
            :href="getHelpUrl(row.name)"
            :aria-label="`${row.name} 镜像使用帮助`"
            :title="`${row.name} 镜像使用帮助`"
            class="shrink-0 rounded-sm text-sm text-muted-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hocus:text-primary"
          >
            <IconifyIcon icon="icon-park-outline:help" />
          </a>
        </div>
      </template>
      <template #lastUpdate-data="{ row }">
        <relative-time
          :datetime="formatDateTime(row.lastUpdate)"
          format="relative"
          lang="en"
          class="whitespace-nowrap"
        >
          {{ formatFallbackDate(row.lastUpdate) }}
        </relative-time>
      </template>
      <template #status-data="{ row }">
        <StatusBadge :status="row.status" />
      </template>
    </AppTable>
  </section>
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'
import '@github/relative-time-element'
import { storeToRefs } from 'pinia'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AppTable from '@components/ui/AppTable.vue'
import StatusBadge from '@components/ui/StatusBadge.vue'
import { useHelpListStore } from './HelpListStore'
import { useMirrorListStore } from './MirrorListStore'

const { rows, loading, errorMessage } = storeToRefs(useMirrorListStore())
const { helpList } = storeToRefs(useHelpListStore())

const helpSet = computed(() => new Set(helpList.value))

const createColumns = () => {
  return [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
      smVisible: true,
      sortable: true,
    },
    {
      key: 'lastUpdate',
      label: 'Last Update',
      sortable: true,
    },
  ]
}
const columns = ref(createColumns())
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

const formatFallbackDate = (timestamp: number) => {
  return formatDateTime(timestamp).slice(0, 10)
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
