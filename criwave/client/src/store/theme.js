/**
 * Store para gestionar el tema de la aplicación
 * 
 * Maneja el cambio entre temas claro y oscuro, y persiste
 * la preferencia del usuario en localStorage.
 */

// Intentar cargar el tema guardado
let currentTheme = 'light';
try {
  const savedTheme = localStorage.getItem('theme-preference');
  if (savedTheme) {
    currentTheme = savedTheme;
  }
} catch (error) {
  console.error('Error al acceder a localStorage:', error);
}

// Formato de módulo Vuex
const themeModule = {
  namespaced: true,
  
  state: () => ({
    current: currentTheme
  }),
  
  getters: {
    /**
     * Verifica si el tema actual es oscuro
     * @returns {boolean} - true si el tema es oscuro
     */
    isDark: state => state.current === 'dark',
    
    /**
     * Verifica si el tema actual es claro
     * @returns {boolean} - true si el tema es claro
     */
    isLight: state => state.current === 'light'
  },
  
  mutations: {
    /**
     * Actualiza el tema actual
     * @param {Object} state - Estado del módulo
     * @param {string} theme - Nuevo tema ('light' o 'dark')
     */
    SET_THEME(state, theme) {
      state.current = theme;
    }
  },
  
  actions: {
    /**
     * Alterna entre temas claro y oscuro
     */
    toggleTheme({ state, commit }) {
      // Cambiar al tema opuesto
      const newTheme = state.current === 'light' ? 'dark' : 'light';
      commit('SET_THEME', newTheme);
      
      // Guardar en localStorage
      try {
        localStorage.setItem('theme-preference', newTheme);
      } catch (error) {
        console.error('Error al guardar en localStorage:', error);
      }
      
      // Aplicar al elemento HTML
      document.documentElement.setAttribute('data-theme', newTheme);
    },
    
    /**
     * Establece un tema específico
     * @param {Object} context - Contexto de la acción
     * @param {string} theme - El tema a establecer ('light' o 'dark')
     */
    setTheme({ commit }, theme) {
      if (theme !== 'light' && theme !== 'dark') return;
      
      commit('SET_THEME', theme);
      
      try {
        localStorage.setItem('theme-preference', theme);
      } catch (error) {
        console.error('Error al guardar en localStorage:', error);
      }
      
      document.documentElement.setAttribute('data-theme', theme);
    },
    
    /**
     * Inicializa el tema al cargar la aplicación
     */
    initTheme({ state }) {
      // Aplicar el tema guardado
      document.documentElement.setAttribute('data-theme', state.current);
    }
  }
};

export default themeModule; 