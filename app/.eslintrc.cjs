module.exports = {
  extends: ['@nuxtjs/eslint-config-typescript', 'plugin:vue/vue3-recommended'],
  rules: {
    // Forbid self-closing native HTML in Vue templates; allow self-closing components
    'vue/html-self-closing': ['error', {
      html: { void: 'never', normal: 'never', component: 'always' },
      svg: 'always',
      math: 'always'
    }],
    'vue/no-parsing-error': 'error',
    // Guardrails: prevent importing public assets in scripts and leading-slash URL module patterns
    'no-restricted-syntax': [
      'error',
      {
        selector: "ImportDeclaration[source.value=/^\\/.+\\.(svg|png|jpe?g|webp|gif)$/]",
        message:
          "Don't import public files in <script>. Use '/file.ext' (public) or assets with ?url.",
      },
      {
        selector: "NewExpression[callee.name='URL'][arguments.0.value=/^\\//]",
        message:
          "Avoid new URL('/file.ext', import.meta.url). Use a public URL string or assets ?url.",
      },
      {
        selector: "CallExpression[callee.object.name='URL'][arguments.0.value=/^\\//]",
        message:
          "Avoid URL('/file.ext', import.meta.url). Use a public URL string or assets ?url.",
      }
    ]
  }
}
