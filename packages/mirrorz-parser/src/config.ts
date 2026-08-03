import type { ZDocConfig, ZDocConfigOnDisk, ZDocInput } from './types'

export function mergeConfig(
  pageId: string,
  globalConfig: ZDocConfigOnDisk,
  localConfig?: ZDocConfigOnDisk,
): ZDocConfig {
  const mergedInputs = {
    ...globalConfig.input,
    ...localConfig?.input,
  }
  const input = Object.fromEntries(
    Object.entries(mergedInputs).filter(
      (entry): entry is [string, ZDocInput] => entry[1] !== null,
    ),
  )
  const config = {
    block: ['index'],
    ...globalConfig,
    ...localConfig,
    input,
    name: pageId,
  }

  if (config._ === undefined) {
    throw new Error(`Config for page ${pageId} must have a title field "_"`)
  }

  return config as ZDocConfig
}
