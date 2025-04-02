<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-content">
        <!-- Grupo del logo -->
        <div class="header-left">
          <!-- Botón de menú con logo -->
          <button 
            class="menu-button" 
            @click="toggleSidebar" 
            aria-label="Abrir menú lateral"
            :class="{ 'hide-on-sidebar-open': isSidebarOpen }"
            :disabled="isSidebarOpen"
          >
            <img 
              :src="logoSrc" 
              alt="Leadwave" 
              class="logo-image"
            />
          </button>
        </div>
        
        <!-- Perfil de usuario y tema -->
        <div class="user-actions">
          <!-- Botón de tema -->
          <theme-toggle />
          
          <!-- Perfil de usuario -->
          <div class="user-profile" @click="toggleUserMenu">
            <div class="user-avatar">
              <span class="user-initial">{{ userInitial }}</span>
            </div>
            <span class="user-name hide-on-mobile">{{ userName }}</span>
            
            <!-- Menú desplegable del usuario (oculto por defecto) -->
            <div class="user-menu" v-if="isUserMenuOpen">
              <div class="menu-item">
                <span class="menu-icon user-icon"></span>
                <span>Perfil</span>
              </div>
              <div class="menu-item">
                <span class="menu-icon settings-icon"></span>
                <span>Configuración</span>
              </div>
              <div class="menu-divider"></div>
              <div class="menu-item">
                <span class="menu-icon logout-icon"></span>
                <span>Cerrar sesión</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
/**
 * Componente de header principal de la aplicación
 * 
 * Incluye:
 * - Logo que activa el menú lateral
 * - Título de la sección actual
 * - Botón de cambio de tema
 * - Perfil de usuario
 * 
 * @component AppHeader
 */
import ThemeToggle from '../ui/ThemeToggle.vue';
import { computed } from 'vue';
import { useStore } from 'vuex';

export default {
  name: 'AppHeader',
  
  components: {
    ThemeToggle
  },
  
  props: {
    // Añadir prop para saber si el sidebar está abierto
    isSidebarOpen: {
      type: Boolean,
      default: false
    }
  },
  
  setup() {
    const store = useStore();
    
    // Determina la imagen del logo según el tema actual
    const logoSrc = computed(() => {
      return store.getters['theme/isDark'] ? '/img/Wblanco.png' : '/img/Wnegro.png';
    });
    
    return {
      logoSrc
    };
  },
  
  data() {
    return {
      isUserMenuOpen: false,
      // Datos de usuario de prueba
      userName: 'Christian R'
    };
  },
  
  computed: {
    /**
     * Obtiene la inicial del nombre de usuario para el avatar
     */
    userInitial() {
      return this.userName.charAt(0);
    }
  },
  
  methods: {
    /**
     * Alterna la visibilidad del menú de usuario
     */
    toggleUserMenu() {
      this.isUserMenuOpen = !this.isUserMenuOpen;
    },
    
    /**
     * Alterna la visibilidad del menú lateral
     */
    toggleSidebar() {
      // Emitir evento para que el componente padre pueda reaccionar
      this.$emit('toggle-sidebar');
    }
  },
  
  // Cerrar el menú de usuario si se hace clic fuera de él
  mounted() {
    document.addEventListener('click', (event) => {
      const userProfile = this.$el.querySelector('.user-profile');
      if (userProfile && !userProfile.contains(event.target) && this.isUserMenuOpen) {
        this.isUserMenuOpen = false;
      }
    });
  },
  
  // Limpiar event listeners al destruir el componente
  beforeUnmount() {
    // No hay un handler específico que quitar ya que usamos una función anónima
    // en el addEventListener
  }
};
</script>

<style scoped>
/* Estilos del header */
.app-header {
  background-color: var(--header-bg);
  position: fixed;
  top: 0;
  right: 0;
  height: 56px;
  z-index: 100; /* Ajustado para estar por debajo del sidebar */
  color: var(--header-text);
  box-shadow: var(--card-shadow);
  transition: left 0.3s ease; /* Añadida transición suave */
  left: 0;
}

/* Ajuste cuando el sidebar está abierto en pantallas grandes */
@media (min-width: 769px) {
  :root[data-sidebar-open='true'] .app-header {
    left: 280px; /* Se mueve junto con el contenido cuando el sidebar está abierto */
  }
}

.header-container {
  width: 100%;
  padding: 0 16px;
  height: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

/* Grupo izquierdo: logo */
.header-left {
  display: flex;
  align-items: center;
  flex: 1;
  padding-left: 10px;
}

/* Botón de menú */
.menu-button {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s;
  padding: 5px;
  border-radius: 8px;
}

.menu-button:hover {
  transform: scale(1.05);
  background-color: rgba(0, 0, 0, 0.05);
}

.menu-button:active {
  transform: scale(0.95);
}

.logo-image {
  height: 42px; /* Aumentado significativamente */
  width: auto;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: all 0.3s ease;
}

/* Perfil de usuario */
.user-actions {
  display: flex;
  align-items: center;
  height: 100%;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 16px;
  position: relative;
  height: 40px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--user-avatar-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--user-avatar-text);
  font-weight: 500;
}

.user-initial {
  font-size: 0.9rem;
  color: var(--user-avatar-text);
}

.user-name {
  margin-left: 8px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.9rem;
}

/* Menú desplegable del usuario */
.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px; /* Ajustado margen */
  background-color: var(--user-menu-bg);
  border-radius: 8px; /* Bordes más redondeados */
  box-shadow: var(--user-menu-shadow); /* Sombra adaptativa */
  min-width: 200px; /* Ligeramente más ancho */
  z-index: 1000;
  overflow: hidden; /* Para que los bordes redondeados se apliquen a los items */
  border: 1px solid var(--user-menu-border);
}

.menu-item {
  padding: 12px 16px;
  color: var(--text-primary);
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
}

/* Iconos del menú de usuario */
.menu-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 10px;
  position: relative;
  opacity: 0.8;
}

.user-icon::before {
  content: '';
  position: absolute;
  top: 3px;
  left: 5px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
}

.user-icon::after {
  content: '';
  position: absolute;
  top: 11px;
  left: 2px;
  width: 12px;
  height: 6px;
  border-radius: 6px 6px 0 0;
  background-color: currentColor;
}

.settings-icon::before,
.settings-icon::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  top: 2px;
  left: 2px;
  border-radius: 50%;
  border: 1px solid currentColor;
}

.settings-icon::after {
  width: 6px;
  height: 6px;
  top: 5px;
  left: 5px;
}

.logout-icon::before,
.logout-icon::after {
  content: '';
  position: absolute;
  background-color: currentColor;
}

.logout-icon::before {
  top: 3px;
  left: 6px;
  width: 8px;
  height: 8px;
  border: 2px solid currentColor;
  border-radius: 2px;
}

.logout-icon::after {
  top: 8px;
  right: 2px;
  width: 6px;
  height: 2px;
}

.menu-item:hover {
  background-color: var(--nav-link-hover-bg);
  color: var(--nav-link-hover-text-color);
}

.menu-item:hover .menu-icon {
  opacity: 1;
}

.menu-divider {
  height: 1px;
  background-color: var(--border);
  margin: 4px 0;
}

/* Media queries para pantallas pequeñas */
@media (max-width: 768px) {
  .app-header {
    height: 64px; /* Ligeramente más alto en tabletas */
  }
  
  .logo-image {
    height: 46px; /* Más grande en tabletas */
  }
  
  .menu-button {
    padding: 0 0 0 12px; /* Reducido padding en tablets */
  }
}

@media (max-width: 576px) {
  .logo-image {
    height: 44px; /* Más grande en móviles */
  }
  
  .menu-button {
    padding: 0 0 0 10px; /* Reducido padding en móviles */
  }
  
  .user-avatar {
    width: 34px;
    height: 34px;
  }
  
  .user-initial {
    font-size: 1rem;
  }
  
  .header-container {
    padding: 0 8px 0 0; /* Reducido en móviles */
  }
  
  .hide-on-mobile {
    display: none;
  }
}

/* Añadir media query para pantallas muy pequeñas */
@media (max-width: 400px) {
  .logo-image {
    height: 42px; /* Ajustado para pantallas muy pequeñas */
  }
  
  .menu-button {
    padding: 0 0 0 8px; /* Reducido padding en pantallas muy pequeñas */
  }
}

/* Ocultar y deshabilitar botón cuando el sidebar está abierto en pantallas grandes */
@media (min-width: 769px) {
  .hide-on-sidebar-open {
    opacity: 0;
    visibility: hidden;
    pointer-events: none; /* Deshabilita la interacción */
    transition: opacity 0.3s ease, visibility 0.3s ease;
  }
}
</style> 