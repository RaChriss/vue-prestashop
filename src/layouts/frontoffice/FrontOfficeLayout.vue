<script setup lang="ts">
import FrontNavbar from './fragments/FrontNavbar.vue'
</script>

<template>
    <div class="frontoffice-shell min-vh-100 d-flex flex-column">
        <FrontNavbar />

        <main class="frontoffice-main flex-grow-1">
            <div class="container-fluid px-md-5 py-4">
                <div class="content-wrapper frontoffice-surface p-4 rounded-4 mt-3">
                    <slot></slot>
                </div>
            </div>
        </main>

        <footer class="frontoffice-footer text-center py-4">
            <div class="container text-muted small">
                &copy; {{ new Date().getFullYear() }}
            </div>
        </footer>
    </div>

</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');

.frontoffice-shell {
    font-family: 'Space Grotesk', sans-serif;
    --fo-ink: #1f1d1a;
    --fo-muted: #6b6b6b;
    --fo-accent: #ff8f3f;
    --fo-accent-2: #2f6bff;
    background: radial-gradient(900px 600px at 15% -10%, rgba(255, 210, 140, 0.45), transparent 60%),
        radial-gradient(800px 500px at 85% 0%, rgba(173, 210, 255, 0.4), transparent 60%),
        linear-gradient(120deg, #fdf7ee 0%, #f5f8ff 45%, #fff8ec 100%);
    color: var(--fo-ink);
}

.frontoffice-main {
    background: transparent;
}

.frontoffice-surface {
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(210, 215, 227, 0.7);
    box-shadow: 0 18px 40px rgba(30, 34, 48, 0.08);
}

.frontoffice-footer {
    background: rgba(255, 255, 255, 0.8);
    border-top: 1px solid rgba(210, 215, 227, 0.7);
}

.content-wrapper {
    min-height: calc(100vh - 250px);
    transition: all 0.3s ease;
    width: 100%;
}
</style>