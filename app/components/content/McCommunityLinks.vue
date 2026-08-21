<script setup lang="ts">
import { wolfxMc } from '~~/data/wolfxmc'

const props = defineProps<{
  discordTitle: string
  discordDescription: string
  qqTitle: string
  qqDescription: string
  donateTitle: string
  donateDescription: string
  planTitle: string
  planDescription: string
}>()

const links = computed(() => [
  { title: props.discordTitle, description: props.discordDescription, href: wolfxMc.links.discord },
  { title: props.qqTitle, description: props.qqDescription, href: wolfxMc.links.qq },
  { title: props.donateTitle, description: props.donateDescription, href: wolfxMc.links.donate },
  { title: props.planTitle, description: props.planDescription, href: wolfxMc.links.plan },
])
</script>

<template>
  <div class="mc-community-grid site-container">
    <a
      v-for="link in links"
      :key="link.href"
      :href="link.href"
      target="_blank"
      rel="noopener noreferrer"
    >
      <strong>{{ link.title }}</strong>
      <span>{{ link.description }}</span>
      <UIcon
        class="mc-community-grid__icon"
        name="i-lucide-arrow-up-right"
      />
    </a>
  </div>
</template>
