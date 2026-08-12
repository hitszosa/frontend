import generatedHelpPages from '@generated/help/help-list.json'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHelpListStore = defineStore('help-list', () => {
  const helpList = ref(generatedHelpPages)

  return { helpList }
})
