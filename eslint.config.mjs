import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  ignores: ['worker-configuration.d.ts', '.wrangler/**', 'test-results/**', 'playwright-report/**'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    'vue/multi-word-component-names': 'off',
  },
})
