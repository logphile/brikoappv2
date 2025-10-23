import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin(() => {
  if (process.dev) return

  const KEY = 'briko.analyticsConsent'

  const loadGA = () => {
    if (document.getElementById('ga4-snippet')) return

    // GA4 library
    const s1 = document.createElement('script')
    s1.id = 'ga4-snippet'
    s1.async = true
    s1.src = 'https://www.googletagmanager.com/gtag/js?id=G-KX0V4MQKTE'
    document.head.appendChild(s1)

    // gtag bootstrap + consent update + config
    const s2 = document.createElement('script')
    s2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);} 
      gtag('js', new Date());
      gtag('consent', 'update', { 'analytics_storage': 'granted' });
      gtag('config', 'G-KX0V4MQKTE', { anonymize_ip: true });
    `
    document.head.appendChild(s2)
  }

  try {
    const v = localStorage.getItem(KEY)
    if (v === 'granted') loadGA()
  } catch {}

  window.addEventListener('briko-consent-granted', loadGA)
})
