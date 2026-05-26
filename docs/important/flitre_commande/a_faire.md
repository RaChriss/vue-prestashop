Approche recommandée (serveur / PrestaShop API)
Tu restes paginé et tu filtres côté API, ce qui évite de charger toutes les commandes.

1) UI des filtres dans la liste
Ajoute les champs de filtre dans OrdersList.vue :

Référence/ID
Statut
Client (email ou ID)
Date de début / fin
Total min / max
Ensuite tu appelles fetchOrders() avec un objet filters.

2) Ajouter des méthodes API pour filtrer
Créer un getFiltered et countFiltered dans :



OrdersApi.ts
OrderService.ts

Exemple (API) :

type OrderFilters = {
  reference?: string
  status?: number
  customerId?: number
  dateFrom?: string
  dateTo?: string
  minTotal?: number
  maxTotal?: number
}

const buildOrderQuery = (filters: OrderFilters, page: number, limit: number) => {
  const params = new URLSearchParams()
  params.set('display', 'full')
  params.set('sort', '[id_DESC]')
  params.set('limit', `${(page - 1) * limit},${limit}`)

  if (filters.reference) params.append('filter[reference]', `%${filters.reference}%`)
  if (filters.status) params.append('filter[current_state]', String(filters.status))
  if (filters.customerId) params.append('filter[id_customer]', String(filters.customerId))

  const from = filters.dateFrom || ''
  const to = filters.dateTo || ''
  if (from || to) {
    params.append('filter[date_add]', `[${from},${to}]`)
    params.append('date', '1')
  }

  if (filters.minTotal || filters.maxTotal) {
    const min = filters.minTotal ?? 0
    const max = filters.maxTotal ?? 999999
    params.append('filter[total_paid_real]', `[${min},${max}]`)
  }

  return `/orders?${params.toString()}`
}


Ensuite dans OrdersApi :
async getFiltered(filters: OrderFilters, page: number, limit: number): Promise<string> {
  const url = buildOrderQuery(filters, page, limit)
  const response = await apiClient.get(url)
  return response.data as string
}

async countFiltered(filters: OrderFilters): Promise<number> {
  const params = new URLSearchParams()
  // même logique mais avec display=[id]
  // puis compter <order> comme countAll()
}

3) Filtres côté vue
Dans OrdersList.vue :

const filters = ref({...})
bouton “Appliquer” → currentPage = 1 puis fetchOrders()
fetchOrders() appelle OrderService.getFiltered(filters.value, ...)
totalOrders = OrderService.countFiltered(...)
4) Recherche client (email ou nom)
L’API orders ne filtre pas par nom directement.
Solutions :

Email : CustomerApi.getByEmail() existe déjà.
résous customerId puis filtre filter[id_customer].
Nom :
soit tu ajoutes un CustomerApi.getByName() (filtre firstname ou lastname)
soit tu charges CustomerService.getAll() et tu filtres côté front (ok si peu de clients).




dans le fichier vue .
<form class="card border-0 shadow-sm mb-4" @submit.prevent="applyFilters">
            <div class="card-body">
                <div class="row g-3 align-items-end">
                    <div class="col-12 col-md-3">
                        <label class="form-label small text-muted">Référence / ID</label>
                        <input v-model="filters.referenceOrId" type="text" class="form-control form-control-sm"
                            placeholder="Ex: ABJ123 ou 42" />
                    </div>
                    <div class="col-12 col-md-3">
                        <label class="form-label small text-muted">Statut</label>
                        <select v-model="filters.status" class="form-select form-select-sm">
                            <option value="">Tous</option>
                            <option v-for="(status, id) in orderStatusMap" :key="id" :value="id">
                                {{ status.label }}
                            </option>
                        </select>
                    </div>
                    <div class="col-12 col-md-3">
                        <label class="form-label small text-muted">Client (email ou ID)</label>
                        <input v-model="filters.customer" type="text" class="form-control form-control-sm"
                            placeholder="client@mail.com ou 12" />
                    </div>
                    <div class="col-6 col-md-1">
                        <label class="form-label small text-muted">Du</label>
                        <input v-model="filters.dateFrom" type="date" class="form-control form-control-sm" />
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label small text-muted">Au</label>
                        <input v-model="filters.dateTo" type="date" class="form-control form-control-sm" />
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label small text-muted">Total min</label>
                        <input v-model="filters.minTotal" type="number" min="0" step="0.01"
                            class="form-control form-control-sm" placeholder="0.00" />
                    </div>
                    <div class="col-6 col-md-2">
                        <label class="form-label small text-muted">Total max</label>
                        <input v-model="filters.maxTotal" type="number" min="0" step="0.01"
                            class="form-control form-control-sm" placeholder="9999.00" />
                    </div>
                </div>
                <div class="d-flex gap-2 mt-3">
                    <button type="submit" class="btn btn-sm btn-primary">
                        <i class="bi bi-funnel me-1"></i> Appliquer
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" @click="resetFilters">
                        Réinitialiser
                    </button>
                </div>
            </div>
        </form>



        fichier api :

const appendOrderFilters = (params: URLSearchParams, filters: OrderFilters) => {
    if (filters.orderId) {
        params.append('filter[id]', String(filters.orderId))
    } else if (filters.reference) {
        params.append('filter[reference]', `%${filters.reference}%`)
    }

    if (filters.status) params.append('filter[current_state]', String(filters.status))
    if (filters.customerId) params.append('filter[id_customer]', String(filters.customerId))

    const from = filters.dateFrom || ''
    const to = filters.dateTo || ''
    if (from || to) {
        params.append('filter[date_add]', `[${from},${to}]`)
        params.append('date', '1')
    }

    if (filters.minTotal !== undefined || filters.maxTotal !== undefined) {
        const min = filters.minTotal ?? 0
        const max = filters.maxTotal ?? 999999
        params.append('filter[total_paid_real]', `[${min},${max}]`)
    }
}

const buildOrderQuery = (filters: OrderFilters, page: number, limit: number) => {
    const params = new URLSearchParams()
    params.set('display', 'full')
    params.set('sort', '[id_DESC]')
    params.set('limit', `${(page - 1) * limit},${limit}`)
    appendOrderFilters(params, filters)
    return `/orders?${params.toString()}`
}

const buildOrderCountQuery = (filters: OrderFilters) => {
    const params = new URLSearchParams()
    params.set('display', '[id]')
    appendOrderFilters(params, filters)
    return `/orders?${params.toString()}`
}

  async getFiltered(filters: OrderFilters, page: number, limit: number): Promise<string> {
        try {
            const url = buildOrderQuery(filters, page, limit)
            const response = await apiClient.get(url)
            return response.data as string
        } catch (error) {
            console.error(`Erreur lors de la récupération filtrée des commandes:`, error)
            throw error
        }
    },

    async countAll(): Promise<number> {
        try {
            const response = await apiClient.get(`/orders?display=[id]`)
            const xml = response.data as string
            const matchCount = (xml.match(/<order>/g) || []).length
            return matchCount
        } catch (error) {
            console.error(`Erreur lors du comptage de toutes les commandes:`, error)
            return 0
        }
    },

    async countFiltered(filters: OrderFilters): Promise<number> {
        try {
            const url = buildOrderCountQuery(filters)
            const response = await apiClient.get(url)
            const xml = response.data as string
            const matchCount = (xml.match(/<order>/g) || []).length
            return matchCount
        } catch (error) {
            console.error(`Erreur lors du comptage filtré des commandes:`, error)
            return 0
        }
    },

fichier Service :


    async getFiltered(filters: OrderFilters, page: number, limit: number): Promise<Order[]> {
        try {
            const xml = await OrdersApi.getFiltered(filters, page, limit)
            return parseOrderListXml(xml)
        } catch (error) {
            console.error('Erreur lors de la récupération filtrée des commandes:', error)
            return []
        }
    },

    async countAll(): Promise<number> {
        try {
            return await OrdersApi.countAll()
        } catch (error) {
            console.error('Erreur lors du comptage de toutes les commandes:', error)
            return 0
        }
    },

    async countFiltered(filters: OrderFilters): Promise<number> {
        try {
            return await OrdersApi.countFiltered(filters)
        } catch (error) {
            console.error('Erreur lors du comptage filtré des commandes:', error)
            return 0
        }
    },



        // totalOrders.value = await OrderService.countFiltered(resolvedFilters)
        // orders.value = await OrderService.getFiltered(resolvedFilters, currentPage.value, itemsPerPage)


