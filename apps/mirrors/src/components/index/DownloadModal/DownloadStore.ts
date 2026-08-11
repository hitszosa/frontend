import { defineStore } from 'pinia'
import { onMounted, ref } from 'vue'

export type Resource = {
  name: string
  link: string
}
export type ResourceCollection = Record<string, Resource[]>

const isResourceCollection = (value: unknown): value is ResourceCollection => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false
  }

  return Object.values(value).every(
    (collection) =>
      Array.isArray(collection) &&
      collection.every(
        (resource) =>
          resource &&
          typeof resource === 'object' &&
          typeof resource.name === 'string' &&
          typeof resource.link === 'string',
      ),
  )
}

const fetchResourceCollection = async () => {
  const res = await fetch('/static/res_link.json')
  if (!res.ok) {
    throw new Error(`Failed to load resources (${res.status})`)
  }

  const data: unknown = await res.json()
  if (!isResourceCollection(data)) {
    throw new Error('Invalid resource data')
  }

  return data
}

export const useDownloadStore = defineStore('resource-collection', () => {
  const resourceCollection = ref<ResourceCollection>({})
  const loading = ref(true)
  const errorMessage = ref('')

  const createData = async () => {
    loading.value = true
    errorMessage.value = ''

    try {
      resourceCollection.value = await fetchResourceCollection()
    } catch {
      resourceCollection.value = {}
      errorMessage.value = '资源列表暂时无法加载，请稍后重试。'
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => {
    await createData()
  })

  return {
    resourceCollection,
    loading,
    errorMessage,
    createData,
  }
})
