import apiClient from '@/api/client'
import type { OrderFilters } from '@/types/orders'

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

export const OrdersApi = {
    async create(xmlBody: string): Promise<string> {
        try {
            const response = await apiClient.post('/orders', xmlBody)
            return response.data as string
        } catch (error) {
            console.error('Erreur lors de la création de la commande:', error)
            throw error
        }
    },

    async update(id: number, xmlBody: string): Promise<string> {
        try {
            const response = await apiClient.put(`/orders/${id}`, xmlBody)
            return response.data as string
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la commande ${id}:`, error)
            throw error
        }
    },

    async patch(id: number, xmlBody: string): Promise<string> {
        try {
            const response = await apiClient.patch(`/orders/${id}`, xmlBody)
            return response.data as string
        } catch (error) {
            console.error(`Erreur lors du patch de la commande ${id}:`, error)
            throw error
        }
    },

    async getByCustomerId(customerId: number): Promise<string> {
        try {
            const response = await apiClient.get(`/orders?filter[id_customer]=${customerId}&display=full&sort=[id_DESC]`)
            return response.data as string
        } catch (error) {
            console.error(`Erreur lors de la récupération des commandes du client ${customerId}:`, error)
            throw error
        }
    },

    async getByCustomerIdPaginated(customerId: number, page: number, limit: number): Promise<string> {
        try {
            const response = await apiClient.get(`/orders?filter[id_customer]=${customerId}&display=full&sort=[id_DESC]&limit=${(page - 1) * limit},${limit}`)
            return response.data as string
        } catch (error) {
            console.error(`Erreur lors de la récupération paginée des commandes du client ${customerId}:`, error)
            throw error
        }
    },

    async countByCustomerId(customerId: number): Promise<number> {
        try {
            const response = await apiClient.get(`/orders?filter[id_customer]=${customerId}&display=[id]`)
            const xml = response.data as string
            const matchCount = (xml.match(/<order>/g) || []).length
            return matchCount
        } catch (error) {
            console.error(`Erreur lors du comptage des commandes du client ${customerId}:`, error)
            return 0
        }
    },

    async getById(id: number): Promise<string> {
        try {
            const response = await apiClient.get(`/orders/${id}`)
            return response.data as string
        } catch (error) {
            console.error(`Erreur lors de la récupération de la commande ${id}:`, error)
            throw error
        }
    },

    async getAll(): Promise<string> {
        try {
            const response = await apiClient.get('/orders?display=full&sort=[id_DESC]')
            return response.data as string
        } catch (error) {
            console.error('Erreur lors de la récupération de toutes les commandes:', error)
            throw error
        }
    },

    async getPaginated(page: number, limit: number): Promise<string> {
        try {
            const response = await apiClient.get(`/orders?display=full&sort=[id_DESC]&limit=${(page - 1) * limit},${limit}`)
            return response.data as string
        } catch (error) {
            console.error(`Erreur lors de la récupération paginée des commandes:`, error)
            throw error
        }
    },

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

    async getByDateRange(dateFrom: string, dateTo: string): Promise<string> {
        try {
            const dateFromEncoded = encodeURIComponent(dateFrom)
            const dateToEncoded = encodeURIComponent(dateTo)
            const url = `/orders?display=full&sort=[id_DESC]&filter[date_add]=[${dateFromEncoded},${dateToEncoded}]&date=1`
            const response = await apiClient.get(url)
            return response.data as string
        } catch (error) {
            console.error(`Erreur getByDateRange ${dateFrom} → ${dateTo}:`, error)
            throw error
        }
    }
}
