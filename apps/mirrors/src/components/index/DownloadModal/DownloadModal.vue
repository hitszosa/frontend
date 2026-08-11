<template>
  <section
    class="flex h-full flex-col overflow-hidden sm:rounded-lg sm:border sm:border-surface-border bg-surface text-surface-fg shadow-xl"
  >
    <header
      class="flex shrink-0 items-center justify-between gap-4 border-b border-surface-border px-2 py-3 sm:px-4 sm:py-4"
    >
      <div class="flex min-w-0 items-center gap-2">
        <button
          v-if="!loading && !errorMessage"
          ref="categoryTriggerRef"
          type="button"
          aria-controls="download-category-sidebar"
          :aria-expanded="categoryDrawerOpen"
          :aria-label="categoryDrawerOpen ? '折叠资源分类' : '展开资源分类'"
          :title="categoryDrawerOpen ? '折叠资源分类' : '展开资源分类'"
          class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg text-lg text-muted-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:bg-page-bg hover:text-surface-fg"
          @click="toggleCategorySidebar"
        >
          <span class="relative block size-5" aria-hidden="true">
            <Transition
              enter-active-class="transition duration-150 ease-out motion-reduce:transition-none"
              enter-from-class="opacity-0"
              leave-active-class="transition duration-150 ease-out motion-reduce:transition-none"
              leave-to-class="opacity-0"
            >
              <IconifyIcon
                :key="categoryDrawerOpen ? 'unfold' : 'fold'"
                :icon="
                  categoryDrawerOpen
                    ? 'icon-park-outline:menu-unfold-one'
                    : 'icon-park-outline:menu-fold-one'
                "
                class="absolute inset-0 size-full"
              />
            </Transition>
          </span>
        </button>
        <h2
          class="flex min-w-0 flex-nowrap space-x-1.5 text-xl font-medium translate-y-[1px]"
        >
          <span class="inline-block shrink-0 translate-y-[3px]">
            <IconifyIcon icon="icon-park-outline:record-disc" />
          </span>
          <span
            id="download-modal-title"
            class="transition-colors after:transition-all relative inline-block truncate z-10 after:block after:absolute after:bg-accent-100/80 after:rounded-md after:w-4 after:h-1 after:-right-5 after:bottom-1 after:-z-10 hocus:after:w-full hocus:after:h-2 hocus:after:right-0"
          >
            LiveCD & Software
          </span>
        </h2>
      </div>
      <button
        type="button"
        aria-label="关闭下载弹窗"
        title="关闭"
        class="flex cursor-pointer size-9 shrink-0 items-center justify-center rounded-lg text-lg text-muted-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:bg-page-bg hover:text-surface-fg"
        @click="$emit('close')"
      >
        <IconifyIcon icon="icon-park-outline:close" />
      </button>
    </header>

    <div v-if="loading" class="flex min-h-0 grow">
      <div
        class="hidden w-52 shrink-0 flex-col gap-2 border-r border-surface-border bg-page-bg p-3 md:flex"
      >
        <div
          v-for="item in 6"
          :key="item"
          class="h-9 w-full shrink-0 animate-pulse rounded-lg bg-surface-border/70"
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

    <div v-else class="relative flex min-h-0 grow overflow-hidden">
      <Transition
        enter-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-active-class="transition-opacity duration-200"
        leave-to-class="opacity-0"
      >
        <button
          v-if="categoryDrawerOpen"
          type="button"
          aria-label="关闭资源分类"
          class="absolute inset-0 z-10 cursor-default bg-slate-950/40 md:hidden"
          @click="closeCategoryDrawer"
        />
      </Transition>

      <nav
        id="download-category-sidebar"
        ref="categorySidebarRef"
        aria-label="资源分类"
        :inert="!categoryDrawerOpen"
        tabindex="-1"
        class="absolute inset-y-0 left-0 z-20 flex w-[min(18rem,85%)] shrink-0 flex-col overflow-hidden border-r border-surface-border bg-page-bg shadow-xl transition-[translate,visibility,width] duration-200 ease-out focus:outline-none md:static md:z-auto md:translate-x-0 md:shadow-none"
        :class="
          categoryDrawerOpen
            ? 'visible translate-x-0 md:w-[max(13rem,25%)] max-w-60'
            : 'invisible -translate-x-full md:visible md:w-0 md:translate-x-0'
        "
        @keydown.esc.stop.prevent="closeCategoryDrawer"
      >
        <div
          role="radiogroup"
          aria-label="选择资源分类"
          class="flex min-h-0 grow flex-col gap-1 overflow-y-auto p-3"
        >
          <button
            v-for="(collection, index) in collections"
            :key="collection"
            type="button"
            role="radio"
            :aria-checked="collectionIndex === index"
            :tabindex="collectionIndex === index ? 0 : -1"
            class="flex h-11 md:h-10 shrink-0 items-center justify-between gap-3 rounded-md px-3 text-left text-base md:text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            :class="
              collectionIndex === index
                ? 'bg-surface font-medium text-primary ring-1 ring-surface-border'
                : 'cursor-pointer text-muted-fg hocus:bg-surface/70 hocus:text-surface-fg'
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
          <div class="mb-2 flex items-center justify-between gap-4">
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
              class="h-10 w-full rounded-lg border border-surface-border bg-page-bg/60 pr-4 pl-8.5 text-base sm:text-sm text-surface-fg outline-none transition placeholder:text-muted-fg focus:border-primary focus:ring-2 focus:ring-primary"
            >
          </label>
        </div>

        <ul
          v-if="filteredCollection.length > 0"
          class="min-h-0 grow overflow-y-auto overscroll-contain bg-page-bg"
        >
          <li
            v-for="resource in filteredCollection"
            :key="resource.link"
            class="border-b border-surface-border bg-surface"
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useDownloadStore } from './DownloadStore'

const store = useDownloadStore()
const { resourceCollection, loading, errorMessage } = storeToRefs(store)
const { createData } = store

defineEmits<{
  close: []
}>()

const collectionIndex = ref(0)
const query = ref('')
const categoryDrawerOpen = ref(false)
const isDesktop = ref(false)
const categoryTriggerRef = ref<HTMLButtonElement | null>(null)
const categorySidebarRef = ref<HTMLElement | null>(null)
let desktopMediaQuery: MediaQueryList | undefined

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
  if (!isDesktop.value) {
    closeCategoryDrawer()
  }
}

const openCategoryDrawer = () => {
  categoryDrawerOpen.value = true
  if (!isDesktop.value) {
    nextTick(() => {
      categorySidebarRef.value?.focus()
    })
  }
}

const closeCategoryDrawer = () => {
  categoryDrawerOpen.value = false
  nextTick(() => {
    if (categoryTriggerRef.value?.offsetParent !== null) {
      categoryTriggerRef.value?.focus()
    }
  })
}

const toggleCategorySidebar = () => {
  if (categoryDrawerOpen.value) {
    closeCategoryDrawer()
    return
  }

  openCategoryDrawer()
}

const onDesktopChange = (event: MediaQueryListEvent) => {
  isDesktop.value = event.matches
  categoryDrawerOpen.value = event.matches
}

onMounted(() => {
  desktopMediaQuery = window.matchMedia('(min-width: 768px)')
  isDesktop.value = desktopMediaQuery.matches
  categoryDrawerOpen.value = desktopMediaQuery.matches
  desktopMediaQuery.addEventListener('change', onDesktopChange)
})

onBeforeUnmount(() => {
  desktopMediaQuery?.removeEventListener('change', onDesktopChange)
})
</script>
