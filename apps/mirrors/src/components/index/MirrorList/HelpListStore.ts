import { defineStore } from 'pinia'
import { ref } from 'vue'

import generatedHelpPages from '@generated/help/help-list.json'

export const useHelpListStore = defineStore('help-list', () => {
  const helpList = ref(generatedHelpPages)

  return { helpList }
})
