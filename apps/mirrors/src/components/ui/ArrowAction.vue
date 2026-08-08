<script setup lang="ts">
const { href, type = 'button' } = defineProps<{
  href?: string
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :type="href ? undefined : type"
    class="group flex w-fit items-center gap-2 rounded-sm text-sm font-medium text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hocus:text-osa-hover hover:cursor-pointer"
  >
    <slot />
    <span
      aria-hidden="true"
      class="transition-transform group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5"
    >
      →
    </span>
  </component>
</template>
