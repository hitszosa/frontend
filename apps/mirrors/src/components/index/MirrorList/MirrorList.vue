<template>
  <section class="space-y-4 my-4">
    <input
      :value="mirrorFilter"
      id="mirror-search-input"
      placeholder="Press '/' key to search for mirrors..."
      class="form-input w-full rounded-lg border border-surface-border bg-surface px-4 py-2 text-surface-fg outline-none transition placeholder:text-muted-fg focus:border-primary focus:ring-2 focus:ring-primary"
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
        <a
          v-if="isShowHelp(row.name)"
          class="group flex gap-1 items-center cursor-pointer rounded-sm text-surface-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hocus:text-primary"
          :href="getHelpUrl(row.name)"
        >
          <span>
            {{ row.name }}
          </span>
          <IconifyIcon
            class="text-sm transition text-muted-fg group-hover:text-primary group-focus:text-primary"
            icon="icon-park-outline:help"
          />
        </a>
        <span v-else>
          {{ row.name }}
        </span>
      </template>
      <template #status-data="{ row }">
        <StatusBadge :status="row.status" />
      </template>
      <template #files-data="{ row }">
        <a
          v-if="row.files"
          :href="row.files"
          target="_blank"
          rel="noreferrer noopener"
          class="rounded-sm text-lg text-muted-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hocus:text-primary"
        >
          <IconifyIcon icon="icon-park-outline:folder-open" />
        </a>
      </template>
    </AppTable>
  </section>
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'
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
      key: 'files',
      label: 'Files',
    },
    {
      key: 'lastUpdate',
      label: 'Last Update',
      sortable: true,
    },
    {
      key: 'status',
      label: 'Status',
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
