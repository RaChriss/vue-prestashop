<script setup lang="ts">
import { CustomerService } from '@/service/customer/CustomerService';
import type { Customer } from '@/types/customer';
import { onMounted, ref } from 'vue';
import { useClientAuthStore } from '@/stores/clientAuth';
import { useRouter } from 'vue-router';
import { CategoryService } from '@/service/category/CategoryService';
import { ProductService } from '@/service/product/ProductService';
import { CombinationService } from '@/service/combination/CombinationService';
import { StockAvailableService } from '@/service/stock_available/StockAvailableService';
import { StockMvtService } from '@/service/stock_mvt/StockMvtService';

const customers = ref<Customer[] | undefined>(undefined)
const categorires = ref<import('@/types/category').Category[] | undefined>(undefined)
const clientAuth = useClientAuthStore()
const router = useRouter()

const adjustmentValues = ref<Record<number, number | null>>({})
const updatingCategoryId = ref<number | null>(null)

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

const fetchCustomer = async () => {
    try {
        customers.value = await CustomerService.getAll();
    } catch (error: any) {
        alert(error);
    }
}

const fetchCategorie = async () => {
    try {
        categorires.value = await CategoryService.getAll();
    } catch (error: any) {
        alert(error);
    }
}


const handleAjoutStock = async (idCategoire: number) => {
    const adjustment = adjustmentValues.value[idCategoire]
    if (!adjustment || updatingCategoryId.value) return

    updatingCategoryId.value = idCategoire
    try {
        const listeProduit = await ProductService.getByIdCategory(idCategoire)
        const now = new Date()
        const pad = (n: number) => n.toString().padStart(2, '0')
        const dateActuel = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
        const signe = adjustment > 0 ? 1 : -1;

        const stockTargetsByProduct = await Promise.all(
            listeProduit
                .filter(p => Boolean(p?.id))
                .map(async (product) => {
                    const combos = await CombinationService.getByProductId(product.id)
                    if (!combos.length) {
                        const stock = await StockAvailableService.getByProductId(product.id, 0)
                        return stock ? [{
                            product,
                            comboId: 0,
                            comboRef: '',
                            stock
                        }] : []
                    }

                    const comboTargets = await Promise.all(
                        combos.map(async (combo) => {
                            const stock = await StockAvailableService.getByProductId(product.id, combo.id)
                            return stock ? {
                                product,
                                comboId: combo.id,
                                comboRef: combo.reference || '',
                                stock
                            } : null
                        })
                    )

                    return comboTargets.filter(Boolean)
                })
        )

        const stocksToUpdate = stockTargetsByProduct.flat()

        const reportEntries: StockReportEntry[] = []
        for (const item of stocksToUpdate) {
            if (!item) continue
            const currentQty = item.stock.quantity
            let appliedAdjustment = adjustment
            if (currentQty + appliedAdjustment < 0) {
                appliedAdjustment = -currentQty
            }
            const newStock = currentQty + appliedAdjustment

            if (appliedAdjustment !== 0) {
                await StockAvailableService.updateStock(item.product.id, item.comboId, newStock)

                // await StockMvtService.createMouvement({
                //     id_product: item.product.id,
                //     id_product_attribute: item.comboId,
                //     id_stock: item.stock.id,
                //     physical_quantity: appliedAdjustment,
                //     date_add: dateActuel,
                //     sign: appliedAdjustment > 0 ? 1 : -1,
                //     id_employee: 1,
                // })
            }

            reportEntries.push({
                productId: item.product.id,
                productName: item.product.name || `produit ${item.product.id}`,
                comboId: item.comboId,
                comboRef: item.comboRef || '',
                beforeQty: currentQty,
                requestedAdjustment: adjustment,
                appliedAdjustment,
                afterQty: newStock,
            })
        }

        const categoryName = categorires.value?.find(c => c.id === idCategoire)?.name || `categorie ${idCategoire}`
        const reportPayload = {
            categoryId: idCategoire,
            categoryName,
            requestedAdjustment: adjustment,
            createdAt: dateActuel,
            entries: reportEntries,
        }

        sessionStorage.setItem('stock-report', JSON.stringify(reportPayload))

        adjustmentValues.value[idCategoire] = null
        router.push({ name: 'remove-stock-report' })
    } catch (error) {
        console.error('Erreur lors de l\'ajout du stock:', error)
        alert('Erreur lors de la mise à jour du stock.')
    } finally {
        updatingCategoryId.value = null
    }
}


onMounted(fetchCategorie)

</script>

<template>
    <!-- <div class="user-selection-card"> -->
    <div class="d-flex align-items-center mb-4">
        <div class="icon-box me-3">
            <i class="bi bi-people-fill fs-4 text-primary"></i>
        </div>
        <h2 class="h4 mb-0 fw-bold">Choisir une categorie</h2>
    </div>

    <div class="table-responsive">
        <table class="table table-hover align-middle">
            <thead>
                <tr>
                    <th class="ps-4">ID</th>
                    <th>Nom</th>
                    <th class="text-end pe-4">Action</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="c in categorires" :key="c.id" v-show="c.id != 1">
                    <td class="ps-4 fw-medium text-muted">#{{ c.id }}</td>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="">
                                {{ c.name }}
                            </div>
                        </div>
                    </td>
                    <td class="text-end pe-4">
                        <div class="d-flex align-items-center justify-content-center gap-2">
                            <input type="number"
                                class="form-control form-control-sm text-center shadow-none adjustment-input"
                                v-model.number="adjustmentValues[c.id]" placeholder="0">
                            <button
                                class="btn btn-sm btn-success rounded-circle p-0 d-flex align-items-center justify-content-center"
                                style="width: 28px; height: 28px; flex-shrink: 0;" @click="handleAjoutStock(c.id)">
                                <!-- <span v-if="updatingId === stock.id" class="spinner-border spinner-border-sm"
                                    role="status"></span>
                                <i v-else class="bi bi-check-lg"></i> -->
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
    <br><br>
    <br><br>
    <br><br>
    <br><br>

</template>

<style scoped>
.icon-box {
    width: 45px;
    height: 45px;
    background: rgba(var(--bs-primary-rgb), 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
}

.avatar-sm {
    width: 35px;
    height: 35px;
    background: linear-gradient(135deg, var(--bs-primary));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: bold;
    text-transform: uppercase;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.table {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(var(--bs-emphasis-color-rgb), 0.075);
}

.table thead th {
    background-color: rgba(var(--bs-emphasis-color-rgb), 0.03);
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
    padding-top: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(var(--bs-emphasis-color-rgb), 0.1);
}

.table tbody td {
    padding-top: 15px;
    padding-bottom: 15px;
}

.table-hover tbody tr:hover {
    background-color: rgba(var(--bs-primary-rgb), 0.05);
}

.anonymous-section {
    border-style: dashed !important;
    border-color: rgba(var(--bs-emphasis-color-rgb), 0.2) !important;
}

.btn-primary {
    transition: all 0.3s ease;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(var(--bs-primary-rgb), 0.4) !important;
}

/* Adaptation spécifique pour le texte muet en mode sombre */
[data-bs-theme="light"] .text-muted {
    color: #a1a1aa !important;
}
</style>