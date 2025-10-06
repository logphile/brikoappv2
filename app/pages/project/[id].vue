<script setup lang="ts">
import { useRoute, navigateTo } from 'nuxt/app'

const route = useRoute()
await navigateTo(`/studio/${route.params.id}`)
</script>

<template></template>
