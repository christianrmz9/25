<template>
  <div class="revenue-chart-container">
    <div class="chart-header">
      <div class="chart-title-section">
        <h2 class="chart-title">Total Ingresos</h2>
        <div class="revenue-amount">${{ formattedTotalRevenue }}</div>
        <div class="change-indicator" :class="{ 'positive': totalChange > 0, 'negative': totalChange < 0 }">
          <span class="change-value">{{ totalChange > 0 ? '+' : '' }}{{ formattedTotalChange }} ({{ formattedChangePercent }}%)</span>
          <span class="period">· {{ showComparison ? 'vs. año anterior' : 'últimos 12 meses' }}</span>
        </div>
      </div>
      
      <div class="period-selector">
        <div class="controls">
          <label class="comparison-toggle">
            <input type="checkbox" v-model="showComparison">
            <span class="toggle-label">Comparar con año anterior</span>
          </label>
          <button class="period-button active">
            Últimos 12 meses
            <icon name="arrow_drop_down" />
          </button>
        </div>
      </div>
    </div>
    
    <div class="chart-content">
      <div class="chart-axes">
        <div class="y-axis">
          <div class="axis-label" v-for="(value, index) in yAxisLabels" :key="index">
            {{ value }}
          </div>
        </div>
      </div>
      
      <div class="chart-graphic" ref="chartContainer" 
           @mousemove="handleMouseMove"
           @mouseleave="resetHighlight" 
           @touchmove="handleTouchMove"
           @touchend="resetHighlight">
        <!-- La gráfica SVG se generará aquí -->
        <svg class="chart-svg" ref="chartSvg" width="100%" height="100%">
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" :stop-color="chartGradientTop" stop-opacity="0.6" />
              <stop offset="100%" :stop-color="chartGradientBottom" stop-opacity="0.05" />
            </linearGradient>
          </defs>
          <path :d="areaPath" fill="url(#areaGradient)" />
          <path :d="linePath" fill="none" :stroke="chartLineColor" stroke-width="2" />
          
          <!-- Línea de comparación del año anterior (solo visible si showComparison es true) -->
          <path v-if="showComparison" 
                :d="comparisonLinePath" 
                fill="none" 
                :stroke="comparisonLineColor" 
                stroke-width="2" 
                stroke-dasharray="4,2" />
          
          <!-- Línea vertical para el punto actual -->
          <line v-if="currentPoint && mouseOver" 
                :x1="currentPoint.x" 
                :y1="chartHeight" 
                :x2="currentPoint.x" 
                :y2="currentPoint.y" 
                :stroke="chartLineColor" 
                stroke-width="1" 
                stroke-dasharray="2,2" />
          
          <!-- Círculo indicador (solo aparece cuando el mouse está sobre el gráfico) -->
          <circle 
            v-if="currentPoint && mouseOver"
            :cx="currentPoint.x" 
            :cy="currentPoint.y" 
            :r="isMobile ? 5 : 6" 
            :fill="chartLineColor" 
            stroke="#1a1a1a" 
            stroke-width="2"
            class="hover-point"
          />
          
          <!-- Área interactiva transparente para detectar movimiento del mouse -->
          <rect 
            class="interaction-overlay" 
            :width="chartWidth - 10" 
            :height="chartHeight" 
            fill="transparent" 
            style="pointer-events: all;"
          />
        </svg>
        
        <!-- Eje X con los meses -->
        <div class="x-axis">
          <div 
            class="x-label" 
            v-for="(month, index) in monthLabels" 
            :key="index" 
            :class="{ 
              'active': currentMonthIndex === index && mouseOver,
              [`month-${index}`]: true
            }"
          >
            {{ month }}
          </div>
        </div>
        
        <!-- Tooltip que sigue al mouse -->
        <div 
          v-if="currentPoint && mouseOver" 
          class="tooltip" 
          :style="tooltipStyle"
        >
          <div class="tooltip-title">{{ currentPoint.month }}, {{ currentPoint.year }}</div>
          <div class="tooltip-value">${{ formatCurrency(currentPoint.value) }}</div>
          <div class="tooltip-accumulated">Acumulado: ${{ formatCurrency(currentPointAccumulated) }}</div>
          
          <!-- Comparación con el año anterior (solo si showComparison es true) -->
          <div v-if="showComparison && historicalDataPoints.length > 0" class="tooltip-comparison">
            <div class="comparison-label">{{ currentPoint.year - 1 }}:</div>
            <div class="comparison-value">
              ${{ formatCurrency(getHistoricalValueAtCurrentIndex()) }}
            </div>
            <div class="comparison-difference" :class="{ 'positive': currentPointYearOverYearChange?.amount > 0, 'negative': currentPointYearOverYearChange?.amount < 0 }">
              {{ currentPointYearOverYearChange?.amount > 0 ? '+' : '' }}{{ formatCurrency(currentPointYearOverYearChange?.amount) }} 
              ({{ formatPercent(currentPointYearOverYearChange?.percent) }})
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MaterialIcon from '../ui/Icon.vue';

export default {
  name: 'RevenueChart',
  
  components: {
    icon: MaterialIcon
  },
  
  props: {
    /**
     * Datos de ingresos de los últimos 12 meses
     * Debe ser un array de objetos con las propiedades "month", "year" y "revenue"
     */
    revenueData: {
      type: Array,
      required: true,
      default: () => []
    },
    
    /**
     * Datos de ingresos históricos para comparación (año anterior)
     * Debe seguir la misma estructura que revenueData
     */
    historicalData: {
      type: Array,
      default: () => []
    },
    
    /**
     * Si es true, intenta generar automáticamente datos históricos si no se proporcionan
     */
    autoGenerateHistorical: {
      type: Boolean,
      default: false
    },
    
    /**
     * Si es true, muestra la comparación por defecto
     */
    defaultShowComparison: {
      type: Boolean,
      default: false
    },
    
    /**
     * Cambio porcentual en los ingresos con respecto al período anterior
     */
    changePercent: {
      type: Number,
      default: 0
    },
    
    /**
     * Valor absoluto del cambio en los ingresos
     */
    changeAmount: {
      type: Number,
      default: 0
    },
    
    /**
     * Color principal del gráfico
     */
    color: {
      type: String,
      default: null
    },
    
    /**
     * Color para los datos de comparación del año anterior
     */
    comparisonColor: {
      type: String,
      default: '#777777'
    }
  },
  
  data() {
    return {
      chartWidth: 0,
      chartHeight: 0,
      currentMonthIndex: -1,
      mouseOver: false,
      mouseX: 0,
      mouseY: 0,
      showComparison: this.defaultShowComparison,
      monthLabels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      yAxisLabelsCount: 5, // Número de etiquetas en el eje Y
      // Datos simulados para el gráfico si no se proporcionan
      defaultData: [
        { month: 'Ene', year: new Date().getFullYear(), revenue: 1000000 },
        { month: 'Feb', year: new Date().getFullYear(), revenue: 1200000 },
        { month: 'Mar', year: new Date().getFullYear(), revenue: 2500000 },
        { month: 'Abr', year: new Date().getFullYear(), revenue: 3800000 },
        { month: 'May', year: new Date().getFullYear(), revenue: 5200000 },
        { month: 'Jun', year: new Date().getFullYear(), revenue: 4800000 },
        { month: 'Jul', year: new Date().getFullYear(), revenue: 8500000 },
        { month: 'Ago', year: new Date().getFullYear(), revenue: 12000000 },
        { month: 'Sep', year: new Date().getFullYear(), revenue: 9500000 },
        { month: 'Oct', year: new Date().getFullYear(), revenue: 11000000 },
        { month: 'Nov', year: new Date().getFullYear(), revenue: 12500000 },
        { month: 'Dic', year: new Date().getFullYear(), revenue: 15000000 }
      ],
      // Datos simulados para comparación del año anterior
      defaultHistoricalData: [],
      // Tooltip mostrado actualmente (principal o histórico)
      activeTooltipType: 'current',
      // Detectar si estamos en un dispositivo móvil
      windowWidth: window.innerWidth
    };
  },
  
  computed: {
    /**
     * Detecta si estamos en un dispositivo móvil basado en el ancho de la ventana
     */
    isMobile() {
      return this.windowWidth <= 768;
    },
    
    /**
     * Determina el color a usar para el gráfico según el valor de cambio
     */
    chartLineColor() {
      if (this.color) return this.color;
      
      // Si es positivo, usar verde como en SalesCard
      if (this.totalChange > 0) {
        return '#27ae60';
      }
      // Si es negativo, usar rojo como en SalesCard
      else if (this.totalChange < 0) {
        return '#e74c3c';
      }
      // Si es neutral, usar color turquesa por defecto
      else {
        return '#2dc6af';
      }
    },
    
    /**
     * Color para la línea de comparación del año anterior
     */
    comparisonLineColor() {
      return this.comparisonColor || '#777777';
    },
    
    /**
     * Color para la parte superior del gradiente
     */
    chartGradientTop() {
      if (this.totalChange > 0) {
        return '#27ae60';
      } else if (this.totalChange < 0) {
        return '#e74c3c';
      } else {
        return '#2dc6af';
      }
    },
    
    /**
     * Color para la parte inferior del gradiente
     */
    chartGradientBottom() {
      if (this.totalChange > 0) {
        return '#27ae60';
      } else if (this.totalChange < 0) {
        return '#e74c3c';
      } else {
        return '#2dc6af';
      }
    },
    
    /**
     * Obtiene los datos de ingresos actuales, generando datos con años si es necesario
     */
    chartData() {
      if (this.revenueData.length > 0) {
        return this.ensureYearInData(this.revenueData);
      }
      return this.defaultData;
    },
    
    /**
     * Obtiene los datos históricos para la comparación, generando si es necesario
     */
    historicalChartData() {
      if (this.historicalData.length > 0) {
        return this.ensureYearInData(this.historicalData);
      }
      
      if (this.autoGenerateHistorical && this.chartData.length > 0) {
        return this.generateHistoricalData();
      }
      
      return this.defaultHistoricalData;
    },
    
    /**
     * Calcula el total de ingresos sumando todos los valores
     */
    totalRevenue() {
      return this.chartData.reduce((sum, item) => sum + item.revenue, 0);
    },
    
    /**
     * Calcula el total de ingresos del año anterior para comparación
     */
    totalHistoricalRevenue() {
      return this.historicalChartData.reduce((sum, item) => sum + item.revenue, 0);
    },
    
    /**
     * Calcula la diferencia porcentual entre el periodo actual y el histórico
     */
    yearOverYearChangePercent() {
      if (!this.totalHistoricalRevenue) return 0;
      return ((this.totalRevenue - this.totalHistoricalRevenue) / this.totalHistoricalRevenue) * 100;
    },
    
    /**
     * Formatea el total de ingresos para mostrar
     */
    formattedTotalRevenue() {
      return this.formatLargeNumber(this.totalRevenue);
    },
    
    /**
     * Obtiene el valor de cambio total
     */
    totalChange() {
      if (this.showComparison && this.historicalChartData.length > 0) {
        return this.totalRevenue - this.totalHistoricalRevenue;
      }
      return this.changeAmount || 22325; // Valor de ejemplo si no se proporciona
    },
    
    /**
     * Formatea el cambio total para mostrar
     */
    formattedTotalChange() {
      return this.formatLargeNumber(this.totalChange);
    },
    
    /**
     * Formatea el porcentaje de cambio
     */
    formattedChangePercent() {
      if (this.showComparison && this.historicalChartData.length > 0) {
        return this.yearOverYearChangePercent.toFixed(1);
      }
      return (this.changePercent || 12.2).toFixed(1);
    },
    
    /**
     * Calcula la ruta SVG para la línea del gráfico
     */
    linePath() {
      if (!this.chartData.length || !this.chartWidth || !this.chartHeight) return '';
      
      const { maxValue } = this.calculateDataRange();
      const paddingBottom = 20;
      const paddingTop = 10;
      const paddingRight = 10; // Añadimos un margen derecho para acomodar el último mes
      const availableHeight = this.chartHeight - paddingBottom - paddingTop;
      const availableWidth = this.chartWidth - paddingRight;
      
      return this.chartData.map((point, index) => {
        const x = (index / (this.chartData.length - 1)) * availableWidth;
        const normalizedValue = point.revenue / maxValue;
        const y = this.chartHeight - paddingBottom - (normalizedValue * availableHeight);
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
      }).join(' ');
    },
    
    /**
     * Calcula la ruta SVG para la línea de comparación del año anterior
     */
    comparisonLinePath() {
      if (!this.showComparison || !this.historicalChartData.length || !this.chartWidth || !this.chartHeight) return '';
      
      const { maxValue } = this.calculateDataRange();
      const paddingBottom = 20;
      const paddingTop = 10;
      const paddingRight = 10; // Añadimos un margen derecho para acomodar el último mes
      const availableHeight = this.chartHeight - paddingBottom - paddingTop;
      const availableWidth = this.chartWidth - paddingRight;
      
      return this.historicalChartData.map((point, index) => {
        const x = (index / (this.historicalChartData.length - 1)) * availableWidth;
        const normalizedValue = point.revenue / maxValue;
        const y = this.chartHeight - paddingBottom - (normalizedValue * availableHeight);
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
      }).join(' ');
    },
    
    /**
     * Calcula la ruta SVG para el área bajo la línea
     */
    areaPath() {
      if (!this.chartData.length || !this.chartWidth || !this.chartHeight) return '';
      
      const { maxValue } = this.calculateDataRange();
      const paddingBottom = 20;
      const paddingTop = 10;
      const paddingRight = 10; // Añadimos un margen derecho para acomodar el último mes
      const availableHeight = this.chartHeight - paddingBottom - paddingTop;
      const availableWidth = this.chartWidth - paddingRight;
      
      const linePath = this.chartData.map((point, index) => {
        const x = (index / (this.chartData.length - 1)) * availableWidth;
        const normalizedValue = point.revenue / maxValue;
        const y = this.chartHeight - paddingBottom - (normalizedValue * availableHeight);
        return `${index === 0 ? 'M' : 'L'}${x},${y}`;
      }).join(' ');
      
      return `${linePath} L${availableWidth},${this.chartHeight - paddingBottom} L0,${this.chartHeight - paddingBottom} Z`;
    },
    
    /**
     * Calcula todos los puntos de datos para determinar el punto exacto a mostrar en cada posición
     */
    dataPoints() {
      if (!this.chartData.length || !this.chartWidth || !this.chartHeight) return [];
      
      const { maxValue } = this.calculateDataRange();
      const paddingBottom = 20;
      const paddingTop = 10;
      const paddingRight = 10; // Añadimos un margen derecho para acomodar el último mes
      const availableHeight = this.chartHeight - paddingBottom - paddingTop;
      const availableWidth = this.chartWidth - paddingRight;
      
      return this.chartData.map((point, index) => {
        const x = (index / (this.chartData.length - 1)) * availableWidth;
        const normalizedValue = point.revenue / maxValue;
        const y = this.chartHeight - paddingBottom - (normalizedValue * availableHeight);
        
        return {
          x,
          y,
          month: point.month,
          year: point.year,
          value: point.revenue,
          index,
          type: 'current'
        };
      });
    },
    
    /**
     * Calcula los puntos de datos para el año anterior
     */
    historicalDataPoints() {
      if (!this.showComparison || !this.historicalChartData.length || !this.chartWidth || !this.chartHeight) return [];
      
      const { maxValue } = this.calculateDataRange();
      const paddingBottom = 20;
      const paddingTop = 10;
      const paddingRight = 10; // Añadimos un margen derecho para acomodar el último mes
      const availableHeight = this.chartHeight - paddingBottom - paddingTop;
      const availableWidth = this.chartWidth - paddingRight;
      
      return this.historicalChartData.map((point, index) => {
        const x = (index / (this.historicalChartData.length - 1)) * availableWidth;
        const normalizedValue = point.revenue / maxValue;
        const y = this.chartHeight - paddingBottom - (normalizedValue * availableHeight);
        
        return {
          x,
          y,
          month: point.month,
          year: point.year,
          value: point.revenue,
          index,
          type: 'historical'
        };
      });
    },
    
    /**
     * Obtiene la información del punto actual seleccionado
     */
    currentPoint() {
      if (!this.dataPoints.length || this.currentMonthIndex < 0 || this.currentMonthIndex >= this.dataPoints.length) 
        return null;
      
      // Siempre devolvemos el punto actual
      return this.dataPoints[this.currentMonthIndex];
    },
    
    /**
     * Calcula el valor acumulado hasta el punto actual
     */
    currentPointAccumulated() {
      if (!this.chartData.length || this.currentMonthIndex < 0) return 0;
      
      let sum = 0;
      for (let i = 0; i <= this.currentMonthIndex; i++) {
        sum += this.chartData[i].revenue;
      }
      
      return sum;
    },
    
    /**
     * Calcula la diferencia entre el punto actual y el mismo punto del año anterior
     */
    currentPointYearOverYearChange() {
      if (!this.currentPoint || !this.showComparison || 
          this.currentMonthIndex < 0 || this.currentMonthIndex >= this.chartData.length ||
          this.currentMonthIndex >= this.historicalChartData.length) {
        return null;
      }
      
      const currentValue = this.chartData[this.currentMonthIndex].revenue;
      const historicalValue = this.historicalChartData[this.currentMonthIndex].revenue;
      
      return {
        amount: currentValue - historicalValue,
        percent: historicalValue ? ((currentValue - historicalValue) / historicalValue) * 100 : 0
      };
    },
    
    /**
     * Estilo para la posición del tooltip basado en la posición del mouse
     */
    tooltipStyle() {
      // Calcular si el tooltip debe aparecer a la izquierda o derecha del cursor
      // para evitar que se salga de los bordes
      const tooltipWidth = 180; // Aumentado para incluir la comparación
      const tooltipHeight = this.showComparison ? 140 : 80; // Altura aumentada para incluir la comparación
      const offset = 15; // Distancia del cursor al tooltip
      
      let left = this.mouseX + offset;
      let top = this.mouseY - tooltipHeight / 2;
      
      // Evitar que se salga por el lado derecho
      if (left + tooltipWidth > this.chartWidth) {
        left = this.mouseX - tooltipWidth - offset;
      }
      
      // Evitar que se salga por arriba
      if (top < 0) {
        top = 10;
      }
      
      // Evitar que se salga por abajo
      if (top + tooltipHeight > this.chartHeight) {
        top = this.chartHeight - tooltipHeight - 10;
      }
      
      return {
        left: `${left}px`,
        top: `${top}px`
      };
    },
    
    /**
     * Calcula dinámicamente las etiquetas del eje Y basándose en los datos reales
     */
    yAxisLabels() {
      const { maxValue } = this.calculateDataRange();
      const labels = [];
      
      // Si no hay datos, retornar array vacío
      if (maxValue <= 0) return [];
      
      // Encontrar un valor máximo redondeado adecuado para el eje Y
      let roundedMax = this.getRoundedMax(maxValue);
      
      // Calcular el incremento entre etiquetas
      const increment = roundedMax / (this.yAxisLabelsCount - 1);
      
      // Generar las etiquetas del eje Y
      for (let i = 0; i < this.yAxisLabelsCount; i++) {
        const value = i * increment;
        labels.push(this.formatAxisLabel(value));
      }
      
      // Regresar las etiquetas en orden de mayor a menor (para que coincidan con el dibujo)
      return labels.reverse();
    },
  },
  
  mounted() {
    this.updateChartDimensions();
    window.addEventListener('resize', this.handleResize);
    this.initDefaultHistoricalData();
  },
  
  beforeUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  
  watch: {
    // Observar cambios en la visualización de la comparación
    showComparison(newValue) {
      // Emitir evento cuando cambia el modo de comparación
      this.$emit('comparison-changed', newValue);
    }
  },
  
  methods: {
    /**
     * Maneja el evento de redimensionamiento de la ventana
     */
    handleResize() {
      this.windowWidth = window.innerWidth;
      this.updateChartDimensions();
    },
    
    /**
     * Inicializa los datos históricos por defecto
     */
    initDefaultHistoricalData() {
      if (this.autoGenerateHistorical && this.defaultHistoricalData.length === 0) {
        this.defaultHistoricalData = this.defaultData.map(item => ({
          month: item.month,
          year: item.year - 1,
          revenue: Math.floor(item.revenue * (0.7 + Math.random() * 0.4)) // 70-110% del valor actual
        }));
      }
    },
    
    /**
     * Genera datos históricos basados en los datos actuales
     */
    generateHistoricalData() {
      return this.chartData.map(item => ({
        month: item.month,
        year: item.year - 1, // Año anterior
        revenue: Math.floor(item.revenue * (0.7 + Math.random() * 0.4)) // 70-110% del valor actual
      }));
    },
    
    /**
     * Asegura que todos los elementos de datos tengan un año
     */
    ensureYearInData(data) {
      return data.map(item => {
        if (!item.year) {
          return {
            ...item,
            year: new Date().getFullYear() // Añadir el año actual si no existe
          };
        }
        return item;
      });
    },
    
    /**
     * Calcula el rango de valores para los dos conjuntos de datos
     */
    calculateDataRange() {
      let dataToCompare = [...this.chartData];
      
      if (this.showComparison && this.historicalChartData.length > 0) {
        dataToCompare = [...dataToCompare, ...this.historicalChartData];
      }
      
      // Obtener el valor máximo real de los datos
      let maxValue = Math.max(...dataToCompare.map(d => d.revenue));
      
      // Usar el valor máximo redondeado para asegurar que coincida con las etiquetas del eje Y
      maxValue = this.getRoundedMax(maxValue);
      
      return { maxValue };
    },
    
    /**
     * Actualiza las dimensiones del gráfico en función del contenedor
     */
    updateChartDimensions() {
      if (this.$refs.chartContainer) {
        this.chartWidth = this.$refs.chartContainer.clientWidth;
        this.chartHeight = this.$refs.chartContainer.clientHeight;
      }
    },
    
    /**
     * Gestiona el movimiento del mouse sobre el gráfico
     * Usa un algoritmo de "snap to nearest point" mejorado para evitar cambios erráticos
     */
    handleMouseMove(event) {
      if (!this.chartData.length || !this.dataPoints.length) return;
      
      const chartRect = this.$refs.chartContainer.getBoundingClientRect();
      const mouseX = event.clientX - chartRect.left;
      const mouseY = event.clientY - chartRect.top;
      
      // Actualizar la posición del mouse para el tooltip
      this.mouseX = mouseX;
      this.mouseY = mouseY;
      
      // Encuentra el punto más cercano al mouse
      this.updateActivePointFromPosition(mouseX);
      this.mouseOver = true;
    },
    
    /**
     * Gestiona el movimiento táctil sobre el gráfico (para dispositivos móviles)
     */
    handleTouchMove(event) {
      if (!this.chartData.length || !this.dataPoints.length || !event.touches[0]) return;
      
      const chartRect = this.$refs.chartContainer.getBoundingClientRect();
      const touchX = event.touches[0].clientX - chartRect.left;
      const touchY = event.touches[0].clientY - chartRect.top;
      
      // Actualizar la posición del touch para el tooltip
      this.mouseX = touchX;
      this.mouseY = touchY;
      
      this.updateActivePointFromPosition(touchX);
      this.mouseOver = true;
      
      // Prevenir el desplazamiento de la página durante el uso del gráfico
      event.preventDefault();
    },
    
    /**
     * Actualiza el punto activo basado en la posición X del mouse/touch
     * Algoritmo mejorado para prevenir saltos y movimientos bruscos
     */
    updateActivePointFromPosition(posX) {
      // Asegurarse de que posX esté dentro de los límites del gráfico
      posX = Math.min(Math.max(0, posX), this.chartWidth);
      
      if (this.dataPoints.length === 0) return;
      
      // Encuentra el punto más cercano en los datos actuales
      let nearestIndex = 0;
      let minDistance = Infinity;
      
      this.dataPoints.forEach((point, index) => {
        const distance = Math.abs(point.x - posX);
        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = index;
        }
      });
      
      // Siempre mostramos el punto actual
      this.activeTooltipType = 'current';
      
      // Actualiza el índice sólo si es diferente (evita re-renders innecesarios)
      if (this.currentMonthIndex !== nearestIndex) {
        this.currentMonthIndex = nearestIndex;
      }
    },
    
    /**
     * Restablece la visualización cuando el mouse deja el gráfico
     */
    resetHighlight() {
      this.mouseOver = false;
    },
    
    /**
     * Formatea un número grande para mostrar (1M, 1B, etc.)
     */
    formatLargeNumber(value) {
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(3).replace(/\.?0+$/, '')}B`;
      } else if (value >= 1000000) {
        return `${(value / 1000000).toFixed(3).replace(/\.?0+$/, '')}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K`;
      }
      return value.toString();
    },
    
    /**
     * Formatea un valor monetario con separadores de miles
     */
    formatCurrency(value) {
      return new Intl.NumberFormat('es-ES', {
        maximumFractionDigits: 0
      }).format(value);
    },
    
    /**
     * Formatea un valor de porcentaje
     */
    formatPercent(value) {
      return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
    },
    
    /**
     * Obtiene el valor del punto histórico en la posición actual
     */
    getHistoricalValueAtCurrentIndex() {
      if (!this.showComparison || !this.historicalDataPoints.length || this.currentMonthIndex < 0 || this.currentMonthIndex >= this.historicalDataPoints.length) return null;
      
      return this.historicalDataPoints[this.currentMonthIndex].value;
    },
    
    /**
     * Calcula un valor máximo redondeado apropiado para las etiquetas del eje Y
     */
    getRoundedMax(maxValue) {
      // Determinar la magnitud del valor
      const magnitude = Math.pow(10, Math.floor(Math.log10(maxValue)));
      
      // Redondear hacia arriba para obtener un valor "limpio"
      let roundedMax = Math.ceil(maxValue / magnitude) * magnitude;
      
      // Si el valor redondeado es mucho mayor que el máximo real, ajustar
      if (roundedMax > maxValue * 1.5) {
        roundedMax = Math.ceil(maxValue / (magnitude / 2)) * (magnitude / 2);
      }
      
      return roundedMax;
    },
    
    /**
     * Formatea las etiquetas del eje Y para que sean legibles
     */
    formatAxisLabel(value) {
      return this.formatLargeNumber(value);
    },
  }
};
</script>

<style scoped>
.revenue-chart-container {
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 16px;
  /* Efecto 3D con múltiples sombras */
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 4px 8px rgba(0, 0, 0, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  /* Borde con gradiente para efecto 3D */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  height: 350px;
  display: flex;
  flex-direction: column;
  color: var(--text-primary);
  overflow: hidden;
  position: relative;
  background-color: var(--bg-secondary, #1a1a1a);
  color: var(--text-primary, #efefef);
  /* Efecto de brillo en el borde superior */
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 20%
  );
  transition: transform 0.3s cubic-bezier(0.165, 0.84, 0.44, 1), 
              box-shadow 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
}

/* Efecto de elevación al pasar el mouse */
.revenue-chart-container:hover {
  transform: translateY(-3px);
  box-shadow: 
    0 5px 10px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Añadir un pseudo-elemento para el efecto de brillo en el borde */
.revenue-chart-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.3) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
}

/* Añadir un pseudo-elemento para el efecto de sombra en el borde inferior */
.revenue-chart-container::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.chart-title-section {
  display: flex;
  flex-direction: column;
}

.chart-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  opacity: 0.9;
  /* Efecto de texto 3D sutil */
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
}

.revenue-amount {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
  /* Efecto de texto 3D más pronunciado */
  text-shadow: 
    0 1px 1px rgba(0, 0, 0, 0.1),
    0 2px 2px rgba(0, 0, 0, 0.05);
}

.change-indicator {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
}

.change-value {
  font-weight: 600;
}

.positive {
  color: #27ae60; /* Verde que coincide con SalesCard */
}

.negative {
  color: #e74c3c; /* Rojo que coincide con SalesCard */
}

.period {
  opacity: 0.7;
  margin-left: 4px;
}

.period-selector {
  margin-left: auto;
}

.controls {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.comparison-toggle {
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0.9;
  transition: opacity 0.3s ease;
}

.comparison-toggle:hover {
  opacity: 1;
}

.comparison-toggle input[type="checkbox"] {
  position: relative;
  appearance: none;
  width: 34px;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-right: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.comparison-toggle input[type="checkbox"]::before {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  top: 1px;
  left: 1px;
  background: #444;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.comparison-toggle input[type="checkbox"]:checked {
  background: rgba(44, 187, 168, 0.5);
}

.comparison-toggle input[type="checkbox"]:checked::before {
  left: 19px;
  background: #2dc6af;
}

.toggle-label {
  white-space: nowrap;
}

.period-button {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  color: inherit;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.3s, background-color 0.3s;
}

.period-button:hover, 
.period-button.active {
  background-color: rgba(255, 255, 255, 0.1);
  opacity: 1;
}

.chart-content {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

.chart-axes {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 20px; /* Espacio para el eje X */
  width: 50px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 0;
}

.y-axis {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.axis-label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: left;
}

/* Ajuste para el modo claro - etiquetas del eje Y */
:root:not([data-theme='dark']) .axis-label {
  color: rgba(0, 0, 0, 0.6);
}

.chart-graphic {
  flex: 1;
  margin-left: 50px; /* Ancho del eje Y */
  position: relative;
  height: 100%;
  cursor: crosshair; /* Cambiar cursor al pasar el mouse sobre el gráfico */
  padding-bottom: 5px; /* Dar más espacio en la parte inferior */
}

.chart-svg {
  position: absolute;
  top: 0;
  left: 0;
  height: calc(100% - 20px); /* Restar altura del eje X por defecto */
  width: calc(100% - 10px); /* Añadir un pequeño margen a la derecha para mostrar diciembre */
}

.x-axis {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 20px;
  display: flex;
  align-items: center;
  padding: 0 5px; /* Pequeño padding para evitar que las etiquetas toquen los bordes */
  width: calc(100% - 10px); /* Hacer que el ancho coincida con el SVG */
}

.x-label {
  transform: translateX(-50%);
  font-size: 0.7rem;
  font-weight: 500;
  position: absolute;
  text-align: center;
}

/* Ajuste para el modo claro - etiquetas del eje X */
:root:not([data-theme='dark']) .x-label {
  color: rgba(0, 0, 0, 0.6);
}

/* Ajuste especial para el primer y último mes */
.x-label:first-child {
  left: 0 !important; /* Forzar el primer mes al inicio */
  transform: translateX(0); /* El primer mes se alinea al inicio */
}

.x-label:last-child {
  left: calc(100% - 10px) !important; /* Forzar el último mes al final */
  transform: translateX(-100%); /* El último mes se alinea al final */
}

.x-label.active {
  font-weight: 600;
}

/* Ajuste adicional para noviembre y diciembre para evitar superposición */
.x-label:nth-last-child(1), /* Dic */
.x-label:nth-last-child(2) { /* Nov */
  margin-left: -2px; /* Leve separación entre Nov y Dic */
}

/* Ajustar altura del eje X para acomodar las etiquetas rotadas */
.x-axis {
  height: 35px;
  padding-bottom: 5px;
}

/* Los colores activos de los ejes X se definirán dinámicamente basados en chartLineColor */
.positive .x-label.active {
  color: #27ae60;
}

.negative .x-label.active {
  color: #e74c3c;
}

/* Ajuste para el modo claro - etiquetas activas */
:root:not([data-theme='dark']) .positive .x-label.active {
  color: #1e8449; /* Verde más oscuro para mejor visibilidad en modo claro */
}

:root:not([data-theme='dark']) .negative .x-label.active {
  color: #c0392b; /* Rojo más oscuro para mejor visibilidad en modo claro */
}

/* Estilos para los puntos de datos */
.hover-point {
  filter: drop-shadow(0 0 3px rgba(0, 0, 0, 0.3));
  transition: transform 0.1s ease;
}

/* Ajustar el color del borde del círculo en modo claro */
:root:not([data-theme='dark']) .chart-svg circle.hover-point {
  stroke: #ffffff; /* Borde blanco en modo claro */
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5)); /* Sombra más pronunciada */
}

/* Ajustar el color de la línea vertical en modo claro */
:root:not([data-theme='dark']) .chart-svg line {
  stroke: var(--text-primary, #333) !important; /* Asegurar que la línea sea visible */
  stroke-width: 1px; /* Líneas más finas en móvil */
}

/* Nuevo tooltip que sigue al cursor */
.tooltip {
  position: absolute;
  z-index: 100;
  background: var(--bg-secondary, #222);
  color: var(--text-primary, #efefef);
  border-radius: 6px;
  padding: 6px 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: none;
  width: auto;
  min-width: 100px;
  max-width: 220px;
  opacity: 0;
  animation: fadeIn 0.2s forwards;
  transform-origin: center left;
}

.tooltip::before {
  content: '';
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--bg-secondary, #222);
  transform: rotate(45deg);
  left: -4px;
  top: 50%;
  margin-top: -4px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Ajustes para el modo claro */
:root:not([data-theme='dark']) .tooltip {
  background: var(--bg-secondary, #fff);
  color: var(--text-primary, #333);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.05);
}

:root:not([data-theme='dark']) .tooltip::before {
  background: var(--bg-secondary, #fff);
  border-left: 1px solid rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

:root:not([data-theme='dark']) .tooltip-accumulated,
:root:not([data-theme='dark']) .comparison-label {
  color: var(--text-secondary, rgba(0, 0, 0, 0.6));
}

:root:not([data-theme='dark']) .tooltip-comparison {
  border-top: 1px dashed var(--border-color, rgba(0, 0, 0, 0.1));
}

.tooltip-title {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 5px;
  text-align: left;
  color: var(--text-primary, #efefef);
}

.tooltip-value {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 3px;
  text-align: left;
}

/* Aplica color basado en el valor */
.positive .tooltip-value, 
.comparison-difference.positive {
  color: #27ae60;
}

.negative .tooltip-value,
.comparison-difference.negative {
  color: #e74c3c;
}

/* Aseguramos que los colores positivo/negativo sean visibles en ambos modos */
:root:not([data-theme='dark']) .positive .tooltip-value,
:root:not([data-theme='dark']) .comparison-difference.positive {
  color: #1e8449;
}

:root:not([data-theme='dark']) .negative .tooltip-value,
:root:not([data-theme='dark']) .comparison-difference.negative {
  color: #c0392b;
}

.tooltip-accumulated {
  font-size: 0.7rem;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  text-align: left;
  margin-bottom: 5px;
}

/* Estilos para la comparación de año a año */
.tooltip-comparison {
  margin-top: 5px;
  padding-top: 5px;
  border-top: 1px dashed var(--border-color, rgba(255, 255, 255, 0.15));
}

.comparison-label {
  font-size: 0.7rem;
  color: var(--text-secondary, rgba(255, 255, 255, 0.7));
  text-align: left;
  margin-bottom: 2px;
}

.comparison-value {
  font-size: 0.8rem;
  font-weight: 600;
  text-align: left;
  margin-bottom: 2px;
  color: var(--text-primary, #efefef);
}

.comparison-difference {
  font-size: 0.7rem;
  font-weight: 600;
  text-align: left;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-5px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Eliminamos los estilos redundantes */
.interaction-overlay {
  cursor: crosshair;
}

/* Ajustes para móviles */
@media (max-width: 768px) {
  .revenue-chart-container {
    height: 300px;
    padding: 12px;
  }
  
  .revenue-amount {
    font-size: 1.6rem;
  }
  
  .chart-title {
    font-size: 0.85rem;
  }
  
  /* Ajustes para mejorar la experiencia táctil en móviles */
  .chart-graphic {
    cursor: pointer;
    padding-bottom: 25px; /* Más espacio en la parte inferior para las etiquetas */
  }
  
  /* Ajustando el tooltip para móviles */
  .tooltip {
    padding: 6px 10px;
    min-width: 100px;
  }
  
  .tooltip-title {
    font-size: 0.8rem;
  }
  
  .tooltip-value {
    font-size: 0.9rem;
  }
  
  .tooltip-accumulated,
  .comparison-label,
  .comparison-value,
  .comparison-difference {
    font-size: 0.7rem;
  }
  
  /* Ajustar controles y toggle para móviles */
  .controls {
    flex-direction: column;
    gap: 5px;
  }
  
  .comparison-toggle {
    font-size: 0.7rem;
  }
  
  .comparison-toggle input[type="checkbox"] {
    width: 30px;
    height: 14px;
    margin-right: 6px;
  }
  
  .comparison-toggle input[type="checkbox"]::before {
    width: 12px;
    height: 12px;
  }
  
  .comparison-toggle input[type="checkbox"]:checked::before {
    left: 17px;
  }
  
  /* Base para todos los meses en móvil - estilo diagonal unificado */
  .x-label {
    transform: translateX(-50%) rotate(-35deg) !important;
    transform-origin: center top !important;
    font-size: 0.7rem;
    top: auto;
    bottom: 5px; /* Separar un poco del borde inferior */
    height: 20px;
    line-height: 1;
    margin-top: 0;
    white-space: nowrap;
    color: rgba(255, 255, 255, 0.6);
  }
  
  /* Ajustar la altura del eje X y su posición */
  .x-axis {
    height: 30px; /* Ajustar altura para etiquetas en la parte inferior */
    padding-bottom: 5px; /* Añadir padding en la parte inferior */
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
  }
  
  /* Ajustar el tamaño del SVG */
  .chart-svg {
    height: calc(100% - 30px); /* Ajustar a la nueva altura del eje X */
  }
  
  /* Líneas más finas en móvil */
  .chart-svg line {
    stroke-width: 1px !important;
  }
  
  /* Ajuste para el modo claro en móvil */
  :root:not([data-theme='dark']) .x-label {
    color: rgba(0, 0, 0, 0.6);
  }
  
  /* Posiciones específicas para cada mes */
  .x-label.month-0 { left: 3% !important; }
  .x-label.month-1 { left: 11% !important; }
  .x-label.month-2 { left: 19% !important; }
  .x-label.month-3 { left: 27% !important; }
  .x-label.month-4 { left: 35% !important; }
  .x-label.month-5 { left: 43% !important; }
  .x-label.month-6 { left: 51% !important; }
  .x-label.month-7 { left: 60% !important; }
  .x-label.month-8 { left: 69% !important; }
  .x-label.month-9 { left: 78% !important; }
  .x-label.month-10 { left: 87% !important; }
  .x-label.month-11 { left: 97% !important; }
}

/* Ajustes para los elementos SVG en modo claro */
:root:not([data-theme='dark']) .chart-svg path[fill="url(#areaGradient)"] {
  opacity: 0.7; /* Aumentar la opacidad del área en modo claro */
}

:root:not([data-theme='dark']) .chart-svg path[stroke] {
  stroke-width: 2.5px; /* Líneas ligeramente más gruesas en modo claro */
}

/* Ajustes para el contenedor del gráfico en modo claro */
:root:not([data-theme='dark']) .chart-content {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* Ajustes para el contenedor del eje Y en modo claro */
:root:not([data-theme='dark']) .chart-axes {
  border-right: 1px dashed rgba(0, 0, 0, 0.1);
}

/* Posicionamiento base para las etiquetas de meses */
.x-label.month-0 { left: 0%; transform: translateX(0); } /* Enero */
.x-label.month-1 { left: 9.09%; } /* Febrero */
.x-label.month-2 { left: 18.18%; } /* Marzo */
.x-label.month-3 { left: 27.27%; } /* Abril */
.x-label.month-4 { left: 36.36%; } /* Mayo */
.x-label.month-5 { left: 45.45%; } /* Junio */
.x-label.month-6 { left: 54.54%; } /* Julio */
.x-label.month-7 { left: 63.63%; } /* Agosto */
.x-label.month-8 { left: 72.72%; } /* Septiembre */
.x-label.month-9 { left: 81.81%; } /* Octubre */
.x-label.month-10 { left: 90.90%; } /* Noviembre */
.x-label.month-11 { left: 100%; transform: translateX(-100%); } /* Diciembre */
</style> 