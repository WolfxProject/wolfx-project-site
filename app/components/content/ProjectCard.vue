<script setup lang="ts">
const props = defineProps<{
  title: string
  eyebrow: string
  href: string
  action: string
  image?: string
  icon?: string
}>()

const external = computed(() => /^https?:\/\//.test(props.href))
</script>

<template>
  <article class="project-card">
    <div
      v-if="image"
      class="project-card__image"
    >
      <img
        :src="image"
        :alt="`${title} preview`"
        loading="lazy"
      >
    </div>
    <div
      v-else
      class="project-card__icon"
      aria-hidden="true"
    >
      <UIcon :name="icon ?? 'i-lucide-box'" />
    </div>
    <div class="project-card__body">
      <p class="eyebrow">
        {{ eyebrow }}
      </p>
      <h3>{{ title }}</h3>
      <div class="project-card__description">
        <slot />
      </div>
      <NuxtLink
        :to="href"
        :external="external"
        :target="external ? '_blank' : undefined"
        :rel="external ? 'noopener noreferrer' : undefined"
      >
        {{ action }}
        <UIcon :name="external ? 'i-lucide-arrow-up-right' : 'i-lucide-arrow-right'" />
      </NuxtLink>
    </div>
  </article>
</template>
