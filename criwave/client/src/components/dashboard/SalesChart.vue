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
            
            <!-- Opción para comparar con año anterior -->
            <div class="chart-comparison" v-if="showComparison">
              <label class="comparison-toggle">
                <input type="checkbox" v-model="compareWithPreviousYear">
                <span class="toggle-label">Comparar con año anterior</span>
              </label>
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
          
          <!-- Línea para el año anterior (morada) -->
          <div v-if="compareWithPreviousYear && data.previousYearValues" class="chart-previous-year">
            <svg class="previous-year-line" :viewBox="`0 0 ${data.values.length * 100} 100`" preserveAspectRatio="none">
              <polyline 
                :points="generatePreviousYearPoints(data.previousYearValues, data.values)" 
                fill="none" 
                stroke="var(--previous-year-color, #9333ea)" 
                stroke-width="2" 
                stroke-dasharray="5,5"
              />
            </svg>
            <div class="previous-year-legend">
              <span class="legend-color" style="background-color: var(--previous-year-color, #9333ea);"></span>
              <span class="legend-label">Año anterior</span>
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
    },
    
    /**
     * Si se debe mostrar la opción de comparar con año anterior
     */
    showComparison: {
      type: Boolean,
      default: true
    }
  },
  
  data() {
    return {
      compareWithPreviousYear: true
    };
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
    },
    
    /**
     * Generar puntos para la línea del año anterior
     */
    generatePreviousYearPoints(previousValues, currentValues) {
      if (!previousValues || !previousValues.length || !currentValues || !currentValues.length) {
        return '';
      }
      
      const maxCurrentValue = Math.max(...currentValues);
      const points = [];
      
      for (let i = 0; i < previousValues.length; i++) {
        const x = i * 100 + 50; // Centrar en cada barra
        const y = 100 - ((previousValues[i] / maxCurrentValue) * 100); // Invertir el eje Y
        points.push(`${x},${y}`);
      }
      
      return points.join(' ');
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

.chart-comparison {
  display: flex;
  align-items: center;
}

.comparison-toggle {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.comparison-toggle input {
  margin-right: 8px;
}

.toggle-label {
  font-size: 0.85rem;
  color: var(--text-secondary);
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

/* Estilos para la línea del año anterior */
.chart-previous-year {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.previous-year-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 80px); /* Ajustar para no cubrir las etiquetas */
  margin-top: 20px; /* Espacio para el encabezado del gráfico */
}

.previous-year-legend {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: var(--text-secondary);
  padding: 4px 8px;
  background-color: var(--bg-secondary, #f5f5f5);
  border-radius: 4px;
}

.legend-color {
  display: inline-block;
  width: 12px;
  height: 2px;
  margin-right: 6px;
  background-color: var(--previous-year-color, #9333ea);
}

.legend-label {
  font-size: 0.7rem;
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