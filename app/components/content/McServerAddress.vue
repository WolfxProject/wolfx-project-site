<script setup lang="ts">
import { wolfxMc } from '~~/data/wolfxmc'

defineProps<{
  title: string
  copyLabel: string
}>()
</script>

<template>
  <section
    class="mc-server-address"
    data-mc-server-address
  >
    <div>
      <p class="eyebrow">
        {{ title }}
      </p>
      <code>{{ wolfxMc.serverAddress }}</code>
    </div>
    <CopyButton
      :value="wolfxMc.serverAddress"
      :aria-label="copyLabel"
    />
  </section>
</template>
