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

const { t } = useI18n()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
let scrollPosition = 0

function lockPageScroll() {
  scrollPosition = window.scrollY
  document.documentElement.classList.add('has-modal-open')
  document.body.classList.add('has-modal-open')
}

function unlockPageScroll() {
  document.documentElement.classList.remove('has-modal-open')
  document.body.classList.remove('has-modal-open')
  window.scrollTo(0, scrollPosition)
}

async function open() {
  if (!dialog.value || dialog.value.open)
    return
  lockPageScroll()
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

function handleClose() {
  unlockPageScroll()
  emit('close')
}

onBeforeUnmount(() => {
  if (import.meta.client && dialog.value?.open)
    unlockPageScroll()
})

defineExpose({ open, close })
</script>

<template>
  <dialog
    ref="dialog"
    class="mobile-navigation"
    :aria-label="t('nav.menu')"
    @click="closeOnBackdrop"
    @close="handleClose"
  >
    <div class="mobile-navigation__panel">
      <div class="mobile-navigation__header">
        <strong>Wolfx Project</strong>
        <button
          class="icon-button"
          type="button"
          data-mobile-nav-close
          :aria-label="t('nav.closeMenu')"
          :title="t('nav.closeMenu')"
          @click="close"
        >
          <UIcon name="i-lucide-x" />
        </button>
      </div>
      <nav :aria-label="t('nav.menu')">
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
          {{ t('nav.github') }}
          <UIcon name="i-lucide-arrow-up-right" />
        </NuxtLink>
      </nav>
    </div>
  </dialog>
</template>
