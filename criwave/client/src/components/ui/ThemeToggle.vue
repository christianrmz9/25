<template>
  <button 
    @click="toggleTheme" 
    class="theme-toggle" 
    :aria-label="buttonLabel"
    :title="buttonLabel"
    :class="{ 'is-dark': isDark }"
  >
    <div class="toggle-wrapper">
      <!-- Fondo del toggle -->
      <div class="toggle-background"></div>
      
      <!-- Círculo que se mueve -->
      <div class="toggle-circle">
        <!-- Icono de sol -->
        <svg 
          class="theme-icon sun-icon" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
        </svg>
        
        <!-- Icono de luna -->
        <svg 
          class="theme-icon moon-icon" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"></path>
        </svg>
      </div>
    </div>
  </button>
</template>

<script>
/**
 * Componente de botón para alternar entre temas claro y oscuro
 * 
 * Este componente permite al usuario cambiar entre los modos de tema
 * y guarda la preferencia en localStorage para mantenerla entre sesiones.
 * 
 * @component ThemeToggle
 * @example
 * <theme-toggle />
 */
import { useThemeStore } from '../../store/theme';

export default {
  name: 'ThemeToggle',
  
  data() {
    return {
      themeStore: useThemeStore
    };
  },
  
  computed: {
    /**
     * Determina si el tema actual es oscuro
     */
    isDark() {
      return this.themeStore.getters.isDark();
    },
    
    /**
     * Texto accesible para el botón
     */
    buttonLabel() {
      return this.isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro';
    }
  },
  
  methods: {
    /**
     * Método para alternar el tema
     */
    toggleTheme() {
      this.themeStore.actions.toggleTheme();
    }
  }
};
</script>

<style scoped>
/* Estilos del botón de cambio de tema */
.theme-toggle {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  position: relative;
  transition: transform 0.2s;
  /* Eliminar el contorno al hacer clic */
  outline: none;
}

/* Eliminar el contorno en todos los navegadores */
.theme-toggle:focus {
  outline: none;
  box-shadow: none;
}

/* Eliminar el contorno en Firefox */
.theme-toggle::-moz-focus-inner {
  border: 0;
}

/* Contenedor principal del toggle */
.toggle-wrapper {
  position: relative;
  width: 40px;
  height: 20px;
  display: flex;
  align-items: center;
}

/* Fondo del toggle */
.toggle-background {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: #e0e0e0;
  border-radius: 10px;
  transition: background-color 0.3s ease;
}

/* Círculo que se mueve */
.toggle-circle {
  position: absolute;
  left: 0;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55), background-color 0.3s ease;
}

/* Iconos dentro del círculo */
.theme-icon {
  position: absolute;
  width: 14px;
  height: 14px;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.sun-icon {
  opacity: 0;
  transform: scale(0.7);
  color: #FFB020;
}

.moon-icon {
  opacity: 1;
  color: #7d8298;
}

/* Estado oscuro */
.theme-toggle.is-dark .toggle-background {
  background-color: #3a3a3a;
}

.theme-toggle.is-dark .toggle-circle {
  transform: translateX(20px);
  background-color: #121212;
}

.theme-toggle.is-dark .sun-icon {
  opacity: 1;
  transform: scale(1);
}

.theme-toggle.is-dark .moon-icon {
  opacity: 0;
  transform: scale(0.7);
}

/* Efecto hover */
.theme-toggle:hover {
  transform: scale(1.05);
}

/* Efecto active */
.theme-toggle:active {
  transform: scale(0.95);
}

/* Ajustes responsive */
@media (max-width: 576px) {
  .theme-toggle {
    width: 40px;
    height: 40px;
  }
  
  .toggle-wrapper {
    width: 36px;
    height: 18px;
  }
  
  .toggle-circle {
    width: 18px;
    height: 18px;
  }
  
  .theme-toggle.is-dark .toggle-circle {
    transform: translateX(18px);
  }
  
  .theme-icon {
    width: 12px;
    height: 12px;
  }
}
</style> 