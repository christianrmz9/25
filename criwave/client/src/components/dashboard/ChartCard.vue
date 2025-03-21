<template>
  <div 
    class="chart-card" 
    :class="{ 'is-loading': isLoading }"
    ref="chartRef"
  >
    <div class="chart-header">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="chart-actions">
        <button 
          v-if="allowRefresh" 
          class="refresh-btn" 
          @click="refresh"
          :disabled="isLoading"
          title="Actualizar datos"
        >
          <i class="material-icons">refresh</i>
        </button>
      </div>
    </div>
    
    <!-- Mostrar skeleton mientras carga -->
    <chart-skeleton 
      v-if="isLoading" 
      :size="skeletonSize"
    />
    
    <!-- Mostrar contenido del gráfico cuando está cargado -->
    <div v-else class="chart-content">
      <!-- Aquí iría el componente de gráfico específico -->
      <slot :data="chartData"></slot>
      
      <!-- Mensaje cuando no hay datos -->
      <div v-if="!chartData || !chartData.length" class="no-data-message">
        No hay datos disponibles
      </div>
    </div>
  </div>
</template>

<script>
import { useChartData } from '../../composables/useChartData';
import ChartSkeleton from '../ui/ChartSkeleton.vue';

export default {
  name: 'ChartCard',
  
  components: {
    ChartSkeleton
  },
  
  props: {
    /**
     * Título del gráfico
     */
    title: {
      type: String,
      required: true
    },
    
    /**
     * Tipo de datos que mostrará el gráfico
     * (ej: 'ventasDiarias', 'ventasSemanales', etc.)
     */
    dataType: {
      type: String,
      required: true
    },
    
    /**
     * Si se debe cargar solo cuando sea visible
     */
    loadOnVisible: {
      type: Boolean,
      default: true
    },
    
    /**
     * Si se debe permitir la actualización manual
     */
    allowRefresh: {
      type: Boolean,
      default: true
    },
    
    /**
     * Si se debe actualizar automáticamente
     */
    autoRefresh: {
      type: Boolean,
      default: false
    },
    
    /**
     * Intervalo de actualización automática en ms
     */
    refreshInterval: {
      type: Number,
      default: 60000 // 1 minuto
    },
    
    /**
     * Tamaño del skeleton
     */
    skeletonSize: {
      type: String,
      default: 'medium'
    }
  },
  
  setup(props) {
    // Usar el composable para gestionar los datos del gráfico
    const { 
      chartData, 
      isLoading, 
      error,
      setupObserver,
      refresh 
    } = useChartData(props.dataType, {
      loadOnVisible: props.loadOnVisible,
      autoRefresh: props.autoRefresh,
      refreshInterval: props.refreshInterval
    });
    
    return {
      chartData,
      isLoading,
      error,
      setupObserver,
      refresh
    };
  },
  
  mounted() {
    // Configurar el observador para cargar cuando sea visible
    if (this.loadOnVisible) {
      this.setupObserver(this.$refs.chartRef);
    }
  }
};
</script>

<style scoped>
.chart-card {
  background-color: var(--bg-primary, #ffffff);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 16px;
  overflow: hidden;
  height: 100%;
  transition: box-shadow 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.refresh-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.refresh-btn:hover {
  background-color: var(--bg-hover);
  color: var(--primary);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chart-content {
  height: calc(100% - 50px);
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-style: italic;
  text-align: center;
}

.is-loading {
  pointer-events: none;
}
</style> 