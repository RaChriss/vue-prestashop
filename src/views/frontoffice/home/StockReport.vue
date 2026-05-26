<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

type StockReportEntry = {
    productId: number
    productName: string
    comboId: number
    comboRef: string
    beforeQty: number
    requestedAdjustment: number
    appliedAdjustment: number
    afterQty: number
}

type StockReportPayload = {
    categoryId: number
    categoryName: string
    requestedAdjustment: number
    createdAt: string
    entries: StockReportEntry[]
}

const router = useRouter()
const report = ref<StockReportPayload | null>(null)

onMounted(() => {
    const raw = sessionStorage.getItem('stock-report')
    report.value = raw ? JSON.parse(raw) : null
})

const entries = computed(() => report.value?.entries || [])
const totalRequested = computed(() => entries.value.reduce((sum, e) => sum + e.requestedAdjustment, 0))
const totalApplied = computed(() => entries.value.reduce((sum, e) => sum + e.appliedAdjustment, 0))

const goBack = () => {
    router.push({ name: 'remove' })
}
</script>

<template>
    <div class="container py-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="h4 mb-1 fw-bold">Rapport de mise a jour stock</h2>
                <p class="text-muted mb-0">
                    Categorie: <strong>{{ report?.categoryName || '-' }}</strong>
                    <span class="mx-2">|</span>
                    Demande: <strong>{{ report?.requestedAdjustment ?? 0 }}</strong>
                </p>
            </div>
            <button class="btn btn-outline-primary" @click="goBack">Retour</button>
        </div>

        <div v-if="!report" class="alert alert-warning">
            Aucun rapport disponible. Faites une mise a jour de stock puis revenez ici.
        </div>

        <div v-else>
            <div class="card shadow-sm border-0 mb-4">
                <div class="card-body">
                    <div class="row g-3">
                        <div class="col-md-4">
                            <div class="text-muted small">Entrees</div>
                            <div class="fw-bold">{{ entries.length }}</div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-muted small">Total demande</div>
                            <div class="fw-bold">{{ totalRequested }}</div>
                        </div>
                        <div class="col-md-4">
                            <div class="text-muted small">Total applique</div>
                            <div class="fw-bold">{{ totalApplied }}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle">
                    <thead>
                        <tr>
                            <th>Produit</th>
                            <th class="text-end">Declinaison</th>
                            <th class="text-end">Avant</th>
                            <th class="text-end">Demande</th>
                            <th class="text-end">Reel</th>
                            <th class="text-end">Apres</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="entry in entries" :key="`${entry.productId}-${entry.comboId}`">
                            <td>
                                <div class="fw-semibold">{{ entry.productName }}</div>
                                <div class="text-muted small">ID {{ entry.productId }}</div>
                            </td>
                            <td class="text-end">
                                <span v-if="entry.comboId">{{ entry.comboRef || entry.comboId }}</span>
                                <span v-else>-</span>
                            </td>
                            <td class="text-end">{{ entry.beforeQty }}</td>
                            <td class="text-end">{{ entry.requestedAdjustment }}</td>
                            <td class="text-end">
                                <span
                                    :class="entry.appliedAdjustment === entry.requestedAdjustment ? 'text-success' : 'text-warning'">
                                    {{ entry.appliedAdjustment }}
                                </span>
                            </td>
                            <td class="text-end">{{ entry.afterQty }}</td>
                        </tr>
                        <tr v-if="entries.length === 0">
                            <td colspan="6" class="text-center text-muted py-4">Aucune ligne de rapport.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.table thead th {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
}
</style>
