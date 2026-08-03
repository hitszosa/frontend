import { describe, expect, test } from 'bun:test'

import { mergeConfig } from '../src/index'

describe('mergeConfig', () => {
  test('overlays local config and deletes inherited null inputs', () => {
    const globalConfig = {
      _: 'Global title',
      block: ['global-intro'],
      input: {
        inherited: {
          _: 'Inherited input',
          default: 'from-global',
        },
        overridden: {
          _: 'Global label',
          default: 'global value',
        },
        removed: {
          _: 'Removed input',
          default: 'obsolete',
        },
      },
    }
    const localConfig = {
      _: 'Local title',
      block: ['intro', 'usage'],
      input: {
        overridden: {
          _: 'Local label',
          default: 'local value',
        },
        removed: null,
        localOnly: {
          _: 'Local input',
          default: 'local only',
        },
      },
    }

    const merged = mergeConfig('fixture-page', globalConfig, localConfig)

    expect(merged.name).toBe('fixture-page')
    expect(merged._).toBe('Local title')
    expect(merged.block).toEqual(['intro', 'usage'])
    expect(merged.input).toEqual({
      inherited: {
        _: 'Inherited input',
        default: 'from-global',
      },
      overridden: {
        _: 'Local label',
        default: 'local value',
      },
      localOnly: {
        _: 'Local input',
        default: 'local only',
      },
    })
    expect(merged.input.removed).toBeUndefined()
  })
})
