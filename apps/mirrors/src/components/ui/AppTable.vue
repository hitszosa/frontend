<template>
  <div class="overflow-auto rounded-lg border border-surface-border bg-surface">
    <table class="min-w-full divide-y divide-surface-border">
      <thead class="bg-page-bg/80">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            scope="col"
            :aria-sort="getAriaSort(column)"
            :class="[
              'px-2 sm:px-4 py-3 text-left text-sm font-medium text-muted-fg',
              column.hiddenOnSmall && 'hidden sm:table-cell',
              column.indentedOnSmall && 'pl-3 sm:pl-4',
            ]"
          >
            <button
              v-if="column.sortable"
              type="button"
              class="inline-flex items-center gap-1 rounded-sm transition-colors hocus-visible:outline-none hocus-visible:ring-2 hocus-visible:ring-primary hocus:text-primary hover:cursor-pointer"
              @click="toggleSort(column.key)"
            >
              <span>{{ column.label }}</span>
              <span class="text-[8px] text-muted-fg">
                {{ sortIndicator(column.key) }}
              </span>
            </button>
            <span v-else>
              {{ column.label }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-surface-border min-h-40">
        <tr v-if="loading || errorMessage">
          <td
            :colspan="columns.length"
            class="px-2 sm:px-4 py-6 text-center text-sm text-muted-fg"
          >
            {{ loading ? '正在加载…' : errorMessage }}
          </td>
        </tr>
        <tr v-else-if="sortedRows.length === 0">
          <td
            :colspan="columns.length"
            class="px-4 py-6 text-center text-sm text-muted-fg"
          >
            没有匹配结果
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="row in sortedRows"
            :key="row.name"
            class="text-sm text-surface-fg transition-colors hocus:bg-page-bg/60"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="[
                'px-2 sm:px-4 py-3.5 sm:py-3 align-middle',
                column.hiddenOnSmall && 'hidden sm:table-cell',
              ]"
            >
              <slot :name="`${column.key}-data`" :row="row" />
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type SortDirection = 'asc' | 'desc'

interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  hiddenOnSmall?: boolean
  indentedOnSmall?: boolean
}

interface TableSort {
  column: string
  direction: SortDirection
}

const props = defineProps<{
  columns: TableColumn[]
  rows: (Record<string, unknown> & { name: string })[]
  sort?: TableSort
  loading?: boolean
  errorMessage?: string
}>()

const activeSort = ref<TableSort | null>(props.sort ? { ...props.sort } : null)

const compareValues = (left: unknown, right: unknown) => {
  if (left == null && right == null) {
    return 0
  }
  if (left == null) {
    return -1
  }
  if (right == null) {
    return 1
  }
  if (typeof left === 'number' && typeof right === 'number') {
    return left - right
  }
  return String(left).localeCompare(String(right))
}

const sortedRows = computed(() => {
  const renderedRows = [...props.rows]
  if (!activeSort.value) {
    return renderedRows
  }

  const { column, direction } = activeSort.value
  return renderedRows.sort((left, right) => {
    const result = compareValues(left[column], right[column])
    return direction === 'asc' ? result : -result
  })
})

const toggleSort = (columnKey: string) => {
  if (activeSort.value?.column === columnKey) {
    activeSort.value = {
      column: columnKey,
      direction: activeSort.value.direction === 'asc' ? 'desc' : 'asc',
    }
    return
  }

  activeSort.value = {
    column: columnKey,
    direction: 'asc',
  }
}

const sortIndicator = (columnKey: string) => {
  if (activeSort.value?.column !== columnKey) {
    return ''
  }
  return activeSort.value.direction === 'asc' ? '▲' : '▼'
}

const getAriaSort = (column: TableColumn) => {
  if (!column.sortable) {
    return undefined
  }

  if (activeSort.value?.column !== column.key) {
    return 'none'
  }

  return activeSort.value.direction === 'asc' ? 'ascending' : 'descending'
}
</script>
