/**
 * @component MenuItem
 * @description Componente que maneja cada elemento individual del menú.
 * Este es un componente recursivo que puede contener otros MenuItems como hijos.
 * 
 * Responsabilidades:
 * - Renderizar elementos individuales del menú
 * - Manejar la expansión/colapso de submenús
 * - Gestionar estados de hover y active
 * - Mostrar íconos y badges
 * - Manejar la navegación al hacer clic
 * 
 * Características:
 * - Recursividad: Puede contener otros MenuItems (submenús)
 * - Estados: normal, hover, active, expanded
 * - Soporte para íconos y badges
 * - Animaciones de hover y expansión
 * - Gestión de historial de visitas
 */

<template>
  <div class="menu-item-wrapper" :class="{ 'with-children': hasChildren }">
    <!-- Elemento principal -->
    <div 
      class="menu-item" 
      :class="{ 
        'expanded': isExpanded,
        'section-header': item.isSection
      }"
    >
      <a 
        v-if="!item.isSection" 
        :href="item.href || '#'" 
        class="nav-link" 
        :class="{ 'active': item.active }"
        @click.prevent="handleClick"
      >
        <span class="nav-icon" v-if="item.icon">
          <component :is="getIconComponent(item.icon)" size="20" />
        </span>
        <span class="nav-text">{{ item.text }}</span>
        <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        
        <!-- Flecha para expandir/colapsar -->
        <span v-if="hasChildren" class="expand-arrow" :class="{ 'expanded': isExpanded }">
          <ChevronDown size="20" />
        </span>
      </a>
      
      <!-- Título de sección -->
      <div v-else class="section-title">
        {{ item.text }}
      </div>
    </div>
    
    <!-- Subelementos (renderizado recursivo) -->
    <transition name="slide-children">
      <div v-if="hasChildren && isExpanded" class="children-wrapper">
        <menu-item 
          v-for="child in item.children" 
          :key="child.id" 
          :item="child"
          :depth="depth + 1"
          @item-click="handleChildClick"
        />
      </div>
    </transition>
  </div>
</template>

<script>
/**
 * Componente para renderizar ítems de menú, soportando estructura jerárquica
 * 
 * Características:
 * - Soporta elementos simples y elementos con hijos (expansibles)
 * - Gestiona el estado de expandido/colapsado
 * - Permite marcado como favorito
 * - Renderiza correctamente elementos de cabecera de sección
 * 
 * @component MenuItem
 */
import { computed, ref } from 'vue';
import { getIconComponent } from '../../constants/icons';
import { ChevronDown } from 'lucide-vue-next';

export default {
  name: 'MenuItem',
  
  components: {
    ChevronDown
  },
  
  props: {
    /**
     * Elemento a renderizar
     */
    item: {
      type: Object,
      required: true
    },
    
    /**
     * Nivel de profundidad para indentación
     */
    depth: {
      type: Number,
      default: 0
    }
  },
  
  emits: ['item-click'],
  
  setup(props, { emit }) {
    // Estado local de expansión
    const localExpanded = ref(props.item.expanded || false);
    
    // Verificar si el elemento tiene hijos
    const hasChildren = computed(() => {
      return props.item.children && props.item.children.length > 0;
    });
    
    // Estado de expansión del elemento
    const isExpanded = computed(() => {
      return localExpanded.value;
    });
    
    // Verificar si el elemento está en favoritos
    const isFavorite = computed(() => {
      try {
        const visitHistory = JSON.parse(localStorage.getItem('visitHistory') || '{}');
        const itemPath = props.item.parent ? `${props.item.parent} > ${props.item.text}` : props.item.text;
        const itemId = `${itemPath}-${props.item.href}`;
        return (visitHistory[itemId] || 0) >= 3;
      } catch (error) {
        console.error('Error al verificar favorito:', error);
        return false;
      }
    });

    // Función para cambiar el estado expandido/colapsado
    const toggleExpanded = () => {
      if (props.item.id) {
        try {
          // Actualizar estado local primero
          localExpanded.value = !localExpanded.value;
          
          // Emitir evento para actualizar el estado global
          window.dispatchEvent(
            new CustomEvent('menu-item-expanded', {
              detail: {
                id: props.item.id,
                expanded: localExpanded.value
              }
            })
          );
          
          // Guardar el estado en localStorage
          const expandedState = JSON.parse(localStorage.getItem('menuExpandedState') || '{}');
          expandedState[props.item.id] = localExpanded.value;
          localStorage.setItem('menuExpandedState', JSON.stringify(expandedState));
          
        } catch (error) {
          console.error('Error al emitir evento de expansión:', error);
        }
      }
    };
    
    // Cargar el estado guardado al montar el componente
    try {
      const expandedState = JSON.parse(localStorage.getItem('menuExpandedState') || '{}');
      if (props.item.id && expandedState[props.item.id] !== undefined) {
        localExpanded.value = expandedState[props.item.id];
      }
    } catch (error) {
      console.error('Error al cargar estado expandido:', error);
    }
    
    return {
      hasChildren,
      isExpanded,
      isFavorite,
      getIconComponent,
      toggleExpanded,
      handleClick: () => {
        if (hasChildren.value) {
          toggleExpanded();
        }
        emit('item-click', props.item);
      },
      handleChildClick: (item) => {
        if (!item.parent && props.item.text) {
          emit('item-click', { ...item, parent: props.item.text });
        } else {
          emit('item-click', item);
        }
      }
    };
  }
};
</script>

<style scoped>
/* ========================================
   ESTILOS BASE DEL ELEMENTO
   ======================================== */
.menu-item-wrapper {
  position: relative;
}

.menu-item {
  position: relative;
}

/* ========================================
   ESTILOS DEL ENLACE Y HOVER
   ======================================== */
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

/* Efectos hover - Estos son los estilos principales para la interactividad */
.nav-link:hover {
  background-color: var(--bg-hover);
  border-left-color: var(--primary);
  transform: translateX(4px);
  color: var(--primary);
}

/* ========================================
   ESTILOS DE ÍCONOS
   ======================================== */
.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  width: 20px;
  height: 20px;
  color: var(--text-secondary);
  opacity: 0.7;
  transition: all 0.2s ease;
}

/* Efectos hover para íconos */
.nav-link:hover .nav-icon {
  transform: scale(1.1);
  opacity: 1;
  color: var(--primary);
}

/* ========================================
   ESTILOS DE TEXTO Y BADGES
   ======================================== */
.nav-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-badge {
  background-color: var(--badge-bg);
  color: var(--badge-text);
  padding: 0.15rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

/* ========================================
   ESTILOS DE EXPANSIÓN/COLAPSO
   ======================================== */
.expand-arrow {
  margin-left: auto;
  transition: transform 0.2s ease;
}

.expand-arrow.expanded {
  transform: rotate(180deg);
}

/* ========================================
   MODO OSCURO
   ======================================== */
@media (prefers-color-scheme: dark) {
  .nav-link:hover {
    background-color: #3D3D3D !important;
    border-left: 3px solid var(--primary) !important;
    color: #E0E0E0 !important;
  }

  .nav-link:hover .nav-icon {
    color: var(--primary) !important;
    opacity: 1;
  }

  .nav-link:hover .nav-text {
    color: #E0E0E0 !important;
  }
}

/* Modo claro */
@media (prefers-color-scheme: light) {
  .item-parent,
  .parent-indicator {
    color: rgba(0, 0, 0, 0.6); /* Un gris más oscuro para modo claro */
  }
}

/* Modo oscuro */
@media (prefers-color-scheme: dark) {
  .item-parent,
  .parent-indicator {
    color: rgba(255, 255, 255, 0.7); /* Un gris más claro para modo oscuro */
  }

  .nav-link:hover {
    background-color: #3D3D3D !important;
    border-left: 3px solid var(--primary) !important;
    color: #E0E0E0 !important;
  }

  .nav-link:hover .nav-icon {
    color: var(--primary) !important;
    opacity: 1;
  }

  .nav-link:hover .nav-text {
    color: #E0E0E0 !important;
  }
}

/* Estilos para elementos con hijos */
.with-children > .menu-item > .nav-link {
  font-weight: 500;
}

/* Indentación de subelementos */
.children-wrapper {
  padding-left: 0.5rem;
  overflow: hidden;
}

/* Hijos de segundo nivel o más */
.children-wrapper .children-wrapper {
  border-left: 1px solid var(--border);
  margin-left: 0.75rem;
}

/* Animación para mostrar/ocultar hijos */
.slide-children-enter-active,
.slide-children-leave-active {
  transition: all 0.3s ease-out;
  max-height: 1000px;
  opacity: 1;
  overflow: hidden;
}

.slide-children-enter-from,
.slide-children-leave-to {
  max-height: 0;
  opacity: 0;
  overflow: hidden;
}

/* Estilos para cabeceras de sección */
.section-title {
  font-size: var(--section-title-size);
  font-weight: var(--section-title-weight);
  color: var(--section-title-color);
  text-transform: var(--section-title-transform);
  letter-spacing: var(--section-title-spacing);
  padding: var(--section-title-padding);
}

.section-header {
  margin-top: 0.5rem;
}
</style> 