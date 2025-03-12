<template>
  <div class="sidebar-overlay" v-if="isOpen" @click="closeSidebar"></div>
  <aside class="app-sidebar" :class="{ 'is-open': isOpen }">
    <div class="sidebar-header">
      <h2 class="sidebar-title">CriWave</h2>
      <button class="close-button" @click="closeSidebar" aria-label="Cerrar menú">
        <span class="close-icon">✕</span>
      </button>
    </div>
    
    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li class="nav-item">
          <a href="#" class="nav-link active">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Dashboard</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <span class="nav-icon">🛒</span>
            <span class="nav-text">Punto de Venta</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <span class="nav-icon">📦</span>
            <span class="nav-text">Inventario</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <span class="nav-icon">👥</span>
            <span class="nav-text">Clientes</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <span class="nav-icon">💰</span>
            <span class="nav-text">Finanzas</span>
          </a>
        </li>
        <li class="nav-item">
          <a href="#" class="nav-link">
            <span class="nav-icon">⚙️</span>
            <span class="nav-text">Configuración</span>
          </a>
        </li>
      </ul>
    </nav>
    
    <div class="sidebar-footer">
      <p class="version-info">v1.0.0</p>
    </div>
  </aside>
</template>

<script>
/**
 * Componente de menú lateral
 * 
 * Se muestra al hacer clic en el logo del header
 * Contiene enlaces a las diferentes secciones de la aplicación
 * 
 * @component AppSidebar
 */
export default {
  name: 'AppSidebar',
  
  props: {
    /**
     * Indica si el sidebar está abierto o cerrado
     */
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  
  methods: {
    /**
     * Cierra el sidebar
     */
    closeSidebar() {
      this.$emit('close');
    }
  }
};
</script>

<style scoped>
/* Overlay que oscurece el fondo cuando el sidebar está abierto */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Estilos del sidebar */
.app-sidebar {
  position: fixed;
  top: 0;
  left: -280px; /* Oculto por defecto */
  width: 280px;
  height: 100vh;
  background-color: var(--sidebar-bg);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  transition: left 0.3s ease;
  display: flex;
  flex-direction: column;
}

/* Cuando está abierto */
.app-sidebar.is-open {
  left: 0;
}

/* Cabecera del sidebar */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.sidebar-title {
  color: var(--text-primary);
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Navegación */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: background-color 0.2s;
  border-left: 3px solid transparent;
}

.nav-link:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.nav-link.active {
  background-color: rgba(0, 0, 0, 0.05);
  border-left-color: var(--sidebar-active);
  font-weight: 500;
}

.nav-icon {
  margin-right: 0.75rem;
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

/* Pie del sidebar */
.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border);
  text-align: center;
}

.version-info {
  color: var(--text-secondary);
  font-size: 0.8rem;
  margin: 0;
}

/* Ajustes para modo oscuro */
html[data-theme="dark"] .close-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

html[data-theme="dark"] .nav-link:hover,
html[data-theme="dark"] .nav-link.active {
  background-color: rgba(255, 255, 255, 0.05);
}
</style> 