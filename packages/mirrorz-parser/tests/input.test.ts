import { describe, expect, test } from 'bun:test'

import { transpileInput } from '../src/index'

describe('transpileInput', () => {
  test('promotes the selected default and includes option-derived variables', () => {
    const input = transpileInput('release', {
      _: 'Release',
      note: 'Choose a target suite',
      default: 'stable',
      option: {
        testing: {
          _: 'Testing',
          suite: 'testing',
          security: '-security-testing',
        },
        stable: {
          _: 'Stable',
          suite: 'bookworm',
          security: '-security',
        },
        experimental: {
          suite: 'experimental',
        },
      },
    })

    expect(input).toEqual({
      title: 'Release',
      note: 'Choose a target suite',
      items: [
        [
          'Stable',
          {
            release: 'stable',
            suite: 'bookworm',
            security: '-security',
          },
        ],
        [
          'Testing',
          {
            release: 'testing',
            suite: 'testing',
            security: '-security-testing',
          },
        ],
        [
          'experimental',
          {
            release: 'experimental',
            suite: 'experimental',
          },
        ],
      ],
    })
  })

  test('uses booleans when switch values are null', () => {
    const input = transpileInput('source', {
      _: 'Enable source repositories',
      note: 'Useful for building packages',
      default: true,
      true: null,
      false: null,
    })

    expect(input).toEqual({
      title: 'Enable source repositories',
      note: 'Useful for building packages',
      name: 'source',
      defaultValue: true,
      trueValue: true,
      falseValue: false,
    })
  })

  test('preserves a text input default', () => {
    const input = transpileInput('mirror', {
      _: 'Mirror URL',
      note: 'Override the generated endpoint',
      default: 'https://mirrors.example.test',
    })

    expect(input).toEqual({
      title: 'Mirror URL',
      note: 'Override the generated endpoint',
      name: 'mirror',
      defaultValue: 'https://mirrors.example.test',
    })
  })
})
