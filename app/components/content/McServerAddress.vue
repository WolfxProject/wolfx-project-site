<script setup lang="ts">
import { wolfxMc } from '~~/data/wolfxmc'

defineProps<{
  title: string
  copyLabel: string
  route: keyof typeof wolfxMc.serverAddresses
}>()
</script>

<template>
  <section
    class="mc-server-address"
    data-mc-server-address
    :data-route="route"
  >
    <div>
      <p class="eyebrow">
        {{ title }}
      </p>
      <code>{{ wolfxMc.serverAddresses[route] }}</code>
    </div>
    <CopyButton
      :value="wolfxMc.serverAddresses[route]"
      :aria-label="copyLabel"
    />
  </section>
</template>
