<template>
  <div class="search-bar-container">
    <div class="search-input-wrapper" :class="{ 'has-focus': isFocused, 'has-value': !!searchQuery }">
      <span class="search-icon">
        <icon name="search" />
      </span>
      <input
        type="text"
        class="search-input"
        v-model="searchQuery"
        @focus="handleFocus"
        @blur="handleBlur"
        @input="handleInput"
        @keydown="handleKeydown"
        :placeholder="placeholder"
        autocomplete="off"
        spellcheck="false"
      />
      <button
        class="clear-button"
        v-if="searchQuery"
        @click="clearSearch"
        @mousedown.prevent
        title="Borrar búsqueda"
      >
        <icon name="close" size="sm" />
      </button>
      <kbd class="keyboard-shortcut" v-if="!isFocused && !searchQuery && !isMobile">Ctrl+K</kbd>
    </div>
  </div>
</template>

<script>
/**
 * Componente de barra de búsqueda
 * 
 * Características:
 * - Soporte para historial de búsquedas recientes
 * - Sugerencias personalizables
 * - Navegación con teclado
 * - Atajo de teclado Ctrl+K (solo en escritorio)
 * 
 * @component SearchBar
 */
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import MaterialIcon from './Icon.vue';

export default {
  name: 'SearchBar',
  
  components: {
    icon: MaterialIcon,
  },
  
  props: {
    /**
     * Determina si hay resultados disponibles para mostrar
     */
    hasResults: {
      type: Boolean,
      default: false,
    },
    
    /**
     * Texto de placeholder para el campo de búsqueda
     */
    placeholder: {
      type: String,
      default: 'Buscar...',
    },
    
    /**
     * Consulta inicial (si es aplicable)
     */
    initialQuery: {
      type: String,
      default: '',
    },
    
    /**
     * Indica si se deben mostrar las búsquedas recientes
     */
    showRecentSearches: {
      type: Boolean,
      default: true,
    },
  },
  
  emits: [
    'search', 
    'clear', 
    'suggestion-highlighted', 
    'suggestion-selected'
  ],
  
  setup(props, { emit }) {
    const searchQuery = ref(props.initialQuery || '');
    const isFocused = ref(false);
    const suggestionsContainer = ref(null);
    const recentSearches = ref([]);
    const isMobile = ref(window.innerWidth <= 768);
    
    // Detectar cambios en el tamaño de la ventana
    const handleResize = () => {
      isMobile.value = window.innerWidth <= 768;
    };
    
    // Cargar búsquedas recientes del localStorage
    const loadRecentSearches = () => {
      try {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
          recentSearches.value = JSON.parse(saved);
        }
      } catch (error) {
        console.error('Error al cargar búsquedas recientes:', error);
      }
    };
    
    // Guardar búsquedas recientes en localStorage
    const saveRecentSearches = () => {
      try {
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches.value));
      } catch (error) {
        console.error('Error al guardar búsquedas recientes:', error);
      }
    };
    
    // Manejar enfoque en el input
    const handleFocus = () => {
      isFocused.value = true;
      loadRecentSearches(); // Recargar al enfocar por si hay cambios
    };
    
    // Manejar pérdida de enfoque
    const handleBlur = () => {
      // Retrasamos para permitir que los clics en sugerencias se procesen
      setTimeout(() => {
        isFocused.value = false;
      }, 200);
    };
    
    // Manejar input
    const handleInput = () => {
      emit('search', searchQuery.value);
    };
    
    // Limpiar búsqueda
    const clearSearch = () => {
      searchQuery.value = '';
      emit('clear');
      emit('search', '');
      
      // Enfocar nuevamente el input
      const searchInput = document.querySelector('.search-input');
      if (searchInput) {
        searchInput.focus();
      }
    };
    
    // Manejar teclas
    const handleKeydown = (event) => {
      if (event.key === 'Escape') {
        if (searchQuery.value) {
          clearSearch();
        } else {
          // Si no hay consulta, perder el enfoque
          event.target.blur();
        }
      }
    };
    
    // Aplicar una búsqueda reciente
    const applyRecentSearch = (search) => {
      searchQuery.value = search;
      emit('search', search);
    };
    
    // Eliminar una búsqueda reciente
    const removeRecentSearch = (index) => {
      recentSearches.value.splice(index, 1);
      saveRecentSearches();
    };
    
    // Cerrar sugerencias al hacer clic fuera
    const handleDocumentClick = (event) => {
      const searchBarElement = document.querySelector('.search-bar-container');
      if (searchBarElement && !searchBarElement.contains(event.target)) {
        isFocused.value = false;
      }
    };
    
    // Observar cambios en la consulta para historial
    watch(searchQuery, (newValue, oldValue) => {
      if (newValue && newValue !== oldValue && !recentSearches.value.includes(newValue)) {
        // Solo añadir al historial cuando se envía una búsqueda completa
        // Esta lógica se maneja en AppSidebar
      }
    });
    
    onMounted(() => {
      loadRecentSearches();
      document.addEventListener('click', handleDocumentClick);
      window.addEventListener('resize', handleResize);
    });
    
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleDocumentClick);
      window.removeEventListener('resize', handleResize);
    });
    
    return {
      searchQuery,
      isFocused,
      suggestionsContainer,
      recentSearches,
      handleFocus,
      handleBlur,
      handleInput,
      handleKeydown,
      clearSearch,
      applyRecentSearch,
      removeRecentSearch,
      isMobile,
    };
  },
};
</script>

<style scoped>
/* Estilos base */
.search-bar-container {
  position: relative;
  width: 100%;
}

.search-input-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  background-color: #ffffff;
  border-radius: 6px;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s ease;
  border: 1px solid #e0e0e0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #333333;
  font-size: 0.9rem;
  padding: 0;
  width: 100%;
  outline: none;
}

.search-input::placeholder {
  color: #999999;
}

.search-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.5rem;
  color: #666666;
}

.keyboard-shortcut {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.35rem;
  font-size: 0.75rem;
  font-family: monospace;
  border-radius: 3px;
  margin-left: 0.5rem;
  background-color: #f5f5f5;
  color: #666666;
  border: 1px solid #e0e0e0;
}

/* Dark Mode */
:root[data-theme="dark"] .search-input-wrapper {
  background-color: #141414;
  border: none;
}

:root[data-theme="dark"] .search-input {
  color: #e0e0e0;
}

:root[data-theme="dark"] .search-input::placeholder {
  color: #666666;
}

:root[data-theme="dark"] .search-icon {
  color: #666666;
}

:root[data-theme="dark"] .keyboard-shortcut {
  background-color: #1a1a1a;
  color: #e0e0e0;
  border-color: #333333;
}

/* Soporte para prefers-color-scheme */
@media (prefers-color-scheme: dark) {
  .search-input-wrapper {
    background-color: #141414;
    border: none;
  }

  .search-input {
    color: #e0e0e0;
  }

  .search-input::placeholder {
    color: #666666;
  }

  .search-icon {
    color: #666666;
  }

  .keyboard-shortcut {
    background-color: #1a1a1a;
    color: #e0e0e0;
    border-color: #333333;
  }
}

.clear-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  margin-left: 0.5rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.clear-button:hover {
  opacity: 1;
}

.suggestions-container {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  max-height: 400px;
  overflow-y: auto;
  background-color: var(--search-suggestions-bg, #ffffff);
  border-radius: 6px;
  border: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-top: 0;
}

.suggestions-section-title {
  padding: 8px 16px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--search-suggestions-muted, #666666);
  text-transform: uppercase;
  border-bottom: none;
}

.recent-search-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
}

.recent-search-item:hover {
  background-color: var(--search-suggestions-hover, #f5f5f5);
}

.recent-icon {
  margin-right: 12px;
  color: var(--search-suggestions-muted, #666666);
}

.recent-text {
  flex: 1;
  color: var(--suggestion-title-color, #333333);
}

.remove-recent {
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  padding: 0.25rem;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.2s ease;
}

.recent-search-item:hover .remove-recent {
  opacity: 0.8;
}

.remove-recent:hover {
  background-color: var(--search-suggestions-hover, #f5f5f5);
  color: var(--text-primary);
  opacity: 1;
}

/* Estilos para texto resaltado en sugerencias */
:deep(.highlight) {
  background-color: var(--highlight-bg);
  color: var(--highlight-text);
  border-radius: 0.25rem;
  padding: 0.1rem 0.2rem;
  margin: 0 -0.2rem;
}

.recent-searches-section {
  width: 100%;
  border-radius: 6px;
  overflow: hidden;
  background-color: var(--search-suggestions-bg);
  border: none;
  margin-top: 0;
}

.suggestions-container {
  overflow: hidden;
}
</style> 