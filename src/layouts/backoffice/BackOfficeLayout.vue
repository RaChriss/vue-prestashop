<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BackSidebar from './fragments/BackSidebar.vue'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}
</script>

<template>
    <div class="backoffice-shell d-flex min-vh-100">
        <BackSidebar class="backoffice-sidebar" />

        <div class="backoffice-main flex-grow-1 d-flex flex-column" style="height: 100vh;">
            <header class="backoffice-topbar px-4 d-flex justify-content-between align-items-center">
                <div class="mb-0 fw-semibold"></div>
                <div class="d-flex align-items-center gap-3">
                    <RouterLink class="btn btn-outline-primary btn-sm backoffice-cta" to="/boutique">
                        Voir la boutique
                    </RouterLink>

                    <div class="dropdown">
                        <a href="#" class="d-flex align-items-center text-body text-decoration-none dropdown-toggle"
                            data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-person-circle fs-4"></i>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end shadow">
                            <li><a class="dropdown-item d-flex align-items-center gap-2" href="#"><i
                                        class="bi bi-person"></i> Profil</a></li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li>
                                <button
                                    class="dropdown-item text-danger d-flex align-items-center gap-2 border-0 bg-transparent w-100 text-start"
                                    @click="handleLogout"><i class="bi bi-box-arrow-right"></i> Déconnexion</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </header>

            <main class="backoffice-content p-4 overflow-auto flex-grow-1">
                <div class="backoffice-surface container-fluid rounded-4 p-4" style="min-height: 100%;">
                    <slot></slot>
                </div>
            </main>
        </div>
    </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap');

.backoffice-shell {
    font-family: 'Manrope', sans-serif;
    background: radial-gradient(1200px 600px at 10% -10%, rgba(255, 214, 153, 0.35), transparent 60%),
        radial-gradient(900px 500px at 90% 0%, rgba(168, 214, 255, 0.35), transparent 60%),
        linear-gradient(120deg, #f7f4ee 0%, #f3f7ff 50%, #fdf8ef 100%);
    color: #2f2a25;
}

.backoffice-main {
    background: transparent;
}

.backoffice-topbar {
    height: 72px;
    position: sticky;
    top: 0;
    z-index: 20;
    background: rgba(255, 255, 255, 0.78);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(212, 198, 176, 0.6);
}

.backoffice-topbar::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #ffcf70, #9ad6ff, #ffd6a6);
    opacity: 0.7;
}

.backoffice-content {
    background: transparent;
}

.backoffice-surface {
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(212, 198, 176, 0.6);
    box-shadow: 0 12px 30px rgba(78, 68, 54, 0.08);
}

.backoffice-cta {
    border-radius: 999px;
    padding: 0.4rem 1rem;
}
</style>