module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true, 'vue/setup-compiler-macros': true },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    extraFileExtensions: ['.vue']
  },
  plugins: ['vue', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    // General
    'no-undef': 'off',
    'no-empty': 'warn',
    'no-unused-expressions': 'off',

    // Vue
    'vue/multi-word-component-names': 'off',
    'vue/attributes-order': 'off',
    'vue/first-attribute-linebreak': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/require-explicit-emits': 'off',

    // TypeScript
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
    ]
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser'
    },
    {
      files: ['**/*.d.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-object-type': 'off',
        '@typescript-eslint/no-unused-vars': 'off'
      }
    },
    {
      files: ['app/workers/**/*', 'app/workers/**/*.ts'],
      rules: {
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-explicit-any': 'off'
      }
    },
    {
      files: ['app/plugins/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off'
      }
    }
  ],
  globals: {
    // Vue reactivity APIs (auto-imported by Nuxt)
    ref: 'readonly',
    reactive: 'readonly',
    computed: 'readonly',
    watch: 'readonly',
    onMounted: 'readonly',
    onUnmounted: 'readonly',

    // Nuxt composables (auto-imported)
    useRoute: 'readonly',
    useRouter: 'readonly',
    useRuntimeConfig: 'readonly',
    useNuxtApp: 'readonly',
    clearError: 'readonly',
    useError: 'readonly',

    // <script setup> compiler macros
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  },
  ignorePatterns: ['.nuxt/', '.output/', 'dist/']
}
