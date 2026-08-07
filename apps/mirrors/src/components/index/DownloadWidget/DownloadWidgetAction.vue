<template>
  <button
    type="button"
    class="group ml-auto flex w-fit items-center gap-2 rounded-sm text-sm font-medium text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hocus:text-osa-hover hover:cursor-pointer"
    @click="onToggleModal"
  >
    Download
    <span class="transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
      →
    </span>
  </button>
  <AppModal v-model="isOpen" aria-labelledby="download-modal-title">
    <IndexDownloadModal @close="onCloseModal" />
  </AppModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppModal from '@components/ui/AppModal.vue'
import IndexDownloadModal from '../DownloadModal/DownloadModal.vue'

const isOpen = ref(false)

const onToggleModal = () => {
  isOpen.value = true
}

const onCloseModal = () => {
  isOpen.value = false
}
</script>
