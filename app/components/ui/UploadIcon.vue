<template>
  <!-- Inline SVG so tailwind can size; color stays baked-in (white arrow on pink) -->
  <svg
    class="w-5 h-5"
    viewBox="0 0 128 128"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="64" cy="64" r="56" fill="#FF0062"/>
    <path d="M64 28 L64 84" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round"/>
    <path d="M44 48 L64 28 L84 48" fill="none" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="36" y="90" width="56" height="12" rx="6" fill="#FFFFFF"/>
  </svg>
</template>
