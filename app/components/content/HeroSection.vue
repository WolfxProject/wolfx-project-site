<script setup lang="ts">
defineProps<{
  title: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel: string
  secondaryHref: string
}>()
</script>

<template>
  <section class="hero-section">
    <div
      class="hero-section__grid"
      aria-hidden="true"
    />
    <div class="hero-section__content site-container">
      <div class="hero-section__copy">
        <h1>{{ title }}</h1>
        <div class="hero-section__description">
          <slot />
        </div>
        <div class="hero-section__actions">
          <UButton
            :to="primaryHref"
            size="xl"
            trailing-icon="i-lucide-arrow-right"
          >
            {{ primaryLabel }}
          </UButton>
          <UButton
            :to="secondaryHref"
            size="xl"
            color="neutral"
            variant="outline"
          >
            {{ secondaryLabel }}
          </UButton>
        </div>
      </div>
      <div
        class="hero-section__wave"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 800 220"
          role="presentation"
        >
          <path d="M0 112h116l18-7 16 26 18-72 20 118 22-159 20 144 20-74 18 27 19-8 20 5 28-3 25 1h350" />
          <path d="M0 146h180l14-4 12 10 16-32 18 54 20-79 18 66 18-28 20 11 18-3h380" />
        </svg>
      </div>
    </div>
  </section>
</template>
