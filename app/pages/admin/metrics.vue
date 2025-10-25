<template>
  <div v-if="ready" class="px-6 py-10 max-w-5xl mx-auto">
    <header class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-extrabold tracking-tight text-black">Analytics</h1>
      <RangeTabs v-model="days" />
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <MetricCard title="Uploads" :value="kpi.uploads" :hint="`last ${days}d`" />
      <MetricCard title="Mosaics" :value="kpi.mosaics" :hint="`last ${days}d`" />
      <MetricCard title="Saves" :value="kpi.saves" :hint="`last ${days}d`" />
      <MetricCard title="PDF Exports" :value="kpi.pdf" :hint="`last ${days}d`" />
      <MetricCard title="PNG Exports" :value="kpi.png" :hint="`last ${days}d`" />
      <MetricCard title="CSV Exports" :value="kpi.csv" :hint="`last ${days}d`" />
    </div>

    <section v-if="isEmpty" class="mt-8 rounded-2xl border border-dashed border-black/15 bg-white/60 p-8 text-center">
      <p class="text-lg font-semibold">No events yet</p>
      <p class="text-sm text-black/60 mt-1">Make a mosaic, export a file, or save a project to see activity here.</p>
      <div class="mt-4">
        <NuxtLink to="/photo" class="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-black/10 hover:bg-black/5">
          Start with a photo →
        </NuxtLink>
      </div>
    </section>

    <section v-else class="mt-6 rounded-2xl border border-black/10 bg-white/70 backdrop-blur">
      <div class="flex items-center justify-between px-4 py-3 border-b border-black/10">
        <h2 class="text-sm font-semibold tracking-wide text-black/70">Daily events</h2>
        <span class="text-xs text-black/50">last {{ days }} days</span>
      </div>
      <div class="max-h-[60vh] overflow-auto">
        <table class="w-full text-sm">
          <thead class="sticky top-0 bg-white/85 backdrop-blur border-b border-black/10">
            <tr class="text-left">
              <th class="px-4 py-2 w-40 font-semibold text-black/70">Day</th>
              <th class="px-4 py-2 font-semibold text-black/70">Event</th>
              <th class="px-4 py-2 w-28 font-semibold text-right text-black/70">Count</th>
            </tr>
          </thead>
          <tbody class="[&>tr:nth-child(odd)]:bg-black/0 [&>tr:nth-child(even)]:bg-black/[.03]">
            <tr v-for="row in daily" :key="String(row.day)+String(row.event)">
              <td class="px-4 py-2">{{ row.day }}</td>
              <td class="px-4 py-2">{{ row.event }}</td>
              <td class="px-4 py-2 text-right">{{ row.n }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
  <div v-else class="p-8 text-sm text-black/60">Checking access…</div>
  
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RangeTabs from '~/components/admin/RangeTabs.vue'
import MetricCard from '~/components/admin/MetricCard.vue'

definePageMeta({ ssr: false })

const ready = ref(false)
onMounted(() => { ready.value = true; refresh() })

const route = useRoute()
const router = useRouter()
const days = ref<number>(Number(route.query.days ?? 7))

const kpi = ref<any>({})
const daily = ref<any[]>([])

async function refresh() {
  const q = `?days=${encodeURIComponent(String(days.value))}`
  const [k, d] = await Promise.all([
    $fetch<any>(`/api/metrics/kpis${q}`).catch(() => ({} as any)),
    $fetch<any[]>(`/api/metrics/daily${q}`).catch(() => ([] as any[]))
  ])
  kpi.value = k || {}
  daily.value = d || []
}

watch(days, (d) => {
  router.replace({ query: { ...route.query, days: String(d) } })
  refresh()
})
watch(() => route.query.days, (v) => { if (v) days.value = Number(v) })



const isEmpty = computed(() => {
  const totals = [kpi.value?.uploads, kpi.value?.mosaics, kpi.value?.saves, kpi.value?.pdf, kpi.value?.png, kpi.value?.csv]
  const sum = totals.reduce((a: number, b: number) => a + (Number(b) || 0), 0)
  return sum === 0 && (daily.value?.length ?? 0) === 0
})
</script>
