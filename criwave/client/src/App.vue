<template>
  <div class="app-container">
    <!-- Header -->
    <app-header @toggle-sidebar="toggleSidebar" />
    
    <!-- Sidebar -->
    <app-sidebar :isOpen="isSidebarOpen" @close="closeSidebar" />
    
    <!-- Contenido principal -->
    <main class="main-content">
      <div class="container">
        <!-- Dashboard como vista principal -->
        <app-dashboard />
      </div>
    </main>
  </div>
</template>

<script>
/**
 * Componente principal de la aplicación
 * 
 * Integra los componentes de header y sidebar,
 * y gestiona el estado del sidebar.
 * 
 * @component App
 */
import AppHeader from './components/layout/AppHeader.vue';
import AppSidebar from './components/layout/AppSidebar.vue';
import AppDashboard from './components/dashboard/Dashboard.vue';
import { useThemeStore } from './store/theme';

export default {
  name: 'App',
  
  components: {
    AppHeader,
    AppSidebar,
    AppDashboard
  },
  
  data() {
    return {
      isSidebarOpen: false,
      themeStore: useThemeStore
    };
  },
  
  methods: {
    /**
     * Alterna la visibilidad del sidebar
     */
    toggleSidebar(isOpen) {
      this.isSidebarOpen = isOpen !== undefined ? isOpen : !this.isSidebarOpen;
    },
    
    /**
     * Cierra el sidebar
     */
    closeSidebar() {
      this.isSidebarOpen = false;
    }
  },
  
  /**
   * Inicializa el tema al montar el componente
   */
  mounted() {
    // Inicializar el tema
    this.themeStore.actions.initTheme();
    
    // Cerrar el sidebar al cambiar el tamaño de la ventana
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.isSidebarOpen) {
        this.closeSidebar();
      }
    });
  },
  
  /**
   * Limpia los event listeners al desmontar el componente
   */
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  }
};
</script>

<style>
/* Estilos específicos del componente App */
.app-container {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  overflow: hidden; /* Evita desbordamientos que puedan causar bordes no deseados */
}

/* Contenedor principal */
.container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

/* Contenido principal */
.main-content {
  padding-top: 70px; /* Espacio para el header */
  min-height: calc(100vh - 70px);
}

/* Asegurarse de que no haya márgenes o bordes no deseados */
body, html {
  margin: 0;
  padding: 0;
  overflow-x: hidden; /* Previene scroll horizontal */
}

/* Ajustes responsive */
@media (max-width: 768px) {
  .main-content {
    padding-top: 64px; /* Ajustado para el header más pequeño en móviles */
  }
  
  .container {
    padding: 15px;
  }
}

@media (max-width: 576px) {
  .container {
    padding: 10px;
  }
}
</style> 