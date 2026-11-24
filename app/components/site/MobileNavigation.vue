<script setup lang="ts">
interface NavigationItem {
  label: string
  to: string
}

defineProps<{
  navigation: NavigationItem[]
}>()

const emit = defineEmits<{
  close: []
}>()

const { tr } = useSiteContext()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')

async function open() {
  if (!dialog.value || dialog.value.open)
    return
  dialog.value.showModal()
  await nextTick()
  dialog.value.querySelector<HTMLElement>('[data-mobile-nav-close]')?.focus()
}

function close() {
  dialog.value?.close()
}

function closeOnBackdrop(event: MouseEvent) {
  if (event.target === dialog.value)
    close()
}

defineExpose({ open, close })
</script>

<template>
  <dialog
    ref="dialog"
    class="mobile-navigation"
    :aria-label="tr('nav.menu')"
    @click="closeOnBackdrop"
    @close="emit('close')"
  >
    <div class="mobile-navigation__panel">
      <div class="mobile-navigation__header">
        <strong>Wolfx Project</strong>
        <button
          class="icon-button"
          type="button"
          data-mobile-nav-close
          :aria-label="tr('nav.closeMenu')"
          :title="tr('nav.closeMenu')"
          @click="close"
        >
          <UIcon name="i-lucide-x" />
        </button>
      </div>
      <nav :aria-label="tr('nav.menu')">
        <NuxtLink
          v-for="item in navigation"
          :key="item.to"
          :to="item.to"
          @click="close"
        >
          {{ item.label }}
        </NuxtLink>
        <NuxtLink
          to="https://github.com/WolfxProject"
          external
          target="_blank"
          rel="noopener noreferrer"
          @click="close"
        >
          {{ tr('nav.github') }}
          <UIcon name="i-lucide-arrow-up-right" />
        </NuxtLink>
      </nav>
    </div>
  </dialog>
</template>
