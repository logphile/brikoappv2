<template>
  <div class="px-6 py-10 max-w-5xl mx-auto">
    <h1 class="text-3xl font-semibold text-[#2F3061] mb-6">Analytics (Last 7–30 days)</h1>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
      <div class="bg-white/80 rounded-2xl border border-[#2F3061]/15 p-4">
        <div class="text-sm text-[#2F3061]/60">Uploads (7d)</div>
        <div class="text-2xl font-semibold text-[#2F3061] mt-1">{{ kpi.uploads_7d ?? 0 }}</div>
      </div>
      <div class="bg-white/80 rounded-2xl border border-[#2F3061]/15 p-4">
        <div class="text-sm text-[#2F3061]/60">Mosaics (7d)</div>
        <div class="text-2xl font-semibold text-[#2F3061] mt-1">{{ kpi.mosaics_7d ?? 0 }}</div>
      </div>
      <div class="bg-white/80 rounded-2xl border border-[#2F3061]/15 p-4">
        <div class="text-sm text-[#2F3061]/60">Saves (7d)</div>
        <div class="text-2xl font-semibold text-[#2F3061] mt-1">{{ kpi.saves_7d ?? 0 }}</div>
      </div>
      <div class="bg-white/80 rounded-2xl border border-[#2F3061]/15 p-4">
        <div class="text-sm text-[#2F3061]/60">PDF Exports (7d)</div>
        <div class="text-2xl font-semibold text-[#2F3061] mt-1">{{ kpi.pdf_7d ?? 0 }}</div>
      </div>
      <div class="bg-white/80 rounded-2xl border border-[#2F3061]/15 p-4">
        <div class="text-sm text-[#2F3061]/60">PNG Exports (7d)</div>
        <div class="text-2xl font-semibold text-[#2F3061] mt-1">{{ kpi.png_7d ?? 0 }}</div>
      </div>
      <div class="bg-white/80 rounded-2xl border border-[#2F3061]/15 p-4">
        <div class="text-sm text-[#2F3061]/60">CSV Exports (7d)</div>
        <div class="text-2xl font-semibold text-[#2F3061] mt-1">{{ kpi.csv_7d ?? 0 }}</div>
      </div>
    </div>

    <div class="bg-white/80 rounded-2xl border border-[#2F3061]/15 overflow-hidden">
      <div class="px-4 py-3 bg-[#FFD808]/30 text-[#2F3061] font-medium">Daily events (30 days)</div>
      <table class="w-full">
        <thead>
          <tr class="text-left text-[#2F3061]/70 border-b border-[#2F3061]/10">
            <th class="px-4 py-2">Day</th>
            <th class="px-4 py-2">Event</th>
            <th class="px-4 py-2">Count</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in daily" :key="String(row.day) + String(row.event)" class="border-b border-[#2F3061]/10">
            <td class="px-4 py-2">{{ row.day }}</td>
            <td class="px-4 py-2">{{ row.event }}</td>
            <td class="px-4 py-2">{{ row.n }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const kpi = ref<any>({})
const daily = ref<any[]>([])
const [k, d] = await Promise.all([
  $fetch<any>('/api/metrics/kpis').catch(() => ({} as any)),
  $fetch<any[]>('/api/metrics/daily').catch(() => ([] as any[]))
])
kpi.value = k || {}
daily.value = d || []
</script>
