<template>
  <header class="app-header">
    <div class="header-container">
      <div class="header-content">
        <!-- Logo que activa el menú lateral -->
        <button class="logo-button" @click="toggleSidebar" aria-label="Abrir menú lateral">
          <img 
            :src="logoSrc" 
            alt="Logo CriWave" 
            class="logo-image"
          />
        </button>
        
        <!-- Buscador -->
        <div class="search-container">
          <input 
            type="text" 
            class="search-input" 
            placeholder="Buscar..." 
            v-model="searchQuery"
            @keyup.enter="handleSearch"
          />
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
                <span class="menu-icon">👤</span>
                <span>Perfil</span>
              </div>
              <div class="menu-item">
                <span class="menu-icon">⚙️</span>
                <span>Configuración</span>
              </div>
              <div class="menu-divider"></div>
              <div class="menu-item">
                <span class="menu-icon">🚪</span>
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
 * - Buscador
 * - Botón de cambio de tema
 * - Perfil de usuario
 * 
 * @component AppHeader
 */
import ThemeToggle from '../ui/ThemeToggle.vue';
import { useThemeStore } from '../../store/theme';

export default {
  name: 'AppHeader',
  
  components: {
    ThemeToggle
  },
  
  data() {
    return {
      searchQuery: '',
      isUserMenuOpen: false,
      isSidebarOpen: false,
      themeStore: useThemeStore,
      // Datos de usuario de prueba
      userName: 'Christian R'
    };
  },
  
  computed: {
    /**
     * Determina la imagen del logo según el tema actual
     */
    logoSrc() {
      // Usar logo blanco en modo oscuro y negro en modo claro
      return this.themeStore.getters.isDark() 
        ? '/img/Wblanco.png' 
        : '/img/Wnegro.png';
    },
    
    /**
     * Obtiene la inicial del nombre de usuario para el avatar
     */
    userInitial() {
      return this.userName.charAt(0);
    }
  },
  
  methods: {
    /**
     * Maneja la búsqueda cuando se presiona Enter
     */
    handleSearch() {
      if (this.searchQuery.trim()) {
        console.log('Buscando:', this.searchQuery);
        // Aquí iría la lógica de búsqueda
      }
    },
    
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
      this.isSidebarOpen = !this.isSidebarOpen;
      // Emitir evento para que el componente padre pueda reaccionar
      this.$emit('toggle-sidebar', this.isSidebarOpen);
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
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style scoped>
/* Estilos del header */
.app-header {
  background-color: var(--header-bg);
  border-bottom: none; /* Eliminado el borde inferior */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px; /* Aumentado de 60px a 70px para dar más espacio vertical */
  z-index: 1000;
  box-shadow: none; /* Eliminada la sombra */
  padding: 0; /* Sin padding en el header */
}

.header-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 10px 0 0; /* Solo padding derecho */
  height: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

/* Logo */
.logo-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 0 0 15px; /* Añadido padding izquierdo de 15px */
  display: flex;
  align-items: center;
  transition: transform 0.2s;
  margin-right: 5px; /* Reducido margen derecho */
}

.logo-button:hover {
  transform: scale(1.05);
}

.logo-button:active {
  transform: scale(0.95);
}

.logo-image {
  height: 42px; /* Aumentado de 36px a 42px */
  width: auto;
}

/* Buscador */
.search-container {
  flex: 1;
  max-width: 200px;
  margin: 0 20px;
  position: relative;
  display: flex;
  align-items: center;
  height: 36px;
}

.search-input {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background-color: var(--search-bg);
  color: var(--search-text);
  font-size: 0.9rem;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) inset;
}

.search-input::placeholder {
  color: var(--search-placeholder);
  opacity: 1;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) inset;
}

/* Perfil de usuario */
.user-actions {
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 5px; /* Añadido padding */
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-left: 16px; /* Aumentado margen */
  position: relative;
  height: 40px; /* Altura fija */
}

.user-avatar {
  width: 38px; /* Ligeramente más grande */
  height: 38px; /* Ligeramente más grande */
  border-radius: 50%;
  background-color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.user-initial {
  font-size: 1.2rem;
}

.user-name {
  margin-left: 10px; /* Aumentado margen */
  font-weight: 500;
  color: var(--text-primary);
}

/* Menú desplegable del usuario */
.user-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px; /* Ajustado margen */
  background-color: var(--bg-secondary);
  border-radius: 8px; /* Bordes más redondeados */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15); /* Sombra más pronunciada */
  min-width: 200px; /* Ligeramente más ancho */
  z-index: 1000;
  overflow: hidden; /* Para que los bordes redondeados se apliquen a los items */
}

.menu-item {
  padding: 12px 16px; /* Más padding */
  color: var(--text-primary);
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
}

.menu-icon {
  margin-right: 10px;
  opacity: 0.8;
}

.menu-item:hover {
  background-color: var(--bg-primary);
}

.menu-item:hover .menu-icon {
  opacity: 1;
}

.menu-divider {
  height: 1px;
  background-color: var(--border);
  margin: 4px 0;
}

/* Ajustes responsive */
@media (max-width: 768px) {
  .search-container {
    max-width: 250px; /* Reducido de 300px a 250px */
    margin: 0 10px; /* Reducido en pantallas más pequeñas */
  }
  
  .app-header {
    height: 64px; /* Ligeramente más pequeño en móviles */
  }
  
  .logo-image {
    height: 38px; /* Aumentado de 32px a 38px en tablets */
  }
  
  .logo-button {
    padding: 0 0 0 12px; /* Reducido padding en tablets */
  }
}

@media (max-width: 576px) {
  .search-container {
    max-width: 200px; /* Establecido un ancho máximo más pequeño */
    margin: 0 8px;
    height: 36px; /* Reducido de 40px a 36px */
  }
  
  .search-input {
    height: 36px; /* Reducido de 40px a 36px */
    font-size: 0.9rem; /* Texto más pequeño */
    padding: 0 36px 0 12px; /* Padding reducido */
    border-radius: 18px; /* Ajustado para mantener proporciones */
  }
  
  .search-button {
    height: 36px; /* Reducido de 40px a 36px */
    width: 36px; /* Reducido de 40px a 36px */
    right: 8px; /* Ajustado posición */
  }
  
  .search-icon {
    width: 16px; /* Reducido de 18px a 16px */
    height: 16px; /* Reducido de 18px a 16px */
  }
  
  .logo-image {
    height: 36px; /* Aumentado de 32px a 36px en móviles */
  }
  
  .logo-button {
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
}

/* Añadir media query para pantallas muy pequeñas */
@media (max-width: 400px) {
  .search-container {
    max-width: 140px; /* Reducido de 160px a 140px */
    height: 32px; /* Aún más pequeño */
    margin: 0 6px;
  }
  
  .search-input {
    height: 32px; /* Aún más pequeño */
    font-size: 0.85rem;
    padding: 0 32px 0 10px;
    border-radius: 16px;
  }
  
  .search-button {
    height: 32px;
    width: 32px;
    right: 6px;
  }
  
  .search-icon {
    width: 14px;
    height: 14px;
  }
  
  .logo-image {
    height: 34px; /* Ajustado para pantallas muy pequeñas */
  }
  
  .logo-button {
    padding: 0 0 0 8px; /* Reducido padding en pantallas muy pequeñas */
  }
}
</style> 