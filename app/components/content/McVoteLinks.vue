<script setup lang="ts">
import { wolfxMc } from '~~/data/wolfxmc'
</script>

<template>
  <div class="mc-vote-links">
    <a
      v-for="([name, href]) in wolfxMc.voteLinks"
      :key="href"
      :href="href"
      target="_blank"
      rel="noopener noreferrer"
    >
      <span>{{ name }}</span>
      <UIcon name="i-lucide-arrow-up-right" />
    </a>
  </div>
</template>
