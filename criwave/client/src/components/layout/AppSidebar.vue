/**
 * @component AppSidebar
 * @description Componente principal que maneja la barra lateral de navegación completa.
 * 
 * Responsabilidades:
 * - Estructura principal del sidebar
 * - Manejo de secciones principales (Frecuentes, Menú Principal, etc.)
 * - Estilos globales del sidebar
 * - Variables CSS globales para temas (claro/oscuro)
 * 
 * Estructura:
 * - Sección de Frecuentes: Muestra los elementos más visitados
 * - Menú Principal: Lista completa de opciones de navegación
 * - Secciones adicionales según se requiera
 */

<template>
  <div class="sidebar-overlay" v-if="isOpen && isMobile" @click="closeSidebar"></div>
  <aside class="app-sidebar" :class="{ 'is-open': isOpen }">
    <div class="sidebar-header">
      <div class="logo-container">
        <img :src="logoSrc" alt="Leadwave" class="sidebar-logo" />
      </div>
      <button class="close-button" @click="closeSidebar" aria-label="Cerrar menú">
        <X size="20" />
      </button>
    </div>
    
    <div class="search-box">
      <search-bar 
        @search="filterItems" 
        ref="searchBar" 
        placeholder="Buscar recursos..."
        :has-results="hasSearchResults"
      >
        <template #suggestions>
          <div v-if="searchQuery" class="search-suggestions">
            <div v-if="flattenedFilteredItems.length === 0" class="no-results">
              No se encontraron resultados para "<span class="highlight">{{ searchQuery }}</span>"
          </div>
          
            <div v-else>
            <div 
                v-for="(item, index) in flattenedFilteredItems" 
                :key="`suggestion-${item.id}-${index}`"
              class="suggestion-item"
                :class="{ selected: highlightedIndex === index && highlightedType === 'menu' }"
                @click="handleSuggestionClick(item)"
                @mouseenter="highlightSuggestion(index, 'menu')"
              >
                <div class="suggestion-content">
                  <div class="suggestion-title" v-html="highlightText(item.text)"></div>
                  <div v-if="item.parent" class="suggestion-parent">
                    {{ item.parent }}
            </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </search-bar>
    </div>
    
    <nav class="sidebar-nav">
      <!-- Sección de Frecuentes reimplementada -->
      <div v-if="favoriteItems.length > 0 && !searchQuery" class="nav-section-frequents">
        <div class="section-title">Frecuentes</div>
        <ul class="nav-list">
          <li class="nav-item" v-for="(item, index) in favoriteItems" :key="`favorite-${index}`">
            <a 
              :href="item.href" 
              class="nav-link"
              @click.prevent="handleItemClick(item)"
            >
              <span class="nav-icon">
                <Heart size="16" />
              </span>
              <span class="nav-text">
                {{ item.text }}
                <span v-if="item.parent" class="parent-indicator">{{ item.parent }}</span>
              </span>
            </a>
          </li>
        </ul>
      </div>
      
      <!-- Renderizado recursivo de elementos de menú -->
      <template v-if="!searchQuery">
        <menu-item 
          v-for="item in navigationItems" 
          :key="item.id" 
          :item="item"
          @item-click="handleItemClick"
        />
      </template>
      
      <!-- Resultados de búsqueda -->
      <template v-else>
        <div v-if="flattenedFilteredItems.length > 0" class="search-results-section">
          <div class="section-title">Resultados</div>
          <ul class="nav-list">
            <li class="nav-item" v-for="(item, index) in flattenedFilteredItems" :key="`search-${index}`">
              <a 
                :href="item.href" 
                class="nav-link"
                @click.prevent="handleItemClick(item)"
              >
                <span class="nav-text" v-html="highlightText(item.text)"></span>
                <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
                <span v-if="item.parent" class="item-parent">{{ item.parent }}</span>
              </a>
            </li>
          </ul>
        </div>
      </template>
      
      <!-- Mensaje cuando no hay resultados en ninguna categoría -->
      <div class="no-results-container" v-if="searchQuery && !hasSearchResults">
        <div class="no-results-text">
          No se encontraron resultados para "<strong>{{ searchQuery }}</strong>"
        </div>
        <div class="no-results-hint">
          Intenta con otros términos o revisa la ortografía
        </div>
      </div>
    </nav>
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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import SearchBar from '../ui/SearchBar.vue';
import MenuItem from './MenuItem.vue';
import { navigationConfig } from '../../config/navigation';
import { setupMenuListeners } from './MenuListeners';
import { Heart, X } from 'lucide-vue-next';

export default {
  name: 'AppSidebar',
  
  components: {
    SearchBar,
    MenuItem,
    Heart,
    X
  },
  
  props: {
    /**
     * Indica si el sidebar está abierto o cerrado
     */
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  
  emits: ['close'],
  
  setup(props, { emit }) {
    const store = useStore();
    const isMobile = ref(window.innerWidth <= 768);
    const searchQuery = ref('');
    
    // Referencia para almacenar la función de limpieza de los listeners
    const menuListenersCleanup = ref(null);
      
      // Información sobre la sugerencia resaltada actualmente
    const highlightedIndex = ref(-1);
    const highlightedType = ref(''); // 'menu', 'action'
      
      // Cache para resultados de búsqueda
    const searchCache = ref(new Map());

    // Favoritos dinámicos - guardar historial de visitas
    const favoriteItems = ref([]);
    
    // Los contadores de visitas no se muestran, ya que el orden indica la relevancia
    const showVisitCount = ref(false);
    
    // Config de navegación - cargar desde archivo de configuración
    const navigationItems = ref(navigationConfig);
    
    // Computed properties
    
    // Determina la imagen del logo según el tema actual
    const logoSrc = computed(() => {
      return store.getters['theme/isDark'] ? '/img/criwavelogo.png' : '/img/criwavelogoN.png';
    });
    
    // Aplanar la estructura jerárquica de elementos de navegación para la búsqueda
    const flattenedNavigationItems = computed(() => {
      const flattened = [];
      
      // Función recursiva para aplanar la estructura
      const flatten = (items, parentPath = null) => {
        items.forEach(item => {
          // Determinar la ruta completa de jerarquía
          const currentPath = parentPath ? `${parentPath} > ${item.text}` : item.text;
          
          // Crear una copia del elemento con información del padre si existe
          const flatItem = {
            ...item,
            parent: parentPath
          };
          
          // Añadir a la lista aplanada
          flattened.push(flatItem);
          
          // Procesar hijos si existen
          if (item.children && item.children.length > 0) {
            flatten(item.children, currentPath);
          }
        });
      };
      
      // Comenzar el proceso de aplanamiento
      flatten(navigationItems.value);
      
      return flattened;
    });
    
    // Funciones para filtrar elementos según la búsqueda
    const prepareSearchTerms = (query) => {
      return query.toLowerCase().trim().split(/\s+/);
    };
    
    const itemMatchesSearch = (item, queryTerms) => {
      const itemText = item.text.toLowerCase();
      // Verificar si todos los términos de búsqueda están en el texto del elemento
      return queryTerms.every(term => itemText.includes(term));
    };
    
    // Filtrar elementos de navegación aplanados para resultados de búsqueda
    const flattenedFilteredItems = computed(() => {
      if (!searchQuery.value) return [];
      
      const queryTerms = prepareSearchTerms(searchQuery.value);
      
      return flattenedNavigationItems.value.filter(item => 
        itemMatchesSearch(item, queryTerms)
      );
    });
    
    // Filtra las acciones rápidas según la búsqueda
    const filteredQuickActions = computed(() => {
      return []; // Ya no hay acciones rápidas
    });
    
    // Verifica si hay resultados en la búsqueda actual
    const hasSearchResults = computed(() => {
      // Si no hay consulta, siempre hay resultados
      if (!searchQuery.value) return true;
      
      // Verifica si hay algún elemento en los resultados filtrados
      return flattenedFilteredItems.value.length > 0;
    });
    
    // Métodos
    
    // Cierra el sidebar
    const closeSidebar = () => {
      emit('close');
    };
    
    // Comprueba si el dispositivo es móvil
    const checkMobile = () => {
      isMobile.value = window.innerWidth <= 768;
    };
    
    // Actualiza la consulta de búsqueda
    const filterItems = (query) => {
      // Si la consulta es la misma, no hacer nada
      if (searchQuery.value === query) return;
      
      searchQuery.value = query;
      highlightedIndex.value = -1;
      highlightedType.value = '';
      
      // Guarda la consulta en el almacenamiento local para persistencia
      if (query && query.length > 2) {
        saveRecentSearch(query);
      }
    };
    
    // Guarda una búsqueda reciente en el almacenamiento local
    const saveRecentSearch = (query) => {
      try {
        // Obtener búsquedas recientes almacenadas
        const recentSearches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        
        // Eliminar duplicados
        const filteredSearches = recentSearches.filter(search => search !== query);
        
        // Añadir la nueva búsqueda al principio
        filteredSearches.unshift(query);
        
        // Mantener sólo las 5 búsquedas más recientes
        const limitedSearches = filteredSearches.slice(0, 5);
        
        // Guardar en localStorage
        localStorage.setItem('recentSearches', JSON.stringify(limitedSearches));
      } catch (error) {
        console.error('Error al guardar búsqueda reciente:', error);
      }
    };
    
    // Resalta texto en los resultados de búsqueda
    const highlightText = (text) => {
      if (!searchQuery.value) return text;
      
      const escapedQuery = searchQuery.value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedQuery})`, 'gi');
      
      return text.replace(regex, '<span class="highlight">$1</span>');
    };
    
    // Maneja clic en elementos del menú
    const handleItemClick = (item) => {
      // Registrar visita para estadísticas de favoritos
      registerVisit(item);
      
      // Navegar a la página solo si tiene href y no tiene hijos, o si explícitamente tiene href
      if (item.href && (!item.children || item.children.length === 0)) {
        window.location.href = item.href;
      }
      
      // Cerrar el sidebar en dispositivos móviles
      if (isMobile.value) {
        closeSidebar();
      }
    };
    
    // Maneja clic en sugerencia
    const handleSuggestionClick = (item) => {
      handleItemClick(item);
    };
    
    // Función para registrar visitas y actualizar frecuentes
    const registerVisit = (item) => {
      try {
        // Intentar obtener el historial existente
        const visitHistory = JSON.parse(localStorage.getItem('visitHistory') || '{}');
        
        // Asegurarse de que el item tenga href
        if (!item.href) {
          return; // Salir si no hay href definido
        }
        
        // Crear un ID único para el elemento basado en su texto y href
        // Si hay un padre, incluirlo en el ID para distinguir elementos con el mismo nombre
        const itemPath = item.parent ? `${item.parent} > ${item.text}` : item.text;
        const itemId = `${itemPath}-${item.href}`;
        
        // Verificar si es la primera visita (para animación)
        const isFirstVisit = !visitHistory[itemId];
        const oldCount = visitHistory[itemId] || 0;
        
        // Incrementar contador o inicializarlo
        visitHistory[itemId] = oldCount + 1;
        
        // Imprimir para depuración (podemos quitar después)
        console.log(`Registrando visita para: ${itemPath}, contador: ${visitHistory[itemId]}`);
        
        // Guardar en localStorage
        localStorage.setItem('visitHistory', JSON.stringify(visitHistory));
        
        // Actualizar frecuentes basados en el historial
        updateFrequent();
        
        // Agregar efecto visual (parpadeo) al elemento si es el primero
        if (isFirstVisit) {
          setTimeout(() => {
            // Buscar el elemento relevante y agregar una clase de animación
            const allItems = document.querySelectorAll('.nav-link');
            allItems.forEach(el => {
              const textElement = el.querySelector('.nav-text');
              if (textElement && textElement.textContent.includes(item.text)) {
                el.classList.add('just-visited');
                setTimeout(() => {
                  el.classList.remove('just-visited');
                }, 1000);
              }
            });
          }, 100);
        }
      } catch (error) {
        console.error('Error al registrar visita:', error);
      }
    };
    
    // Maneja los atajos de teclado
    const handleKeyboardShortcuts = (event) => {
      // Ctrl/Cmd + K para enfocar el buscador
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchBar = document.querySelector('.search-input');
        if (searchBar) {
          searchBar.focus();
        }
      }
    };
    
    // Maneja la selección de sugerencias
    const handleSuggestionHighlight = (index) => {
      // Para log si es necesario
      console.log('Sugerencia resaltada:', index);
    };
    
    const handleSuggestionSelect = (suggestion) => {
      // Para log si es necesario
      console.log('Sugerencia seleccionada:', suggestion);
    };
    
    // Resalta una sugerencia
    const highlightSuggestion = (index, type) => {
      highlightedIndex.value = index;
      highlightedType.value = type;
    };
    
    // Implementar funciones para aplicar sugerencias
    const applyMainSuggestion = (item) => {
      handleItemClick(item);
    };
    
    const applySectionSuggestion = (item) => {
      handleItemClick(item);
    };
    
    const applyActionSuggestion = (action) => {
      if (action && action.action) {
        action.action();
      }
    };
    
    // Actualizar frecuentes basados en el historial de visitas
    const updateFrequent = () => {
      try {
        // Obtener historial de visitas
        const visitHistory = JSON.parse(localStorage.getItem('visitHistory') || '{}');
        
        // Si no hay historial, no mostrar frecuentes
        if (Object.keys(visitHistory).length === 0) {
          favoriteItems.value = [];
          return;
        }
        
        // Obtener todos los elementos aplanados para encontrar los más visitados
        const allItems = flattenedNavigationItems.value;
        
        // Imprimir información de depuración (podemos quitar después)
        console.log('Items aplanados:', allItems.length);
        
        // Filtrar elementos sin href
        const validItems = allItems.filter(item => item.href);
        
        // Crear array de elementos con su frecuencia de visitas
        const itemsWithFrequency = validItems.map(item => {
          // Crear una clave con el formato que usamos al guardar
          const itemPath = item.parent ? `${item.parent} > ${item.text}` : item.text;
          const itemId = `${itemPath}-${item.href}`;
          
          const frequency = visitHistory[itemId] || 0;
          
          // Imprimir elementos con frecuencia (podemos quitar después)
          if (frequency > 0) {
            console.log(`Item: ${itemPath}, frecuencia: ${frequency}`);
          }
          
          return {
            ...item,
            frequency
          };
        });
        
        // Ordenar por frecuencia de visitas (descendente)
        itemsWithFrequency.sort((a, b) => b.frequency - a.frequency);
        
        // Tomar los elementos más visitados (con al menos 1 visita)
        const mostVisitedItems = itemsWithFrequency
          .filter(item => item.frequency > 0)
          .slice(0, 3); // Mostrar los 3 más visitados (modificado de 5 a 3)
        
        console.log('Items más visitados:', mostVisitedItems.length);
        
        // Asignar a favoriteItems
        favoriteItems.value = mostVisitedItems;
        
      } catch (error) {
        console.error('Error al actualizar sección de frecuentes:', error);
      }
    };
    
    // Lifecycle hooks
    onMounted(() => {
      window.addEventListener('resize', checkMobile);
      document.addEventListener('keydown', handleKeyboardShortcuts);
      
      // Cargar el estado expandido de los menús
      loadExpandedState();
      
      // Cargar frecuentes basados en el historial
      updateFrequent();
      
      try {
        // Configurar los listeners para el menú
        if (navigationItems.value) {
          menuListenersCleanup.value = setupMenuListeners(navigationItems.value, (updatedItems) => {
            if (updatedItems) {
              navigationItems.value = updatedItems;
            }
          });
        }
      } catch (error) {
        console.error('Error al configurar listeners del menú:', error);
      }
      
      // Solo mantener el listener para actualización de frecuentes
      // Ya que puede ser usado en otros lugares
      window.addEventListener('frequent-updated', updateFrequent);
    });
    
    onBeforeUnmount(() => {
      window.removeEventListener('resize', checkMobile);
      document.removeEventListener('keydown', handleKeyboardShortcuts);
      
      // Eliminar el listener de frecuentes
      window.removeEventListener('frequent-updated', updateFrequent);
      
      // Llamar a la función de limpieza de los listeners
      if (menuListenersCleanup.value) {
        menuListenersCleanup.value();
      }
    });
    
    // Cargar estado de expansión del menú
    const loadExpandedState = () => {
      try {
        const expandedState = JSON.parse(localStorage.getItem('menuExpandedState') || '{}');
        
        // Función recursiva para aplicar el estado guardado
        const applyExpandedState = (items) => {
          items.forEach(item => {
            if (item.id && expandedState[item.id] !== undefined) {
              item.expanded = expandedState[item.id];
            }
            if (item.children && item.children.length > 0) {
              applyExpandedState(item.children);
            }
          });
        };
        
        applyExpandedState(navigationItems.value);
      } catch (error) {
        console.error('Error al cargar el estado expandido del menú:', error);
      }
    };
    
    return {
      isMobile,
      logoSrc,
      navigationItems,
      searchQuery,
      highlightedIndex,
      highlightedType,
      searchCache,
      favoriteItems,
      showVisitCount,
      flattenedFilteredItems,
      filteredQuickActions,
      hasSearchResults,
      closeSidebar,
      filterItems,
      highlightText,
      highlightSuggestion,
      handleItemClick,
      handleSuggestionClick,
      applyMainSuggestion,
      applySectionSuggestion,
      applyActionSuggestion,
      handleSuggestionHighlight,
      handleSuggestionSelect,
      updateFrequent,
      registerVisit
    };
  }
};
</script>

<style scoped>
/* ========================================
   ESTILOS GLOBALES DEL SIDEBAR
   ======================================== */

/* Variables CSS globales - Usadas en todo el sidebar */
:root {
  --sidebar-width: 280px;
  --sidebar-bg: #ffffff;
  --sidebar-bg-dark: #1a1a1a;
  --text-primary: #333333;
  --text-secondary: #666666;
  --primary: #0066cc;
  --bg-hover: rgba(0, 0, 0, 0.05);
}

/* Estilos base del sidebar */
.sidebar {
  width: var(--sidebar-width);
  background: var(--sidebar-bg);
  height: 100vh;
  overflow-y: auto;
}

/* ========================================
   SECCIÓN DE FRECUENTES
   ======================================== */
.nav-section-frequents {
  margin-bottom: 1rem;
}

/* Estilos específicos para elementos frecuentes */
.nav-section-frequents .nav-link {
  /* Estos estilos son específicos de la sección de frecuentes */
  padding: 0.45rem 1rem;
}

/* ========================================
   MODO OSCURO
   ======================================== */
@media (prefers-color-scheme: dark) {
  :root {
    /* Variables específicas para modo oscuro */
    --sidebar-bg: var(--sidebar-bg-dark);
    --text-primary: #ffffff;
    --text-secondary: #cccccc;
    --bg-hover: rgba(255, 255, 255, 0.1);
  }
}

/* Overlay que oscurece el fondo cuando el sidebar está abierto en móvil */
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: none;
}

@media (max-width: 768px) {
  .sidebar-overlay {
    display: block;
  }
}

/* Estilos del sidebar */
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background-color: var(--sidebar-bg);
  z-index: 1000;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  box-shadow: var(--sidebar-shadow);
}

.app-sidebar.is-open {
  transform: translateX(0);
}

/* En pantallas grandes, cuando está abierto */
@media (min-width: 769px) {
  .app-sidebar {
    transform: none;
    box-shadow: var(--sidebar-shadow);
  }
}

/* Cabecera del sidebar */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem;
  border-bottom: none;
  background-color: var(--bg-secondary);
  position: relative;
  width: 100%;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding-right: 36px;
  margin-left: 8px; /* Añadido para centrar mejor */
}

.sidebar-logo {
  height: 36px; /* Aumentado de 32px a 36px */
  width: auto;
  transition: transform 0.2s ease;
  display: block; /* Asegura mejor comportamiento del centrado */
  margin: 0 auto; /* Ayuda al centrado */
}

.sidebar-logo:hover {
  transform: scale(1.05);
}

/* Botón de cerrar */
.close-button {
  background: none;
  border: none;
  color: var(--text-primary);
  opacity: 0.7;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: absolute;
  right: 8px; /* Ajustado de 12px a 8px */
  top: 50%;
  transform: translateY(-50%);
}

.close-button:hover {
  opacity: 1;
  background-color: var(--bg-hover);
}

.close-button:active {
  transform: translateY(-50%) scale(0.95);
}

/* Estilos base para todos los enlaces del menú */
.nav-link {
  display: flex;
  align-items: center;
  padding: 0.55rem 1rem;
  color: var(--text-primary);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  border-left: 3px solid transparent;
}

/* Estilos hover unificados para TODOS los enlaces */
.nav-link:hover,
.nav-item .nav-link:hover,
.nav-section .nav-link:hover,
.nav-section-frequents .nav-link:hover {
  background-color: var(--bg-hover);
  border-left: 3px solid var(--primary);
  transform: translateX(4px);
  color: var(--primary);
}

/* Estilos hover para íconos en TODOS los enlaces */
.nav-link:hover .nav-icon,
.nav-item .nav-link:hover .nav-icon,
.nav-section .nav-link:hover .nav-icon {
  transform: scale(1.1);
  opacity: 1;
  color: var(--primary);
}

/* Estilos hover para texto en TODOS los enlaces */
.nav-link:hover .nav-text,
.nav-item .nav-link:hover .nav-text,
.nav-section .nav-link:hover .nav-text {
  color: var(--primary);
}

/* Estilos base para íconos */
.nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  opacity: 0.7;
  transition: all 0.2s ease;
}

/* Estilos para el texto del enlace */
.nav-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.2s ease;
}

/* Estilos específicos para la sección de frecuentes que no interfieren con los demás */
.nav-section-frequents .nav-link {
  padding: 0.45rem 1rem;
}

.nav-section-frequents .nav-text {
  display: flex;
  flex-direction: column;
}

.nav-section-frequents .parent-indicator {
  font-size: 0.7rem;
  margin-top: 2px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.nav-section-frequents .nav-link:hover .parent-indicator {
  opacity: 0.9;
}

/* Modo oscuro unificado */
@media (prefers-color-scheme: dark) {
  .nav-link:hover,
  .nav-item .nav-link:hover,
  .nav-section .nav-link:hover,
  .nav-section-frequents .nav-link:hover {
    background-color: #3D3D3D !important;
    border-left: 3px solid var(--primary) !important;
    color: #E0E0E0 !important;
  }

  .nav-link:hover .nav-icon,
  .nav-item .nav-link:hover .nav-icon,
  .nav-section .nav-link:hover .nav-icon,
  .nav-section-frequents .nav-link:hover .nav-icon {
    color: var(--primary) !important;
    opacity: 1;
  }

  .nav-link:hover .nav-text,
  .nav-item .nav-link:hover .nav-text,
  .nav-section .nav-link:hover .nav-text,
  .nav-section-frequents .nav-link:hover .nav-text {
    color: #E0E0E0 !important;
  }
}

/* Animación de hover para TODOS los elementos */
@keyframes menuHover {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(4px);
  }
}

.nav-link {
  animation-duration: 0.2s;
  animation-fill-mode: forwards;
}

.nav-link:hover {
  animation-name: menuHover;
}

/* Navegación */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
  scrollbar-width: thin;
  scrollbar-color: var(--border) var(--bg-primary);
  background-color: var(--sidebar-bg);
}

/* Personalización de la barra de desplazamiento para WebKit (Chrome, Safari, etc.) */
.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: var(--scrollbar-track);
  border-radius: 3px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background-color: var(--scrollbar-thumb);
  border-radius: 3px;
  opacity: 0.7;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background-color: var(--scrollbar-thumb-hover);
  opacity: 1;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-section {
  margin-top: 0.75rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--border);
}

.section-title {
  padding: 0.45rem 1rem 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted, #6c757d);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
  opacity: 0.85;
}

.nav-item {
  margin-bottom: 0;
}

.nav-link.active {
  background-color: var(--bg-active);
  color: var(--text-primary);
  font-weight: 500;
}

/* Estilos para acciones rápidas */
.quick-actions-section {
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}

.quick-action-item {
  cursor: pointer;
}

.action-shortcut {
  margin-left: auto;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 2px 5px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-family: monospace;
  border: 1px solid var(--border);
}

/* Estilos para mensajes de no resultados */
.no-results-container {
  padding: 2rem 1rem;
  text-align: center;
  color: var(--text-secondary);
  animation: fadeIn 0.3s ease;
}

.no-results-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
  opacity: 0.7;
}

.no-results-text {
  font-size: 0.95rem;
  margin-bottom: 0.5rem;
}

.no-results-hint {
  font-size: 0.85rem;
  opacity: 0.7;
}

@media (min-width: 769px) {
  /* En pantallas grandes, transformar el contenido principal */
  .app-sidebar {
    left: 0;
    transform: translateX(-100%);
  }
  
  .app-sidebar.is-open {
    transform: translateX(0);
  }
}

/* Estilo para texto resaltado */
:deep(.highlight) {
  background-color: rgba(var(--primary-rgb), 0.2);
  border-radius: 3px;
  padding: 0 2px;
  font-weight: 500;
  color: var(--primary);
}

/* Estilos específicos para las sugerencias */
:deep(.suggestion-section) {
  display: block;
  font-size: 0.7rem;
  color: var(--text-secondary);
  opacity: 0.7;
  margin-bottom: 2px;
}

:deep(.suggestion-item) {
  border-left: 2px solid transparent;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

:deep(.suggestion-item.selected),
:deep(.suggestion-item:hover) {
  border-left-color: var(--primary);
  background-color: var(--bg-hover);
}

/* Estilos específicos para las búsquedas recientes */
:deep(.search-suggestions),
:deep(.recent-searches-section) {
  background-color: var(--search-suggestions-bg);
  border: 1px solid var(--search-suggestions-border);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

:deep(.suggestions-container) {
  background-color: var(--search-suggestions-bg);
  overflow: hidden;
}

:deep(.suggestion-item),
:deep(.recent-search-item) {
  background-color: var(--search-suggestions-bg);
  border-left: 2px solid transparent;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

:deep(.suggestion-item.selected),
:deep(.suggestion-item:hover),
:deep(.recent-search-item:hover) {
  background-color: var(--search-suggestions-hover);
  border-left-color: var(--primary);
  color: var(--search-suggestions-text);
}

:deep(.suggestion-item .suggestion-icon),
:deep(.recent-icon) {
  color: var(--search-suggestions-muted);
}

:deep(.suggestion-section),
:deep(.suggestions-section-title) {
  color: var(--search-suggestions-muted);
  background-color: var(--search-suggestions-bg);
}

:deep(.recent-text) {
  color: var(--search-suggestions-text);
}

/* Estilos para el indicador de padre */
.item-parent-indicator {
  background-color: transparent;
  color: var(--text-muted, #6c757d);
  font-size: 0.7rem;
  display: block;
  font-style: normal;
  padding: 0;
  margin-top: 1px;
  max-width: 90%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.7;
}

/* Sección de frecuentes */
.nav-section-frequents {
  margin-bottom: 1rem;
}

.nav-section-frequents .nav-link {
  padding: 0.45rem 1rem;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}

.nav-section-frequents .nav-text {
  display: flex;
  flex-direction: column;
}

.nav-section-frequents .nav-icon {
  width: 20px;
  height: 20px;
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  opacity: 0.7;
  transition: all 0.2s ease;
}

.nav-section-frequents .nav-link:hover {
  background-color: var(--bg-hover);
  border-left-color: var(--primary);
  transform: translateX(4px);
}

.nav-section-frequents .nav-link:hover .nav-icon {
  transform: scale(1.1);
  opacity: 1;
  color: var(--primary);
}

.nav-section-frequents .nav-link:hover .nav-text {
  color: var(--primary);
}

.nav-section-frequents .parent-indicator {
  font-size: 0.7rem;
  margin-top: 2px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.nav-section-frequents .nav-link:hover .parent-indicator {
  opacity: 0.9;
}

/* Animaciones para elementos del menú */
@keyframes menuHover {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(4px);
  }
}

.nav-link {
  animation-duration: 0.2s;
  animation-fill-mode: forwards;
}

.nav-link:hover {
  animation-name: menuHover;
}

/* Modo claro */
:root {
  --parent-indicator-light: rgba(0, 0, 0, 0.5);
  --parent-indicator-dark: rgba(255, 255, 255, 0.7);
}

.app-sidebar .nav-section-frequents .parent-indicator {
  color: var(--parent-indicator-light);
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .app-sidebar .nav-section-frequents .parent-indicator {
    color: var(--parent-indicator-dark);
  }
}

/* Estilos para los resultados de búsqueda */
.search-results-section {
  margin-top: 0.5rem;
}

.search-results-section .nav-link {
  padding: 0.55rem 1rem;
}

/* Animación de primer clic */
.just-visited {
  animation: pulse 1s ease;
}

@keyframes pulse {
  0% {
    background-color: var(--bg-primary);
  }
  50% {
    background-color: var(--bg-hover);
  }
  100% {
    background-color: var(--bg-primary);
  }
}

/* Unificar estilos del modo oscuro */
@media (prefers-color-scheme: dark) {
  .app-sidebar {
    background-color: #000000;
    box-shadow: none;
  }
  
  .sidebar-header {
    background-color: #000000;
    border-bottom: none;
  }
  
  /* Estilos específicos para las búsquedas recientes */
  :deep(.search-suggestions),
  :deep(.recent-searches-section) {
    background-color: var(--search-suggestions-bg);
    border: 1px solid var(--search-suggestions-border);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  }
  
  :deep(.suggestions-container) {
    background-color: var(--search-suggestions-bg);
    overflow: hidden;
  }

  :deep(.suggestion-item),
  :deep(.recent-search-item) {
    background-color: var(--search-suggestions-bg);
  border-left: 2px solid transparent;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}

:deep(.suggestion-item.selected),
  :deep(.suggestion-item:hover),
  :deep(.recent-search-item:hover) {
    background-color: var(--search-suggestions-hover);
  border-left-color: var(--primary);
    color: var(--search-suggestions-text);
  }

  :deep(.suggestion-item .suggestion-icon),
  :deep(.recent-icon) {
    color: var(--search-suggestions-muted);
  }

  :deep(.suggestion-section),
  :deep(.suggestions-section-title) {
    color: var(--search-suggestions-muted);
    background-color: var(--search-suggestions-bg);
  }
  
  :deep(.recent-text) {
    color: var(--search-suggestions-text);
  }
  
  /* Resto de los estilos para el sidebar... */
  .nav-link:hover,
  .nav-item .nav-link:hover,
  .nav-section .nav-link:hover {
    background-color: #3D3D3D !important;
    border-left: 3px solid #555555;
    padding-left: calc(1rem - 3px);
    color: #E0E0E0 !important;
  }
  
  .search-box {
    margin: 0.5rem 0.75rem;
  }
  
  .search-box .search-input-wrapper {
    background-color: var(--search-bar-bg);
    border-color: var(--search-bar-border);
    box-shadow: none;
    border-radius: 4px;
  }
  
  .search-box .search-input-wrapper.has-focus {
    background-color: var(--search-bar-bg-focus);
    border-color: var(--primary);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }

  .search-box .search-input {
    color: var(--search-suggestions-text);
    background-color: transparent;
  }

  .search-box .search-icon {
    color: var(--search-icon-color);
  }
  
  .search-box .search-input::placeholder {
    color: var(--search-icon-color);
  }
  
  .quick-action-item:hover .nav-link,
  .quick-action-item .nav-link:hover {
    background-color: var(--nav-link-hover-bg) !important;
    border-left: var(--nav-border-indicator-width) solid var(--nav-border-indicator-color);
    padding-left: calc(var(--nav-link-padding-x) - var(--nav-border-indicator-width));
    color: var(--nav-link-hover-text-color) !important;
  }
  
  .item-parent-indicator,
  .item-parent,
  .section-title {
    color: var(--section-title-color);
  }
  
  .suggestion-item:hover,
  .suggestion-item.selected {
    background-color: var(--nav-link-hover-bg) !important;
    border-left-color: var(--nav-border-indicator-color);
    color: var(--nav-link-hover-text-color) !important;
  }

  .nav-link.active,
  .nav-item .nav-link.active {
    background-color: var(--nav-link-active-bg) !important;
    border-left: var(--nav-border-indicator-width) solid var(--nav-border-indicator-active-color);
    padding-left: calc(var(--nav-link-padding-x) - var(--nav-border-indicator-width));
    color: var(--nav-link-active-color) !important;
  }
  
  .nav-link.selected,
  .nav-item .nav-link.selected {
    background-color: var(--nav-link-active-bg) !important;
    border-left: var(--nav-border-indicator-width) solid var(--nav-border-indicator-active-color);
    padding-left: calc(var(--nav-link-padding-x) - var(--nav-border-indicator-width));
    color: var(--nav-link-active-color) !important;
  }
  
  .nav-section .nav-link:hover,
  .nav-section .nav-link:hover .nav-text,
  .nav-section .nav-link:hover .nav-icon {
    background-color: var(--nav-link-hover-bg) !important;
    color: var(--nav-link-hover-text-color) !important;
  }
  
  /* Asegurar que todos los textos sean visibles al hacer hover */
  .nav-link:hover .nav-text,
  .nav-link:hover .item-parent-indicator,
  .quick-action-item:hover .nav-text {
    color: var(--nav-link-hover-text-color) !important;
  }
  
  /* Reducimos los selectores específicos y utilizamos variables globales */
  .app-sidebar a:hover,
  .app-sidebar .nav-link:hover,
  .app-sidebar *[class*="link"]:hover,
  .app-sidebar *[class*="item"]:hover {
    background-color: var(--nav-link-hover-bg) !important;
    color: var(--nav-link-hover-text-color) !important;
    border-color: var(--nav-border-indicator-color) !important;
  }
  
  /* Estilos específicos para la sección de Frecuentes reimplementada */
  .nav-section-frequents .nav-link:hover {
    background-color: var(--nav-link-hover-bg) !important;
    border-left: var(--nav-border-indicator-width) solid var(--nav-border-indicator-color);
    padding-left: calc(var(--nav-link-padding-x) - var(--nav-border-indicator-width));
    color: var(--nav-link-hover-text-color) !important;
  }
  
  .nav-section-frequents .parent-indicator {
    color: var(--section-title-color);
  }
  
  .nav-section-frequents .nav-link:hover .nav-text,
  .nav-section-frequents .nav-link:hover .parent-indicator {
    color: var(--nav-link-hover-text-color) !important;
  }
}

/* Estilos para el buscador en el sidebar */
.search-box {
  margin: 0.5rem 0.75rem;
}

/* Resto de estilos del sidebar */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding-bottom: 1rem;
  background-color: var(--sidebar-bg);
}

/* Estilos para el tema oscuro */
@media (prefers-color-scheme: dark) {
  .app-sidebar {
    background-color: #000000;
    box-shadow: none;
  }
  
  .sidebar-header {
    background-color: #000000;
    border-bottom: none;
  }

  /* Resto de estilos del sidebar en dark mode */
}

/* Estilos para el ícono de favoritos */
.nav-section-frequents .nav-icon {
  font-size: 0.9em;
  opacity: 0.85;
}

.nav-section-frequents .nav-link:hover .nav-icon {
  opacity: 1;
}

/* Ajuste del color del texto para el menú lateral en modo oscuro */
:root[data-theme='dark'] .nav-text {
  color: rgba(255, 255, 255, 0.6); /* Gris más oscuro para todos los textos */
}

:root[data-theme='dark'] .nav-link:hover .nav-text {
  color: rgba(255, 255, 255, 0.9); /* Más claro al hacer hover */
}

:root[data-theme='dark'] .nav-link.active .nav-text {
  color: rgba(255, 255, 255, 1); /* Blanco completo cuando está activo */
}

/* Mantener el color original para el modo claro */
:root:not([data-theme='dark']) .nav-text {
  color: rgba(0, 0, 0, 0.8);
}

:root:not([data-theme='dark']) .nav-link:hover .nav-text {
  color: rgba(0, 0, 0, 0.95);
}

:root:not([data-theme='dark']) .nav-link.active .nav-text {
  color: rgba(0, 0, 0, 1);
}

/* Ajuste para los títulos de sección */
:root[data-theme='dark'] .section-title {
  color: rgba(255, 255, 255, 0.4); /* Gris más oscuro para los títulos */
}

/* Modo oscuro - Ajuste global para todos los elementos del menú */
:root[data-theme='dark'] {
  /* Color base para todos los elementos del menú */
  .nav-link,
  .nav-text,
  .nav-item a,
  .nav-section a,
  .nav-section-frequents a {
    color: rgba(255, 255, 255, 0.6) !important;
  }

  /* Hover para todos los elementos */
  .nav-link:hover,
  .nav-text:hover,
  .nav-item a:hover,
  .nav-section a:hover,
  .nav-section-frequents a:hover {
    color: rgba(255, 255, 255, 0.9) !important;
  }

  /* Elementos activos */
  .nav-link.active,
  .nav-text.active,
  .nav-item a.active,
  .nav-section a.active,
  .nav-section-frequents a.active {
    color: rgba(255, 255, 255, 1) !important;
  }

  /* Títulos de sección */
  .section-title {
    color: rgba(255, 255, 255, 0.4) !important;
  }

  /* Íconos */
  .nav-icon {
    color: rgba(255, 255, 255, 0.6) !important;
  }

  /* Indicadores de padre/subtítulos */
  .parent-indicator,
  .item-parent {
    color: rgba(255, 255, 255, 0.4) !important;
  }
}

/* Modo claro - mantener los colores originales */
:root:not([data-theme='dark']) {
  .nav-link,
  .nav-text,
  .nav-item a,
  .nav-section a {
    color: rgba(0, 0, 0, 0.8);
  }

  .nav-link:hover,
  .nav-text:hover,
  .nav-item a:hover,
  .nav-section a:hover {
    color: rgba(0, 0, 0, 0.95);
  }

  .nav-link.active,
  .nav-text.active,
  .nav-item a.active,
  .nav-section a.active {
    color: rgba(0, 0, 0, 1);
  }
}
</style> 