<template>
  <chart-card
    :title="title"
    :data-type="dataType"
    :load-on-visible="loadOnVisible"
    :auto-refresh="autoRefresh"
    :refresh-interval="refreshInterval"
  >
    <template v-slot:default="{ data }">
      <div class="sales-chart-container">
        <!-- Para simplicidad, solo mostramos los datos en texto -->
        <!-- En un caso real, aquí usarías un componente de gráfico como Chart.js, Echarts, etc. -->
        <div v-if="data && data.labels && data.values" class="chart-data">
          <div class="chart-summary">
            <div class="chart-total">
              {{ formatCurrency(getTotalSales(data.values)) }}
              <span class="chart-label">Total</span>
            </div>
            <div class="chart-average">
              {{ formatCurrency(getAverageSales(data.values)) }}
              <span class="chart-label">Promedio</span>
            </div>
          </div>
          
          <div class="chart-bars">
            <div 
              v-for="(value, index) in data.values" 
              :key="index"
              class="chart-bar-item"
            >
              <div 
                class="chart-bar" 
                :style="{ height: calculateBarHeight(value, data.values) }"
              ></div>
              <div class="chart-bar-label">{{ data.labels[index] }}</div>
              <div class="chart-bar-value">{{ formatCurrency(value) }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </chart-card>
</template>

<script>
import ChartCard from './ChartCard.vue';

export default {
  name: 'SalesChart',
  
  components: {
    ChartCard
  },
  
  props: {
    /**
     * Título del gráfico
     */
    title: {
      type: String,
      default: 'Ventas'
    },
    
    /**
     * Tipo de datos (ventasDiarias, ventasSemanales, ventasMensuales)
     */
    dataType: {
      type: String,
      default: 'ventasDiarias',
      validator: value => ['ventasDiarias', 'ventasSemanales', 'ventasMensuales'].includes(value)
    },
    
    /**
     * Si se debe cargar solo cuando sea visible
     */
    loadOnVisible: {
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
     * Intervalo de actualización en ms
     */
    refreshInterval: {
      type: Number,
      default: 60000 // 1 minuto
    }
  },
  
  methods: {
    /**
     * Formatear valor como moneda
     */
    formatCurrency(value) {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    },
    
    /**
     * Calcular altura de la barra en porcentaje
     */
    calculateBarHeight(value, allValues) {
      if (!allValues || !allValues.length) return '0%';
      
      const maxValue = Math.max(...allValues);
      if (maxValue === 0) return '0%';
      
      const percentage = (value / maxValue) * 100;
      return `${percentage}%`;
    },
    
    /**
     * Obtener suma total de ventas
     */
    getTotalSales(values) {
      if (!values || !values.length) return 0;
      return values.reduce((sum, value) => sum + value, 0);
    },
    
    /**
     * Obtener promedio de ventas
     */
    getAverageSales(values) {
      if (!values || !values.length) return 0;
      return this.getTotalSales(values) / values.length;
    }
  }
};
</script>

<style scoped>
.sales-chart-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.chart-data {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0 20px;
  border-bottom: 1px solid var(--border, #eee);
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.chart-total, .chart-average {
  display: flex;
  flex-direction: column;
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
}

.chart-label {
  font-size: 0.8rem;
  font-weight: 400;
  color: var(--text-secondary);
  margin-top: 2px;
}

.chart-bars {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  height: 200px;
  margin-top: auto;
  position: relative;
}

.chart-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  position: relative;
  z-index: 2;
}

.chart-bar {
  width: 36px;
  min-height: 4px;
  background-color: var(--primary, #4f46e5);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.chart-bar-label {
  margin-top: 8px;
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.chart-bar-value {
  margin-top: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .chart-bar {
    width: 24px;
  }
  
  .chart-bar-value {
    font-size: 0.65rem;
  }
  
  .chart-summary {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .chart-total, .chart-average {
    margin-bottom: 8px;
  }
}
</style> 