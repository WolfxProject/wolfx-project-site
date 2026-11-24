<script setup lang="ts">
import type { TocLink } from '~/types/site'

defineProps<{
  links: TocLink[]
  compact?: boolean
}>()
</script>

<template>
  <nav
    v-if="links.length"
    class="docs-toc"
    :class="{ 'docs-toc--compact': compact }"
    :aria-label="$t('docs.onThisPage')"
  >
    <component :is="compact ? 'details' : 'div'">
      <component :is="compact ? 'summary' : 'p'">
        {{ $t('docs.onThisPage') }}
      </component>
      <ul>
        <li
          v-for="link in links"
          :key="link.id"
        >
          <a :href="`#${link.id}`">{{ link.text }}</a>
          <ul v-if="link.children?.length">
            <li
              v-for="child in link.children"
              :key="child.id"
            >
              <a :href="`#${child.id}`">{{ child.text }}</a>
            </li>
          </ul>
        </li>
      </ul>
    </component>
  </nav>
</template>
