module.exports = {
  extends: ['@nuxtjs/eslint-config-typescript', 'plugin:vue/vue3-recommended'],
  rules: {
    // Forbid self-closing native HTML in Vue templates; allow self-closing components
    'vue/html-self-closing': ['error', {
      html: { void: 'never', normal: 'never', component: 'always' },
      svg: 'always',
      math: 'always'
    }],
    'vue/no-parsing-error': 'error'
  }
}
