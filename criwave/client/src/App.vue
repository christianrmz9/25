<template>
  <div class="app-container" :class="{ 'sidebar-open': isSidebarOpen }">
    <!-- Cargar Material Icons -->
    <material-icons-loader />
    
    <!-- Header -->
    <app-header 
      @toggle-sidebar="toggleSidebar"
      :isSidebarOpen="isSidebarOpen"
    />
    
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
import MaterialIconsLoader from './components/ui/MaterialIconsLoader.vue';
import { onMounted, onBeforeUnmount, ref } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'App',
  
  components: {
    AppHeader,
    AppSidebar,
    AppDashboard,
    MaterialIconsLoader
  },
  
  setup() {
    const store = useStore();
    const isSidebarOpen = ref(false);
    
    // Alterna la visibilidad del sidebar
    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
      document.documentElement.setAttribute('data-sidebar-open', isSidebarOpen.value);
    };
    
    // Cierra el sidebar
    const closeSidebar = () => {
      isSidebarOpen.value = false;
      document.documentElement.setAttribute('data-sidebar-open', 'false');
    };
    
    // Maneja el cambio de tamaño de la ventana
    const handleResize = () => {
      if (window.innerWidth <= 768 && isSidebarOpen.value) {
        closeSidebar();
      }
    };
    
    onMounted(() => {
      // Inicializar el tema
      store.dispatch('theme/initTheme');
      
      // Inicializar el estado del sidebar
      document.documentElement.setAttribute('data-sidebar-open', 'false');
      
      // Cerrar el sidebar al cambiar el tamaño de la ventana
      window.addEventListener('resize', handleResize);
    });
    
    onBeforeUnmount(() => {
      window.removeEventListener('resize', handleResize);
    });
    
    return {
      isSidebarOpen,
      toggleSidebar,
      closeSidebar
    };
  }
};
</script>

<style>
/* Estilos específicos del componente App */
.app-container {
  min-height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  transition: padding-left 0.3s ease;
}

/* Cuando el sidebar está abierto en pantallas grandes */
@media (min-width: 769px) {
  .app-container.sidebar-open {
    padding-left: 280px; /* Ancho del sidebar */
  }
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
  flex: 1;
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