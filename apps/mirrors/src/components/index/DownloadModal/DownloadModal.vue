<template>
  <section
    class="flex flex-col h-full overflow-hidden rounded-2xl bg-surface text-surface-fg shadow-xl ring-1 ring-surface-border"
  >
    <header class="p-4 sm:p-6">
      <div class="flex flex-row justify-between">
        <h2 class="flex flex-nowrap space-x-1.5 text-lg font-medium sm:text-xl">
          <span class="inline-block translate-y-[3px]">
            <IconifyIcon icon="icon-park-outline:record-disc" />
          </span>
          <span
            id="download-modal-title"
            class="transition-colors after:transition-all relative inline-block z-10 after:block after:absolute after:bg-accent-100/80 after:rounded-md after:w-4 after:h-1 after:-right-5 after:bottom-1 after:-z-10 hocus:after:w-full hocus:after:h-2 hocus:after:right-0 hover:cursor-pointer"
          >
            下载 LiveCD 与软件
          </span>
        </h2>
        <button
          type="button"
          aria-label="Close dialog"
          class="inline-flex min-h-8 items-center justify-center gap-2 rounded-full bg-transparent px-3 text-sm text-muted-fg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hocus:bg-page-bg hocus:text-primary"
          @click="$emit('close')"
        >
          <IconifyIcon icon="icon-park-outline:close" />
        </button>
      </div>
    </header>
    <div class="min-h-0 grow h-full border-t border-surface-border p-3 sm:p-6">
      <div
        v-if="collections.length > 0"
        class="flex h-full min-h-0 flex-col gap-3 sm:flex-row sm:gap-6"
      >
        <BaseRadioSelection
          :items="collections"
          :index="collectionIndex"
          class="hidden sm:flex"
          @update:index="onCollectionUpdate"
        />
        <label for="download-collection" class="sr-only">软件分类</label>
        <select
          id="download-collection"
          :value="collectionIndex"
          class="h-11 w-full shrink-0 rounded-lg border border-surface-border bg-page-bg px-3 text-surface-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary sm:hidden"
          @change="onMobileCollectionUpdate"
        >
          <option
            v-for="(collection, index) in collections"
            :key="collection"
            :value="index"
          >
            {{ collection }}
          </option>
        </select>
        <ul
          class="h-full min-h-0 grow list-disc space-y-1 overflow-y-auto overscroll-contain p-1 pl-6 text-base sm:text-lg"
          style="scrollbar-width: none; -ms-overflow-style: none;"
        >
          <li v-for="resource in currentCollection" :key="resource.name">
            <a
              :href="resource.link"
              target="_blank"
              rel="noreferrer noopener"
              class="rounded-sm text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hocus:text-osa-hover"
            >
              {{ resource.name }}
            </a>
          </li>
        </ul>
      </div>
      <div v-else class="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <div
          class="h-11 w-full animate-pulse rounded-lg bg-page-bg sm:h-[32em] sm:w-40"
        />
        <div class="h-[32em] grow animate-pulse rounded-lg bg-page-bg" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon as IconifyIcon } from '@iconify/vue'
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import BaseRadioSelection from '@components/base/RadioSelection.vue'
import { useDownloadStore } from './DownloadStore'

const store = useDownloadStore()
const { resourceCollection } = storeToRefs(store)

defineEmits<{
  close: []
}>()

const collectionIndex = ref(0)

const collections = computed(() => Object.keys(resourceCollection.value))
const currentCollection = computed(() => {
  const selectedCollection = collections.value[collectionIndex.value]
  return selectedCollection
    ? (resourceCollection.value[selectedCollection] ?? [])
    : []
})

const onCollectionUpdate = (_collection: string, index: number) => {
  collectionIndex.value = index
}

const onMobileCollectionUpdate = (event: Event) => {
  collectionIndex.value = Number((event.target as HTMLSelectElement).value)
}
</script>

<style scoped>
ul::-webkit-scrollbar {
  display: none;
}
</style>
