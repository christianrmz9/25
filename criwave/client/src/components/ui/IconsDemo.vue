<template>
  <div class="icons-demo">
    <h2 class="demo-title">Demostración de iconos Material Icons</h2>
    <p class="demo-description">Esta página muestra todos los iconos disponibles en la aplicación. Usa el buscador para filtrar por nombre.</p>
    
    <div class="demo-search">
      <input 
        type="text" 
        v-model="searchQuery" 
        placeholder="Buscar iconos..." 
        class="demo-search-input"
      />
      <icon name="search" />
    </div>
    
    <div class="demo-filters">
      <div class="filter-group">
        <span class="filter-label">Tamaño:</span>
        <div class="filter-options">
          <button 
            v-for="size in sizes" 
            :key="size" 
            class="filter-btn" 
            :class="{ active: selectedSize === size }"
            @click="selectedSize = size"
          >{{ size }}</button>
        </div>
      </div>
      
      <div class="filter-group">
        <span class="filter-label">Color:</span>
        <div class="filter-options">
          <button 
            v-for="color in colors" 
            :key="color" 
            class="filter-btn" 
            :class="{ active: selectedColor === color }"
            @click="selectedColor = color"
          >{{ color }}</button>
        </div>
      </div>
    </div>
    
    <div class="icons-grid">
      <div 
        v-for="(iconName, key) in filteredIcons" 
        :key="key" 
        class="icon-item"
        @click="copyIconCode(key, iconName)"
      >
        <div class="icon-preview">
          <icon :name="iconName" :size="selectedSize" :color="selectedColor" />
        </div>
        <div class="icon-name">{{ key }}</div>
        <div class="icon-value">{{ iconName }}</div>
      </div>
      
      <div v-if="Object.keys(filteredIcons).length === 0" class="no-results">
        No se encontraron iconos con ese nombre
      </div>
    </div>

    <!-- Notificación de copiado -->
    <div class="copy-notification" :class="{ show: showCopyNotification }">
      Código copiado al portapapeles
    </div>
  </div>
</template>

<script>
/**
 * Componente de demostración de iconos
 * 
 * Muestra todos los iconos disponibles en la aplicación
 * con opciones de filtrado y copiado de código
 * 
 * @component IconsDemo
 */
import MaterialIcon from './Icon.vue';
import icons from '../../constants/icons';

export default {
  name: 'IconsDemo',
  
  components: {
    icon: MaterialIcon
  },
  
  data() {
    return {
      searchQuery: '',
      selectedSize: 'md',
      selectedColor: '',
      sizes: ['xs', 'sm', 'md', 'lg', 'xl'],
      colors: ['', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'],
      showCopyNotification: false,
      
      // Importar todos los iconos desde el archivo de constantes
      icons
    };
  },
  
  computed: {
    /**
     * Filtra los iconos según la búsqueda
     */
    filteredIcons() {
      if (!this.searchQuery) return this.icons;
      
      const query = this.searchQuery.toLowerCase();
      const result = {};
      
      // Filtrar por nombre de constante o valor del icono
      Object.keys(this.icons).forEach(key => {
        const iconName = this.icons[key];
        if (key.toLowerCase().includes(query) || 
            iconName.toLowerCase().includes(query)) {
          result[key] = iconName;
        }
      });
      
      return result;
    }
  },
  
  methods: {
    /**
     * Copia el código del icono al portapapeles
     */
    copyIconCode(iconKey, iconName) {
      // Generar el código Vue para usar el icono
      const code = `<icon name="${iconName}" />`;
      
      // Copiar al portapapeles
      navigator.clipboard.writeText(code).then(() => {
        this.showCopyNotification = true;
        
        // Ocultar la notificación después de 2 segundos
        setTimeout(() => {
          this.showCopyNotification = false;
        }, 2000);
      });
    }
  }
};
</script>

<style scoped>
.icons-demo {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.demo-title {
  font-size: 1.8rem;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.demo-description {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

.demo-search {
  display: flex;
  align-items: center;
  background-color: var(--bg-secondary);
  padding: 8px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  position: relative;
}

.demo-search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1rem;
  color: var(--text-primary);
  padding: 8px 8px 8px 30px;
  outline: none;
}

.demo-search :deep(.material-icon) {
  position: absolute;
  left: 16px;
  color: var(--text-secondary);
}

.demo-filters {
  display: flex;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-label {
  font-weight: 500;
  margin-right: 10px;
  color: var(--text-secondary);
}

.filter-options {
  display: flex;
  gap: 5px;
}

.filter-btn {
  border: none;
  background-color: var(--bg-secondary);
  color: var(--text-secondary);
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn.active {
  background-color: var(--primary);
  color: white;
}

.icons-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px;
  border-radius: 8px;
  background-color: var(--bg-secondary);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.icon-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.icon-preview {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
}

.icon-name {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 5px;
}

.icon-value {
  font-size: 0.75rem;
  color: var(--text-secondary);
  text-align: center;
  word-break: break-all;
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 20px;
  color: var(--text-secondary);
  background-color: var(--bg-secondary);
  border-radius: 8px;
}

.copy-notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background-color: var(--success);
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transform: translateY(100px);
  opacity: 0;
  transition: transform 0.3s, opacity 0.3s;
}

.copy-notification.show {
  transform: translateY(0);
  opacity: 1;
}

@media (max-width: 576px) {
  .icons-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 10px;
  }
  
  .icon-item {
    padding: 10px;
  }
}
</style> 