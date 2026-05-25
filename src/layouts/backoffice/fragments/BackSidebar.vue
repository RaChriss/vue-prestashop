<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import AppChevron from '@/components/chevron/AppChevron.vue'

const route = useRoute()

interface MenuItem {
    title: string
    route?: string
    icon?: string
    children?: MenuItem[]
}

const menuItems = ref<(MenuItem & { isOpen?: boolean })[]>([
    {
        title: 'Tableau de bord',
        route: '/',
        icon: 'bi-speedometer2'
    },
    {
        title: 'Commandes',
        route: '/commandes',
        icon: 'bi-cart'
    },
    {
        title: 'Statistiques',
        route: '/statistiques',
        icon: 'bi-bar-chart-line'
    },
    {
        title: 'Stock',
        icon: 'bi-box-seam',
        children: [
            {
                title: 'Gestion des stocks',
                route: '/stocks',
                icon: 'bi-boxes'
            },
            {
                title: 'Évolution journalière',
                route: '/stocks/evolution',
                icon: 'bi-graph-up'
            },
            {
                title: 'Réservations par catégorie',
                route: '/stocks/reservation',
                icon: 'bi-journal-check'
            }
        ]
    },

    {
        title: 'Import de données',
        route: '/import',
        icon: 'bi-cloud-download'
    },
    {
        title: 'Réinitialisation',
        route: '/reset',
        icon: 'bi-arrow-clockwise'
    }

])

const isActive = (itemRoute?: string) => {
    if (!itemRoute) return false
    return route.path === itemRoute
}

const isChildActive = (children?: MenuItem[]) => {
    if (!children) return false
    return children.some(child => isActive(child.route))
}

const toggleMenu = (item: any) => {
    item.isOpen = !item.isOpen
}
</script>

<template>
    <nav class="backoffice-sidebar d-flex flex-column flex-shrink-0 min-vh-100">
        <div class="backoffice-brand d-flex align-items-center px-4">
            <RouterLink to="/" class="text-decoration-none w-100 text-center">
                <h2 class="backoffice-brand-title fw-bold text-uppercase h4 mb-0">
                    <span class="text-primary">Erp</span>Shop
                </h2>
            </RouterLink>
        </div>
        <hr class="m-0 backoffice-divider">
        <div class="p-3 d-flex flex-column flex-grow-1 overflow-auto backoffice-scroll">
            <ul class="nav nav-pills flex-column mb-auto">
                <li class="nav-item mb-1" v-for="(item, index) in menuItems" :key="index">

                    <RouterLink v-if="!item.children" :to="item.route!"
                        class="nav-link backoffice-nav-link d-flex align-items-center gap-2"
                        :class="{ 'active': isActive(item.route) }">
                        <i class="bi" :class="item.icon || 'bi-circle'"></i>
                        {{ item.title }}
                    </RouterLink>

                    <div v-else>
                        <button
                            class="nav-link backoffice-nav-link d-flex justify-content-between align-items-center w-100 border-0"
                            :class="[isChildActive(item.children) ? 'active' : 'bg-transparent']"
                            @click="toggleMenu(item)">
                            <div class="d-flex align-items-center gap-2">
                                <i class="bi" :class="item.icon || 'bi-circle'"></i>
                                <span>{{ item.title }}</span>
                            </div>
                            <AppChevron :is-open="!!item.isOpen" />
                        </button>
                        <div class="collapse" :class="{ 'show': item.isOpen || isChildActive(item.children) }">
                            <ul class="nav flex-column ms-3 mt-1">
                                <li class="nav-item" v-for="(child, childIndex) in item.children" :key="childIndex">
                                    <RouterLink
                                        class="nav-link backoffice-sub-link py-1 opacity-75 d-flex align-items-center gap-2"
                                        :class="{ 'active fw-bold opacity-100': isActive(child.route) }"
                                        :to="child.route!">
                                        <i class="fs-6 bi" :class="child.icon || 'bi-dash'"></i>
                                        {{ child.title }}
                                    </RouterLink>
                                </li>
                            </ul>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
    </nav>
</template>

<style scoped>
.backoffice-sidebar {
    width: 260px;
    background: linear-gradient(180deg, #fff7ea 0%, #fff2dc 55%, #fffaf2 100%);
    border-right: 1px solid rgba(210, 190, 164, 0.6);
    box-shadow: 10px 0 30px rgba(78, 68, 54, 0.08);
}

.backoffice-brand {
    height: 72px;
}

.backoffice-brand-title {
    color: #2f2a25;
    letter-spacing: 0.06em;
}

.backoffice-divider {
    border-color: rgba(210, 190, 164, 0.5);
}

.backoffice-nav-link {
    color: #3a332d;
    border-radius: 12px;
    padding: 0.6rem 0.75rem;
    transition: all 0.2s ease;
}

.backoffice-nav-link:hover {
    background-color: rgba(255, 205, 120, 0.35);
    color: #2a1f12;
}

.backoffice-nav-link.active {
    background: linear-gradient(135deg, #ffcf70, #ffb86b);
    color: #3a2400 !important;
    box-shadow: 0 8px 18px rgba(255, 198, 93, 0.35);
}

.backoffice-sub-link {
    color: #3a332d;
    border-radius: 10px;
    padding-left: 0.75rem;
}

.backoffice-sub-link:hover {
    background-color: rgba(168, 214, 255, 0.35);
    color: #1f3348;
}

.backoffice-sub-link.active {
    background-color: rgba(168, 214, 255, 0.6) !important;
    color: #12263a !important;
}
</style>