import osaLogo from './assets/logos/osa-logo.svg'
import osaLogoMonoAsset from './assets/logos/osa-logo-mono.svg'
import osaLogoPubAsset from './assets/logos/osa-logo-pub.svg'
import osaLogoAltAsset from './assets/logos/osa-logo-alt.svg'
import osaLogoVtuberAsset from './assets/logos/osa-logo-vtuber.svg'
import osaLogoOldAsset from './assets/logos/osa-logo-old.svg'
import osaLogo01Asset from './assets/logos/osa-logo-01.svg'

export { default as tailwindPreset } from './tailwind/preset.js'
export { default as ThemeToggle } from './components/ThemeToggle.astro'
export { default as SiteHeader } from './components/SiteHeader.astro'
export { default as SiteFooter } from './components/SiteFooter.astro'
export * from './client/theme.js'
export * from './client/shiki.js'

export const osaLogoDefault = {
  src: osaLogo.src,
  alt: 'HITSZ OSA primary penguin logo',
} as const

export const osaLogoMono = {
  src: osaLogoMonoAsset.src,
  alt: 'HITSZ OSA monochrome logo',
} as const

export const osaLogoPub = {
  src: osaLogoPubAsset.src,
  alt: 'OSA penguin holding a beer',
} as const

export const osaLogoAlt = {
  src: osaLogoAltAsset.src,
  alt: 'Abstract OSA penguin on a shell',
} as const

export const osaLogoVtuber = {
  src: osaLogoVtuberAsset.src,
  alt: 'HITSZ OSA in VTuber logo style',
} as const

export const osaLogoOld = {
  src: osaLogoOldAsset.src,
  alt: 'Legacy OSA logo',
} as const

export const osaLogo01 = {
  src: osaLogo01Asset.src,
  alt: 'Compact OSA logo variant',
} as const
