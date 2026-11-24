<script setup lang="ts">
import type { WolfxLocale } from '~/types/site'

interface SearchEntry {
  title: string
  description?: string
  path: string
  locale: WolfxLocale
  section?: string
  headings?: string[]
  text: string
}

const { displayLocale, tr } = useSiteContext()
const dialog = useTemplateRef<HTMLDialogElement>('dialog')
const input = useTemplateRef<HTMLInputElement>('input')
const trigger = useTemplateRef<HTMLButtonElement>('trigger')
const query = ref('')
const entries = useState<SearchEntry[] | null>('search-index', () => null)
const loading = ref(false)
const failed = ref(false)
const activeIndex = ref(-1)
let returnFocus: HTMLElement | null = null

function normalize(value: string) {
  return value.normalize('NFKC').toLowerCase()
}

const searchableEntries = computed(() => (entries.value ?? [])
  .filter(entry => entry.locale === displayLocale.value)
  .map(entry => ({
    entry,
    title: normalize(entry.title),
    headings: normalize((entry.headings ?? []).join(' ')),
    description: normalize(entry.description ?? ''),
    text: normalize(entry.text),
  })))

const results = computed(() => {
  const term = normalize(query.value).trim()
  if (!term)
    return []
  const terms = term.split(/\s+/).filter(Boolean)
  return searchableEntries.value
    .map(({ entry, title, headings, description, text }) => {
      if (!terms.every(part => title.includes(part) || headings.includes(part) || description.includes(part) || text.includes(part)))
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
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title, displayLocale.value))
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

async function loadIndex() {
  if (entries.value || loading.value)
    return
  loading.value = true
  failed.value = false
  try {
    const index = await $fetch<SearchEntry[]>('/search-index.json', { cache: 'no-cache', timeout: 10_000, retry: 0 })
    if (!Array.isArray(index))
      throw new Error('Invalid search index')
    entries.value = markRaw(index)
  }
  catch {
    failed.value = true
  }
  finally {
    loading.value = false
  }
}

function openSearch() {
  if (!dialog.value || document.querySelector('dialog[open]'))
    return false
  const focused = document.activeElement
  returnFocus = focused instanceof HTMLElement && focused !== document.body ? focused : trigger.value
  dialog.value.showModal()
  input.value?.focus()
  void loadIndex()
  return true
}

function retrySearch() {
  input.value?.focus()
  void loadIndex()
}

function resetSearch() {
  query.value = ''
  activeIndex.value = -1
  returnFocus?.focus({ preventScroll: true })
  returnFocus = null
}

function handleGlobalShortcut(event: KeyboardEvent) {
  if (event.key !== '/' || event.defaultPrevented || event.isComposing || event.metaKey || event.ctrlKey || event.altKey)
    return

  const target = event.target as HTMLElement | null
  const isEditable = target?.isContentEditable || target?.matches('input, textarea, select')
  if (!isEditable && openSearch())
    event.preventDefault()
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
  await navigateTo(result.path)
}

async function handleInputKeydown(event: KeyboardEvent) {
  // Enter and arrow keys also operate the candidate list of a CJK input method.
  if (event.isComposing || event.keyCode === 229 || !results.value.length)
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
onBeforeUnmount(() => document.removeEventListener('keydown', handleGlobalShortcut))
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
          :aria-controls="results.length ? 'search-results' : undefined"
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
        <button
          type="button"
          @click="retrySearch"
        >
          {{ tr('search.retry') }}
        </button>
      </p>
      <p
        v-else-if="!query.trim()"
        class="search-hint"
      >
        {{ tr('search.hint') }}
      </p>
      <p
        v-else-if="!results.length"
        class="search-hint"
        role="status"
      >
        {{ tr('search.empty') }}
      </p>
      <ul
        v-else
        id="search-results"
        class="search-results"
        role="listbox"
        :aria-label="tr('search.label')"
      >
        <li
          v-for="(result, index) in results"
          :key="result.path"
          role="presentation"
        >
          <NuxtLink
            :id="`search-result-${index}`"
            :to="result.path"
            no-prefetch
            role="option"
            tabindex="-1"
            :aria-selected="activeIndex === index"
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
