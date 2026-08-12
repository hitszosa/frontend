<template>
  <ArrowAction type="button" class="ml-auto" @click="onToggleModal">
    下载
  </ArrowAction>
  <AppModal v-model="isOpen" aria-labelledby="download-modal-title">
    <IndexDownloadModal @close="onCloseModal" />
  </AppModal>
</template>

<script setup lang="ts">
import AppModal from '@components/ui/AppModal.vue'
import ArrowAction from '@components/ui/ArrowAction.vue'
import { ref } from 'vue'
import IndexDownloadModal from '../DownloadModal/DownloadModal.vue'

const isOpen = ref(false)

const onToggleModal = () => {
  isOpen.value = true
}

const onCloseModal = () => {
  isOpen.value = false
}
</script>
