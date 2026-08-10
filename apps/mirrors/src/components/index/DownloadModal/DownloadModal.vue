<template>
  <section
    class="flex h-full flex-col overflow-hidden rounded-lg border border-surface-border bg-surface text-surface-fg shadow-xl"
  >
    <header
      class="flex shrink-0 items-center justify-between gap-4 border-b border-surface-border px-4 py-3 sm:px-5 sm:py-4"
    >
      <h2 class="flex flex-nowrap space-x-1.5 text-xl font-medium translate-y-[2px]">
        <span class="inline-block translate-y-[3px]">
          <IconifyIcon icon="icon-park-outline:record-disc" />
        </span>
        <span id="download-modal-title"
          class="transition-colors after:transition-all relative inline-block z-10 after:block after:absolute after:bg-accent-100/80 after:rounded-md after:w-4 after:h-1 after:-right-5 after:bottom-1 after:-z-10 hocus:after:w-full hocus:after:h-2 hocus:after:right-0">
          LiveCD & Software
        </span>
      </h2>
      <button
        type="button"
        aria-label="关闭下载弹窗"
        title="关闭"
        class="flex cursor-pointer size-9 shrink-0 items-center justify-center rounded-lg text-lg text-muted-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hocus:bg-page-bg hocus:text-surface-fg"
        @click="$emit('close')"
      >
        <IconifyIcon icon="icon-park-outline:close" />
      </button>
    </header>

    <div v-if="loading" class="flex min-h-0 grow flex-col md:flex-row">
      <div
        class="flex shrink-0 gap-2 border-b border-surface-border bg-page-bg/50 p-3 md:w-52 md:flex-col md:border-r md:border-b-0"
      >
        <div
          v-for="item in 6"
          :key="item"
          class="h-9 w-24 shrink-0 animate-pulse rounded-lg bg-surface-border/70 md:w-full"
        />
      </div>
      <div class="grow space-y-3 p-4 sm:p-5">
        <div class="h-10 w-full animate-pulse rounded-lg bg-page-bg" />
        <div
          v-for="item in 7"
          :key="item"
          class="h-14 w-full animate-pulse rounded-lg bg-page-bg"
        />
      </div>
    </div>

    <div
      v-else-if="errorMessage"
      class="flex min-h-0 grow flex-col items-center justify-center px-6 text-center"
    >
      <span
        class="mb-4 flex size-12 items-center justify-center rounded-lg bg-danger/10 text-2xl text-danger"
        aria-hidden="true"
      >
        <IconifyIcon icon="icon-park-outline:cloud-failed" />
      </span>
      <p class="font-medium text-surface-fg">{{ errorMessage }}</p>
      <button
        type="button"
        class="mt-4 rounded-lg border border-surface-border bg-surface px-4 py-2 text-sm font-medium text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hocus:bg-page-bg"
        @click="createData"
      >
        重新加载
      </button>
    </div>

    <div v-else class="flex min-h-0 grow flex-col md:flex-row">
      <nav
        aria-label="资源分类"
        class="shrink-0 overflow-x-auto border-b border-surface-border bg-page-bg/50 p-2 md:w-52 md:overflow-y-auto md:border-r md:border-b-0 md:p-3"
      >
        <div
          role="radiogroup"
          aria-label="选择资源分类"
          class="flex min-w-max gap-1 md:min-w-0 md:flex-col"
        >
          <button
            v-for="(collection, index) in collections"
            :key="collection"
            type="button"
            role="radio"
            :aria-checked="collectionIndex === index"
            :tabindex="collectionIndex === index ? 0 : -1"
            class="flex h-10 items-center justify-between gap-3 rounded-md px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :class="
              collectionIndex === index
                ? 'bg-surface font-medium text-primary ring-1 ring-surface-border'
                : 'text-muted-fg hocus:bg-surface/70 hocus:text-surface-fg cursor-pointer'
            "
            @click="onCollectionUpdate(index)"
          >
            <span class="truncate">{{ collection }}</span>
            <span
              class="rounded-full bg-page-bg px-2 py-0.5 text-xs tabular-nums text-muted-fg"
            >
              {{ resourceCollection[collection]?.length ?? 0 }}
            </span>
          </button>
        </div>
      </nav>

      <div class="flex min-h-0 min-w-0 grow flex-col">
        <div
          class="shrink-0 border-b border-surface-border px-4 py-3 sm:px-5 sm:py-4"
        >
          <div class="mb-3 flex items-baseline justify-between gap-4">
            <h3 class="truncate font-medium text-surface-fg">
              {{ currentCollectionName }}
            </h3>
            <span class="shrink-0 text-xs text-muted-fg">
              {{ filteredCollection.length }}
              个资源
            </span>
          </div>
          <label class="relative block">
            <span
              class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-fg"
              aria-hidden="true"
            >
              <IconifyIcon icon="icon-park-outline:search" />
            </span>
            <input
              v-model="query"
              type="search"
              :placeholder="`在 ${currentCollectionName} 中搜索...`"
              class="h-10 w-full rounded-lg border border-surface-border bg-page-bg/60 pr-4 pl-8.5 text-sm text-surface-fg outline-none transition placeholder:text-muted-fg focus:border-primary focus:ring-2 focus:ring-primary"
            >
          </label>
        </div>

        <ul
          v-if="filteredCollection.length > 0"
          class="min-h-0 grow overflow-y-auto overscroll-contain"
        >
          <li
            v-for="resource in filteredCollection"
            :key="resource.link"
            class="border-b border-surface-border"
          >
            <a
              :href="resource.link"
              target="_blank"
              rel="noreferrer noopener"
              class="group flex min-h-14 items-center gap-3 px-4 py-2.5 sm:px-5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hocus:bg-page-bg/80"
            >
              <span
                class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-surface"
                aria-hidden="true"
              >
                <IconifyIcon icon="icon-park-outline:download" />
              </span>
              <span class="min-w-0 grow break-words text-surface-fg">
                {{ resource.name }}
              </span>
              <IconifyIcon
                icon="icon-park-outline:arrow-right"
                class="shrink-0 text-muted-fg transition-transform group-hover:translate-x-0.5 group-hover:text-primary mx-0.5"
                aria-hidden="true"
              />
            </a>
          </li>
        </ul>
        <div
          v-else
          class="flex min-h-0 grow flex-col items-center justify-center px-6 text-center"
        >
          <span class="mb-3 text-3xl text-muted-fg" aria-hidden="true">
            <IconifyIcon icon="icon-park-outline:search" />
          </span>
          <p class="font-medium text-surface-fg">没有找到匹配的资源</p>
          <p class="mt-1 text-sm text-muted-fg">试试其他关键词</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useDownloadStore } from './DownloadStore'

const store = useDownloadStore()
const { resourceCollection, loading, errorMessage } = storeToRefs(store)
const { createData } = store

defineEmits<{
  close: []
}>()

const collectionIndex = ref(0)
const query = ref('')

const collections = computed(() => Object.keys(resourceCollection.value))
const currentCollectionName = computed(
  () => collections.value[collectionIndex.value] ?? '',
)
const currentCollection = computed(() => {
  const selectedCollection = currentCollectionName.value
  return selectedCollection
    ? (resourceCollection.value[selectedCollection] ?? [])
    : []
})
const filteredCollection = computed(() => {
  const normalizedQuery = query.value.trim().toLocaleLowerCase()
  if (!normalizedQuery) {
    return currentCollection.value
  }

  return currentCollection.value.filter((resource) =>
    resource.name.toLocaleLowerCase().includes(normalizedQuery),
  )
})

const onCollectionUpdate = (index: number) => {
  collectionIndex.value = index
  query.value = ''
}
</script>
