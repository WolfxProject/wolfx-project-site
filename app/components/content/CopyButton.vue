<script setup lang="ts">
interface CopyButtonProps {
  value: string
  ariaLabel?: string
}

const props = defineProps<CopyButtonProps>()
const { t } = useI18n()
const state = ref<'idle' | 'copying' | 'copied' | 'failed'>('idle')
let timer: ReturnType<typeof setTimeout> | undefined

const feedback = computed(() => {
  if (state.value === 'copied')
    return t('copy.copied')
  if (state.value === 'failed')
    return t('copy.failed')
  return ''
})

const buttonLabel = computed(() => {
  const action = feedback.value || t('copy.label')
  return props.ariaLabel ? `${action} — ${props.ariaLabel}` : action
})

async function copy() {
  if (!import.meta.client || state.value !== 'idle')
    return

  state.value = 'copying'
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(props.value)
    }
    else {
      const textarea = document.createElement('textarea')
      textarea.value = props.value
      textarea.setAttribute('readonly', '')
      textarea.style.position = 'fixed'
      textarea.style.inset = '0 auto auto -9999px'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      let copied = false
      try {
        textarea.select()
        copied = document.execCommand('copy')
      }
      finally {
        textarea.remove()
      }
      if (!copied)
        throw new Error('Browser copy fallback was unavailable')
    }
    state.value = 'copied'
  }
  catch {
    state.value = 'failed'
  }

  if (timer)
    clearTimeout(timer)
  timer = setTimeout(() => (state.value = 'idle'), 2200)
}

onBeforeUnmount(() => {
  if (timer)
    clearTimeout(timer)
})
</script>

<template>
  <button
    class="copy-button"
    type="button"
    :aria-label="buttonLabel"
    :title="buttonLabel"
    :disabled="state !== 'idle'"
    :data-state="state"
    @click="copy"
  >
    <UIcon :name="state === 'copied' ? 'i-lucide-check' : state === 'failed' ? 'i-lucide-circle-alert' : 'i-lucide-copy'" />
    <span class="copy-button__label">{{ feedback || $t('copy.label') }}</span>
  </button>
  <span
    class="sr-only"
    aria-live="polite"
    aria-atomic="true"
  >{{ feedback }}</span>
</template>
