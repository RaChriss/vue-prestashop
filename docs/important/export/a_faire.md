# Export commande CSV (format Fichier 3)

## Objectif
Exporter une commande depuis le back office au format CSV **identique** au Fichier 3 de l’import :
`date, nom, email, pwd, adresse, achat, etat`

Le champ `achat` doit respecter :
`[("reference";quantite;"specificite"), ...]`

Références utiles :
- [src/service/import/ImportService.ts](src/service/import/ImportService.ts#L360)
- [src/service/import/ImportService.ts](src/service/import/ImportService.ts#L840-L919)

---

## Fichiers à créer

1) **Créer un service d’export**  
Créer le fichier : `src/service/export/OrderExportService.ts`

```ts
import Papa from 'papaparse'
import { OrderService } from '@/service/orders/OrderService'
import { CustomerService } from '@/service/customer/CustomerService'
import { AddressService } from '@/service/adresse/AddressService'
import { CombinationService } from '@/service/combination/CombinationService'
import { ProductOptionValueService } from '@/service/product_option_value/ProductOptionValueService'
import type { OrderRow } from '@/types/orders'

const formatDateFr = (dateStr: string): string => {
  const dateOnly = dateStr?.split(' ')[0] || ''
  const parts = dateOnly.split('-')
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr
}

const mapEtat = (stateId: number): string => {
  if (stateId === 5) return 'livre'
  if (stateId === 6) return 'annule'
  return ''
}

const downloadCsv = (content: string, fileName: string) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

const buildAchat = async (rows: OrderRow[]): Promise<string> => {
  const tuples = await Promise.all(rows.map(async (row) => {
    let specificite = ''
    if (row.product_attribute_id && row.product_attribute_id > 0) {
      const combo = await CombinationService.getById(row.product_attribute_id)
      const povIds = combo?.product_option_value_ids || []
      if (povIds.length > 0) {
        const pov = await ProductOptionValueService.getById(povIds[0])
        specificite = pov?.name || ''
      }
    }
    const ref = row.product_reference || String(row.product_id)
    return ("${ref}";${row.product_quantity};"${specificite}")
  }))
  return [${tuples.join(',')}]
}

export const OrderExportService = {
  async exportOrderFile3(orderId: number) {
    const order = await OrderService.getById(orderId)
    if (!order || !order.order_rows || order.order_rows.length === 0) {
      throw new Error('Commande ou lignes de commande introuvables.')
    }

    const customer = await CustomerService.getById(order.id_customer)
    const address = await AddressService.getById(order.id_address_delivery)

    const row = {
      date: formatDateFr(order.date_add),
      nom: ${customer?.firstname || ''} ${customer?.lastname || ''}.trim(),
      email: customer?.email || '',
      pwd: '',
      adresse: ${address?.address1 || ''},${address?.city || ''},
      achat: await buildAchat(order.order_rows),
      etat: mapEtat(order.current_state),
    }

    const csv = Papa.unparse([row], {
      delimiter: ',',
      quotes: true,
    })

    const fileName = `commande-${order.reference || order.id}.csv`
    downloadCsv(csv, fileName)
  }
}


Notes :

quotes: true est obligatoire car achat et adresse contiennent des virgules.
pwd peut rester vide si l’import est fait dans la meme base et que le client existe deja.
etat ne gere que livre et annule (meme logique que l’import).
Fichiers à modifier
Ajouter un bouton Exporter dans la vue back office
Fichier : src/views/backoffice/orders/OrdersList.vue

a) Script
Ajouter les imports + state + handler :


import { OrderExportService } from '@/service/export/OrderExportService'
import { ref } from 'vue'

const isExporting = ref(false)

const exportSelectedOrderCsv = async () => {
  if (!selectedOrder.value) return
  isExporting.value = true
  try {
    await OrderExportService.exportOrderFile3(selectedOrder.value.id)
  } finally {
    isExporting.value = false
  }
}



106 x 11
Voici le contenu d’un fichier Markdown que tu peux créer (par exemple docs/EXPORT_COMMANDE_CSV.md).
Il explique les fichiers à créer/modifier et fournit les blocs de code complets.

Notes :

quotes: true est obligatoire car achat et adresse contiennent des virgules.
pwd peut rester vide si l’import est fait dans la meme base et que le client existe deja.
etat ne gere que livre et annule (meme logique que l’import).
Fichiers à modifier
Ajouter un bouton Exporter dans la vue back office
Fichier : src/views/backoffice/orders/OrdersList.vue

a) Script
Ajouter les imports + state + handler :

b) Template
Dans le footer du modal de detail, ajouter un bouton :

<button class="btn btn-outline-primary rounded-3 me-2"
  :disabled="isExporting"
  @click="exportSelectedOrderCsv">
  <span v-if="isExporting" class="spinner-border spinner-border-sm me-1"></span>
  Exporter CSV
</button>