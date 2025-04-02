<template>
  <div class="revenue-chart">
    <div class="chart-header">
      <h3>Ingresos</h3>
    </div>
      
    <div class="chart-container">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
              </div>
      <apexchart
        type="area"
        height="350"
        :options="chartOptions"
        :series="series"
      ></apexchart>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

export default defineComponent({
  name: 'RevenueChart',
  components: {
    apexchart: VueApexCharts
  },
  
  data() {
    const today = new Date()
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(today.getDate() - 30)
    
    return {
      startDate: thirtyDaysAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      today: today.toISOString().split('T')[0],
      isLoading: false,
      isDarkMode: false,
      series: [{
        name: 'Ingresos',
        data: []
      }],
      chartOptions: {
        chart: {
          type: 'area',
          height: 350,
          background: this.isDarkMode ? '#000000' : '#fff',
          foreColor: '#666',
          toolbar: {
            show: true,
            tools: {
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true
            }
          },
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
              enabled: true,
              delay: 150
            },
            dynamicAnimation: {
              enabled: true,
              speed: 350
            }
          }
        },
        plotOptions: {
          area: {
            fillTo: 'origin'
          }
        },
        colors: ['#2E93fA'],
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [0, 95, 100]
          }
        },
        dataLabels: {
          enabled: false
        },
        stroke: {
          curve: 'smooth',
          width: 2
        },
        grid: {
          show: true,
          borderColor: this.isDarkMode ? '#333' : '#f1f1f1',
          strokeDashArray: 3,
          position: 'back',
          padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          },
          xaxis: {
            lines: {
              show: true
            }
          },
          yaxis: {
            lines: {
              show: true
            }
          }
        },
        markers: {
          size: 4,
          colors: ['#2E93fA'],
          strokeColors: this.isDarkMode ? '#333' : '#fff',
          strokeWidth: 2,
          hover: {
            size: 7
          }
        },
        xaxis: {
          type: 'datetime',
          labels: {
            style: {
              colors: this.isDarkMode ? '#e0e0e0' : '#666',
              fontSize: '12px'
            }
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          },
          crosshairs: {
            show: true,
            stroke: {
              color: '#666',
              width: 1,
              dashArray: 3
            }
          }
        },
        yaxis: {
          title: {
            text: 'Ingresos ($)',
            style: {
              fontSize: '14px',
              color: this.isDarkMode ? '#e0e0e0' : '#666'
            }
          },
          labels: {
            style: {
              colors: this.isDarkMode ? '#e0e0e0' : '#666'
            },
            formatter: function(value) {
              return value >= 1000000 
                ? `$${(value/1000000).toFixed(1)}M` 
                : value >= 1000 
                  ? `$${(value/1000).toFixed(1)}K` 
                  : `$${value}`
            }
          }
        },
        tooltip: {
          theme: this.isDarkMode ? 'dark' : 'light',
          shared: true,
          intersect: false,
          y: {
            formatter: function(value) {
              return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
              }).format(value)
            }
          }
        },
        theme: {
          mode: this.isDarkMode ? 'dark' : 'light',
          palette: 'palette1'
        }
      }
    }
  },

  created() {
    // Detectar el modo oscuro inicial
    this.checkDarkMode()
    // Escuchar cambios en el modo oscuro
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.checkDarkMode)
  },
  
  mounted() {
    // Cargar datos iniciales con comparación
    this.loadData()
  },
  
  beforeUnmount() {
    // Limpiar el listener cuando el componente se destruye
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.checkDarkMode)
  },
  
  watch: {
    startDate: {
      handler() {
        this.loadData()
      }
    },
    endDate: {
      handler() {
        this.loadData()
      }
    }
  },
  
  methods: {
    checkDarkMode() {
      this.isDarkMode = document.documentElement.classList.contains('dark-theme')
      this.updateChartTheme()
    },

    updateChartTheme() {
      const style = getComputedStyle(document.documentElement)
      const bgSecondary = style.getPropertyValue('--bg-secondary').trim()
      const textSecondary = style.getPropertyValue('--text-secondary').trim()
      const borderColor = style.getPropertyValue('--border-color').trim()
      
      this.chartOptions = {
        ...this.chartOptions,
        chart: {
          ...this.chartOptions.chart,
          background: bgSecondary,
          foreColor: textSecondary
        },
        grid: {
          ...this.chartOptions.grid,
          borderColor: borderColor
        },
        colors: ['#2E93fA'],
        markers: {
          size: 4,
          colors: ['#2E93fA'],
          strokeColors: bgSecondary,
          strokeWidth: 2,
          hover: {
            size: 7
          }
        },
        xaxis: {
          ...this.chartOptions.xaxis,
          labels: {
            style: {
              colors: textSecondary,
              fontSize: '12px'
            }
          },
          crosshairs: {
            show: true,
            stroke: {
              color: borderColor,
              width: 1,
              dashArray: 3
            }
          }
        },
        yaxis: {
          ...this.chartOptions.yaxis,
          title: {
            text: 'Ingresos ($)',
            style: {
              fontSize: '14px',
              color: textSecondary
            }
          },
          labels: {
            style: {
              colors: textSecondary
            }
          }
        },
        tooltip: {
          theme: this.isDarkMode ? 'dark' : 'light',
          shared: true,
          intersect: false,
          style: {
            fontSize: '12px'
          },
          y: {
            formatter: function(value) {
              return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
              }).format(value)
            }
          }
        }
      }
    },

    async loadData() {
      this.isLoading = true
      try {
        // Convertir fechas a objetos Date
        const start = new Date(this.startDate)
        const end = new Date(this.endDate)
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        
        // Generar datos para el rango seleccionado
        const data = []
        let currentValue = Math.floor(Math.random() * 500000) + 100000 // Valor inicial
        
        for (let i = 0; i <= diffDays; i++) {
          const date = new Date(start)
          date.setDate(start.getDate() + i)
          
          // Generar variación aleatoria entre -10% y +10%
          const variation = (Math.random() * 0.2) - 0.1
          currentValue = Math.floor(currentValue * (1 + variation))
          
          // Asegurar que el valor no sea negativo
          currentValue = Math.max(currentValue, 100000)
          
          data.push([
            date.getTime(),
            currentValue
          ])
        }
        
        // Actualizar las series con los datos
        this.series = [{
          name: 'Ingresos',
          data: data
        }]
      } catch (error) {
        console.error('Error loading revenue data:', error)
      } finally {
        this.isLoading = false
      }
    },

    onDateChange() {
      // Validar que las fechas sean válidas
      if (!this.startDate || !this.endDate) {
        return
      }

      const start = new Date(this.startDate)
      const end = new Date(this.endDate)
      const today = new Date()

      // Validar que la fecha de inicio no sea posterior a la fecha final
      if (start > end) {
        this.startDate = this.endDate
        return
      }

      // Validar que la fecha final no sea posterior a hoy
      if (end > today) {
        this.endDate = today.toISOString().split('T')[0]
        return
      }

      // Validar que el rango no sea mayor a 365 días
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
      if (diffDays > 365) {
        this.endDate = new Date(start.getTime() + (365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0]
      }

      this.loadData()
    }
  }
})
</script>

<style scoped>
.revenue-chart {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 4px 8px rgba(0, 0, 0, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 20%
  );
}

/* Efecto de elevación al pasar el mouse */
.revenue-chart:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 5px 10px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.1),
    0 20px 40px rgba(0, 0, 0, 0.05),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1),
    inset 0 2px 0 rgba(255, 255, 255, 0.1);
}

/* Efecto de presión al hacer clic */
.revenue-chart:active {
  transform: translateY(-2px);
  box-shadow: 
    0 2px 5px rgba(0, 0, 0, 0.1),
    0 5px 10px rgba(0, 0, 0, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.1s cubic-bezier(0.165, 0.84, 0.44, 1);
}

/* Añadir un pseudo-elemento para el efecto de brillo en el borde */
.revenue-chart::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

/* Añadir un pseudo-elemento para el efecto de sombra en el borde inferior */
.revenue-chart::after {
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
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.chart-controls {
  display: flex;
  align-items: center;
}

.date-range-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-secondary);
  padding: 8px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.date-input {
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.date-input:hover {
  border-color: var(--border-hover);
}

.date-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.date-separator {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.chart-container {
  position: relative;
  min-height: 350px;
  background: var(--bg-primary);
}

.loading-overlay {
    position: absolute;
  top: 0;
    left: 0;
    right: 0;
  bottom: 0;
  background: var(--bg-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--spinner-track);
  border-top-color: var(--spinner-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .chart-controls {
    flex-direction: column;
    width: 100%;
  }

  .date-range-picker {
    flex-direction: column;
    width: 100%;
  }

  .date-input {
    width: 100%;
  }
}

:deep(.apexcharts-canvas) {
  background: var(--bg-secondary) !important;
}

:deep(.apexcharts-svg) {
  background: var(--bg-secondary) !important;
}

:deep(.apexcharts-plot-area) {
  fill: var(--bg-secondary) !important;
}

:deep(.apexcharts-grid) {
  background: var(--bg-secondary) !important;
}

:deep(.apexcharts-gridlines-horizontal),
:deep(.apexcharts-gridlines-vertical) {
  stroke: var(--border-color) !important;
}

:deep(.apexcharts-plot-background) {
  fill: var(--bg-secondary) !important;
}

:deep(.apexcharts-inner) {
  background: var(--bg-secondary) !important;
}

:deep(.apexcharts-area-series) path {
  fill-opacity: 0.5;
}

:deep(.apexcharts-tooltip) {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.apexcharts-tooltip-title) {
  background: var(--bg-tertiary) !important;
  border-bottom: 1px solid var(--border-color) !important;
}

:deep(.apexcharts-xaxistooltip) {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
}
</style> 