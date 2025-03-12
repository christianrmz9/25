/**
 * Store para gestionar el tema de la aplicación
 * 
 * Maneja el cambio entre temas claro y oscuro, y persiste
 * la preferencia del usuario en localStorage.
 */
import { reactive } from 'vue';

// Crear un estado reactivo
const state = reactive({
  // Inicializar con el tema guardado o el predeterminado
  current: 'light'
});

// Intentar cargar el tema guardado
try {
  const savedTheme = localStorage.getItem('theme-preference');
  if (savedTheme) {
    state.current = savedTheme;
  }
} catch (error) {
  console.error('Error al acceder a localStorage:', error);
}

export const useThemeStore = {
  state,
  
  getters: {
    /**
     * Verifica si el tema actual es oscuro
     * @returns {boolean} - true si el tema es oscuro
     */
    isDark() {
      return state.current === 'dark';
    },
    
    /**
     * Verifica si el tema actual es claro
     * @returns {boolean} - true si el tema es claro
     */
    isLight() {
      return state.current === 'light';
    }
  },
  
  actions: {
    /**
     * Alterna entre temas claro y oscuro
     */
    toggleTheme() {
      // Cambiar al tema opuesto
      state.current = state.current === 'light' ? 'dark' : 'light';
      
      // Guardar en localStorage
      try {
        localStorage.setItem('theme-preference', state.current);
      } catch (error) {
        console.error('Error al guardar en localStorage:', error);
      }
      
      // Aplicar al elemento HTML
      document.documentElement.setAttribute('data-theme', state.current);
    },
    
    /**
     * Establece un tema específico
     * @param {string} theme - El tema a establecer ('light' o 'dark')
     */
    setTheme(theme) {
      if (theme !== 'light' && theme !== 'dark') return;
      
      state.current = theme;
      
      try {
        localStorage.setItem('theme-preference', state.current);
      } catch (error) {
        console.error('Error al guardar en localStorage:', error);
      }
      
      document.documentElement.setAttribute('data-theme', state.current);
    },
    
    /**
     * Inicializa el tema al cargar la aplicación
     */
    initTheme() {
      // Aplicar el tema guardado
      document.documentElement.setAttribute('data-theme', state.current);
    }
  }
}; 