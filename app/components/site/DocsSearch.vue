<script setup lang="ts">
import type { WolfxLocale } from '~/types/site'
import { MAIN_SITE_ORIGIN } from '~~/data/site-identities'

interface SearchEntry {
  title: string
  description?: string
  path: string
  locale: WolfxLocale
  section?: string
  headings?: string[]
  text: string
}

const { locale, t } = useI18n()
const { displayLocale, isWolfxMc } = useSiteContext()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const input = useTemplateRef<HTMLInputElement>('input')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const query = ref('')
const entries = ref<SearchEntry[]>([])
const loaded = ref(false)
const loading = ref(false)
const failed = ref(false)
const activeIndex = ref(-1)

function tr(key: string) {
  return t(key, {}, { locale: displayLocale.value })
}

const results = computed(() => {
  const term = query.value.trim().toLocaleLowerCase()
  if (!term)
    return []
  const terms = term.split(/\s+/).filter(Boolean)
  return entries.value
    .filter(entry => entry.locale === (isWolfxMc.value ? displayLocale.value : locale.value))
    .map((entry) => {
      const title = entry.title.toLocaleLowerCase()
      const headings = (entry.headings ?? []).join(' ').toLocaleLowerCase()
      const description = (entry.description ?? '').toLocaleLowerCase()
      const text = entry.text.toLocaleLowerCase()
      const searchable = `${title} ${headings} ${description} ${text}`
      if (!terms.every(part => searchable.includes(part)))
        return undefined
      let score = 0
      if (title === term)
        score += 160
      else if (title.includes(term))
        score += 100
      if (headings.includes(term))
        score += 70
      if (description.includes(term))
        score += 35
      if (text.includes(term))
        score += 10
      score += terms.filter(part => title.includes(part)).length * 20
      score += terms.filter(part => headings.includes(part)).length * 12
      return { entry, score }
    })
    .filter((result): result is { entry: SearchEntry, score: number } => Boolean(result))
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .slice(0, 12)
    .map(result => result.entry)
})

const activeResultId = computed(() => activeIndex.value >= 0 ? `search-result-${activeIndex.value}` : undefined)

watch(results, (value) => {
  activeIndex.value = value.length ? 0 : -1
})

function excerpt(entry: SearchEntry) {
  const source = entry.description || entry.text
  return source.length > 180 ? `${source.slice(0, 177)}…` : source
}

function resultHref(path: string) {
  if (isWolfxMc.value && path.startsWith('/'))
    return new URL(path, MAIN_SITE_ORIGIN).toString()
  return path
}

async function openSearch() {
  document.documentElement.classList.add('has-modal-open')
  document.body.classList.add('has-modal-open')
  dialog.value?.showModal()
  await nextTick()
  input.value?.focus()
  if (!loaded.value && !loading.value) {
    loading.value = true
    failed.value = false
    try {
      entries.value = await $fetch<SearchEntry[]>('/search-index.json', { cache: 'no-cache' })
      loaded.value = true
    }
    catch {
      failed.value = true
    }
    finally {
      loading.value = false
    }
  }
}

function resetSearch() {
  document.documentElement.classList.remove('has-modal-open')
  document.body.classList.remove('has-modal-open')
  query.value = ''
  activeIndex.value = -1
  void nextTick(() => trigger.value?.focus())
}

function handleGlobalShortcut(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null
  const isEditable = target?.matches('input, textarea, select, [contenteditable="true"]')
  if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey && !isEditable) {
    event.preventDefault()
    void openSearch()
  }
}

function closeSearch() {
  dialog.value?.close()
}

function closeOnBackdrop(event: MouseEvent) {
  if (event.target === dialog.value)
    closeSearch()
}

async function selectResult(index: number) {
  const result = results.value[index]
  if (!result)
    return
  closeSearch()
  const href = resultHref(result.path)
  await navigateTo(href, { external: /^https?:\/\//.test(href) })
}

async function handleInputKeydown(event: KeyboardEvent) {
  if (!results.value.length)
    return
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value + 1) % results.value.length
  }
  else if (event.key === 'ArrowUp') {
    event.preventDefault()
    activeIndex.value = (activeIndex.value - 1 + results.value.length) % results.value.length
  }
  else if (event.key === 'Enter' && activeIndex.value >= 0) {
    event.preventDefault()
    await selectResult(activeIndex.value)
    return
  }
  else {
    return
  }
  await nextTick()
  document.getElementById(`search-result-${activeIndex.value}`)?.scrollIntoView({ block: 'nearest' })
}

onMounted(() => document.addEventListener('keydown', handleGlobalShortcut))
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleGlobalShortcut)
  document.documentElement.classList.remove('has-modal-open')
  document.body.classList.remove('has-modal-open')
})
</script>

<template>
  <button
    ref="trigger"
    class="search-trigger"
    type="button"
    :aria-label="tr('search.label')"
    :title="tr('search.label')"
    @click="openSearch"
  >
    <UIcon name="i-lucide-search" />
    <span class="search-trigger__label">{{ tr('search.label') }}</span>
    <kbd>/</kbd>
  </button>
  <dialog
    ref="dialog"
    class="search-dialog"
    :aria-label="tr('search.label')"
    @click="closeOnBackdrop"
    @close="resetSearch"
  >
    <div class="search-panel">
      <header>
        <UIcon name="i-lucide-search" />
        <input
          ref="input"
          v-model="query"
          type="search"
          :placeholder="tr('search.placeholder')"
          autocomplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-controls="search-results"
          :aria-expanded="Boolean(results.length)"
          :aria-activedescendant="activeResultId"
          :aria-label="tr('search.label')"
          @keydown="handleInputKeydown"
        >
        <button
          type="button"
          :aria-label="tr('search.close')"
          @click="closeSearch"
        >
          <UIcon name="i-lucide-x" />
        </button>
      </header>
      <p
        v-if="loading"
        class="search-hint"
        role="status"
      >
        {{ tr('search.loading') }}
      </p>
      <p
        v-else-if="failed"
        class="search-hint"
        role="alert"
      >
        {{ tr('search.failed') }}
      </p>
      <p
        v-else-if="!query"
        class="search-hint"
      >
        {{ tr('search.hint') }}
      </p>
      <p
        v-else-if="!results.length"
        class="search-hint"
      >
        {{ tr('search.empty') }}
      </p>
      <ul
        v-else
        id="search-results"
        class="search-results"
        role="listbox"
      >
        <li
          v-for="(result, index) in results"
          :key="result.path"
          role="option"
          :aria-selected="activeIndex === index"
        >
          <NuxtLink
            :id="`search-result-${index}`"
            :to="resultHref(result.path)"
            @mouseenter="activeIndex = index"
            @focus="activeIndex = index"
            @click="closeSearch"
          >
            <strong>{{ result.title }}</strong>
            <span v-if="result.headings?.length">{{ result.headings.slice(0, 3).join(' / ') }}</span>
            <small>{{ excerpt(result) }}</small>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </dialog>
</template>
