import { createRouter, createWebHistory } from 'vue-router';

// Importación de vistas
// Usa importaciones dinámicas para mejorar el rendimiento
const DashboardView = () => import('../views/DashboardView.vue');

// Definir rutas
const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView
  },
  // Ruta para capturar todas las rutas no definidas
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

// Crear instancia del router
const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router; 