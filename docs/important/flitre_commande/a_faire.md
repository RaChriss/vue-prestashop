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

