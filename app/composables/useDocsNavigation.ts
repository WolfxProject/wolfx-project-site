export function useDocsNavigation() {
  const { sitePath } = useSiteContext()
  return computed(() => [
    { label: 'Wolfx Open API', to: sitePath('/docs/open-api'), icon: 'i-lucide-braces' },
    { label: 'WebSocket API', to: sitePath('/docs/websocket'), icon: 'i-lucide-radio-tower' },
    { label: 'SeisJS API', to: sitePath('/docs/seisjs-api'), icon: 'i-lucide-audio-waveform' },
  ])
}
