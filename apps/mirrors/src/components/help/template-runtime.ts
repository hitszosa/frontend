import Hogan from 'hogan.js'

import type { MenuValue } from '@hitszosa/mirrorz-parser/runtime'

export const helpGlobalVariablesEvent = 'hitszosa:help-global-variables'
export const helpProtocolEvent = 'hitszosa:help-protocol'
export const helpSudoEvent = 'hitszosa:help-sudo'
export type HelpProtocol = 'http' | 'https'

export interface HelpGlobalVariablesDetail {
  id: string
  value: MenuValue
}

export function flattenGlobalVariables(
  values: Record<string, MenuValue>,
): MenuValue {
  return Object.values(values).reduce<MenuValue>(
    (result, value) => ({ ...result, ...value }),
    {},
  )
}
export function readHelpProtocol(): HelpProtocol {
  if (typeof document === 'undefined') return 'https'
  return document.documentElement.dataset.helpProtocol === 'http'
    ? 'http'
    : 'https'
}
export function readHelpSudo(): boolean {
  if (typeof document === 'undefined') return true
  return document.documentElement.dataset.helpSudo !== 'false'
}

export function renderHelpTemplate(
  template: string,
  pageId: string,
  localVariables: MenuValue,
  globalVariables: Record<string, MenuValue>,
  protocol: HelpProtocol = 'https',
  sudoEnabled = true,
): string {
  const pathname = `/${pageId}`
  const endpoint = new URL(pathname, `${protocol}://mirrors.osa.moe`).toString()
  return Hogan.compile(template).render({
    ...localVariables,
    ...flattenGlobalVariables(globalVariables),
    mirror: `mirrors.osa.moe${pathname}`,
    host: 'mirrors.osa.moe',
    path: pathname,
    endpoint,
    http_protocol: `${protocol}://`,
    sudo: sudoEnabled ? 'sudo ' : '',
    sudoE: sudoEnabled ? 'sudo -E ' : '',
  })
}
