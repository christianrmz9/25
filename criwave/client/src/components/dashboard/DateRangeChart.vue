<template>
  <div class="date-range-chart">
    <div class="chart-header">
      <h3>Ventas por Rango de Fecha</h3>
      <div class="date-controls">
        <div class="date-picker-container">
          <input 
            type="text" 
            readonly
            :value="formatDateRange"
            @click="toggleDatePicker"
            class="date-input"
            placeholder="Seleccionar rango de fechas"
          >
          <div v-if="showDatePicker" class="date-picker-popup">
            <div class="calendar">
              <div class="calendar-header">
                <button @click="prevMonth" class="month-nav">&lt;</button>
                <span>{{ currentMonthName }}</span>
                <button @click="nextMonth" class="month-nav">&gt;</button>
              </div>
              <div class="calendar-body">
                <div class="weekdays">
                  <span v-for="day in weekDays" :key="day">{{ day }}</span>
                </div>
                <div class="days">
                  <div 
                    v-for="day in calendarDays" 
                    :key="day.date"
                    class="day"
                    :class="{
                      'selected': isSelected(day.date),
                      'in-range': isInRange(day.date),
                      'disabled': isDisabled(day.date),
                      'today': isToday(day.date),
                      'other-month': day.isOtherMonth
                    }"
                    @click="selectDate(day.date)"
                  >
                    {{ day.dayNumber }}
                  </div>
                </div>
              </div>
              <div class="calendar-footer">
                <button @click="applyRange" class="apply-btn" :disabled="!canApply">
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
      
    <div class="chart-container" v-if="hasDateRange">
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
      </div>
      <apexchart
        v-if="hasData"
        type="area"
        height="350"
        :options="chartOptions"
        :series="series"
      ></apexchart>
      <div v-else-if="!isLoading" class="no-data-message">
        Selecciona un rango de fechas para visualizar los datos
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

export default defineComponent({
  name: 'DateRangeChart',
  components: {
    apexchart: VueApexCharts
  },
  
  data() {
    return {
      startDate: '',
      endDate: '',
      today: new Date().toISOString().split('T')[0],
      isLoading: false,
      isDarkMode: false,
      showDatePicker: false,
      currentMonth: new Date(),
      tempStartDate: null,
      tempEndDate: null,
      weekDays: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      series: [{
        name: 'Ventas',
        data: []
      }],
      chartOptions: {
        chart: {
          type: 'area',
          height: 350,
          background: 'transparent',
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
          borderColor: '#f1f1f1',
          strokeDashArray: 3,
          position: 'back'
        },
        markers: {
          size: 4,
          colors: ['#2E93fA'],
          strokeWidth: 2,
          hover: {
            size: 7
          }
        },
        xaxis: {
          type: 'datetime',
          labels: {
            style: {
              colors: '#666',
              fontSize: '12px'
            }
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          }
        },
        yaxis: {
          title: {
            text: 'Ventas ($)',
            style: {
              fontSize: '14px',
              color: '#666'
            }
          },
          labels: {
            style: {
              colors: '#666'
            },
            formatter: function(value) {
              return new Intl.NumberFormat('es-MX', {
                style: 'currency',
                currency: 'MXN'
              }).format(value)
            }
          }
        },
        tooltip: {
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
        }
      }
    }
  },

  computed: {
    hasDateRange() {
      return this.startDate && this.endDate
    },
    hasData() {
      return this.series[0].data.length > 0
    },
    currentMonthName() {
      return this.currentMonth.toLocaleDateString('es-ES', { 
        month: 'long',
        year: 'numeric'
      })
    },

    calendarDays() {
      const year = this.currentMonth.getFullYear()
      const month = this.currentMonth.getMonth()
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      const days = []
      const firstDayOfWeek = firstDay.getDay()
      
      // Días del mes anterior
      for (let i = firstDayOfWeek; i > 0; i--) {
        const prevDate = new Date(year, month, -i + 1)
        days.push({
          date: prevDate.toISOString().split('T')[0],
          dayNumber: prevDate.getDate(),
          isOtherMonth: true
        })
      }
      
      // Días del mes actual
      for (let day = 1; day <= lastDay.getDate(); day++) {
        const currentDate = new Date(year, month, day)
        days.push({
          date: currentDate.toISOString().split('T')[0],
          dayNumber: day,
          isOtherMonth: false
        })
      }
      
      // Días del mes siguiente
      const remainingDays = 42 - days.length
      for (let i = 1; i <= remainingDays; i++) {
        const nextDate = new Date(year, month + 1, i)
        days.push({
          date: nextDate.toISOString().split('T')[0],
          dayNumber: i,
          isOtherMonth: true
        })
      }
      
      return days
    },

    formatDateRange() {
      if (!this.startDate && !this.endDate) return ''
      if (!this.endDate) return this.formatDate(this.startDate)
      return `${this.formatDate(this.startDate)} - ${this.formatDate(this.endDate)}`
    },

    canApply() {
      return this.tempStartDate && this.tempEndDate
    }
  },

  created() {
    this.checkDarkMode()
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', this.checkDarkMode)
  },
  
  beforeUnmount() {
    window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', this.checkDarkMode)
  },
  
  methods: {
    checkDarkMode() {
      this.isDarkMode = document.documentElement.classList.contains('dark-theme')
      this.updateChartTheme()
    },

    updateChartTheme() {
      const style = getComputedStyle(document.documentElement)
      const textSecondary = style.getPropertyValue('--text-secondary').trim()
      const borderColor = style.getPropertyValue('--border-color').trim()
      const bgSecondary = style.getPropertyValue('--bg-secondary').trim()
      
      this.chartOptions = {
        ...this.chartOptions,
        chart: {
          ...this.chartOptions.chart,
          background: 'transparent',
          foreColor: textSecondary,
          toolbar: {
            ...this.chartOptions.chart.toolbar,
            tools: {
              ...this.chartOptions.chart.toolbar.tools,
              download: true,
              selection: true,
              zoom: true,
              zoomin: true,
              zoomout: true,
              pan: true,
              reset: true
            }
          }
        },
        plotOptions: {
          area: {
            fillTo: 'origin'
          }
        },
        grid: {
          show: false,
          background: bgSecondary,
          padding: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
          }
        },
        fill: {
          type: 'gradient',
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.45,
            opacityTo: 0.05,
            stops: [0, 95, 100]
          }
        },
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
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          },
          lines: {
            show: false
          }
        },
        yaxis: {
          ...this.chartOptions.yaxis,
          title: {
            text: 'Ventas ($)',
            style: {
              fontSize: '14px',
              color: textSecondary
            }
          },
          labels: {
            style: {
              colors: textSecondary
            }
          },
          lines: {
            show: false
          },
          axisBorder: {
            show: false
          },
          axisTicks: {
            show: false
          }
        },
        tooltip: {
          theme: this.isDarkMode ? 'dark' : 'light'
        },
        theme: {
          mode: this.isDarkMode ? 'dark' : 'light',
          palette: 'palette1'
        }
      }
    },

    async loadData() {
      if (!this.hasDateRange) return

      this.isLoading = true
      // Resetear los datos actuales
      this.series[0].data = []
      
      try {
        const start = new Date(this.startDate)
        const end = new Date(this.endDate)
        const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
        
        const data = []
        let currentValue = Math.floor(Math.random() * 500000) + 100000
        
        for (let i = 0; i <= diffDays; i++) {
          const date = new Date(start)
          date.setDate(start.getDate() + i)
          
          const variation = (Math.random() * 0.2) - 0.1
          currentValue = Math.floor(currentValue * (1 + variation))
          currentValue = Math.max(currentValue, 100000)
          
          data.push([
            date.getTime(),
            currentValue
          ])
        }
        
        // Actualizar los datos con un pequeño retraso para asegurar la re-renderización
        setTimeout(() => {
          this.series = [{
            name: 'Ventas',
            data: data
          }]
          this.isLoading = false
        }, 300)
        
      } catch (error) {
        console.error('Error loading data:', error)
        this.isLoading = false
      }
    },

    onDateChange() {
      if (!this.startDate || !this.endDate) return
      
      const start = new Date(this.startDate)
      const end = new Date(this.endDate)
      const today = new Date()

      if (start > end) {
        this.startDate = this.endDate
        return
      }

      if (end > today) {
        this.endDate = today.toISOString().split('T')[0]
        return
      }

      // Forzar la actualización de los datos
      this.series[0].data = []
      this.$nextTick(() => {
        this.loadData()
      })
    },

    formatDate(dateString) {
      if (!dateString) return ''
      const [year, month, day] = dateString.split('-')
      return `${day}/${month}/${year}`
    },

    toggleDatePicker() {
      this.showDatePicker = !this.showDatePicker
      if (this.showDatePicker) {
        this.tempStartDate = this.startDate
        this.tempEndDate = this.endDate
        document.addEventListener('click', this.handleClickOutside)
      }
    },

    handleClickOutside(event) {
      const picker = this.$el.querySelector('.date-picker-container')
      if (picker && !picker.contains(event.target)) {
        this.showDatePicker = false
        document.removeEventListener('click', this.handleClickOutside)
      }
    },

    prevMonth() {
      this.currentMonth = new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() - 1
      )
    },

    nextMonth() {
      this.currentMonth = new Date(
        this.currentMonth.getFullYear(),
        this.currentMonth.getMonth() + 1
      )
    },

    selectDate(date) {
      if (this.isDisabled(date)) return

      // Crear fecha a partir del string ISO
      const selectedDate = date

      if (!this.tempStartDate || (this.tempStartDate && this.tempEndDate)) {
        // Primera selección o nueva selección después de un rango completo
        this.tempStartDate = selectedDate
        this.tempEndDate = null
      } else {
        // Segunda selección para completar el rango
        if (selectedDate < this.tempStartDate) {
          this.tempEndDate = this.tempStartDate
          this.tempStartDate = selectedDate
        } else {
          this.tempEndDate = selectedDate
        }
      }
    },

    isSelected(date) {
      return date === this.tempStartDate || date === this.tempEndDate
    },

    isInRange(date) {
      if (!this.tempStartDate || !this.tempEndDate) return false
      return date > this.tempStartDate && date < this.tempEndDate
    },

    isToday(date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0]
      return date === todayStr
    },

    isDisabled(date) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0]
      return date > todayStr
    },

    applyRange() {
      if (this.tempStartDate && this.tempEndDate) {
        this.startDate = this.tempStartDate
        this.endDate = this.tempEndDate
        this.showDatePicker = false
        this.onDateChange()
      }
    }
  }
})
</script>

<style scoped>
.date-range-chart {
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

.chart-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
}

h3 {
  margin: 0;
  color: var(--text-primary);
}

.date-controls {
  display: flex;
  justify-content: center;
  flex: 1;
  padding-right: 200px;
}

.date-picker-container {
  position: relative;
  display: inline-block;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-size: 0.9rem;
  transition: all 0.2s ease;
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
}

.chart-container {
  position: relative;
  min-height: 350px;
  background: transparent;
  border-radius: 8px;
  overflow: hidden;
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

.no-data-message {
  height: 350px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--text-secondary);
  font-size: 1.1rem;
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

  .date-controls {
    width: 100%;
    justify-content: center;
    padding-right: 0;
  }

  .date-picker-container {
    width: 100%;
    max-width: 300px;
  }
}

:deep(.apexcharts-canvas) {
  background: transparent !important;
}

:deep(.apexcharts-plot-area) {
  fill: transparent !important;
}

:deep(.apexcharts-grid-row) {
  fill: var(--bg-secondary) !important;
}

:deep(.apexcharts-plot-background) {
  fill: var(--bg-secondary) !important;
}

:deep(.apexcharts-inner) {
  background: var(--bg-secondary) !important;
}

:deep(.apexcharts-area) {
  fill-opacity: 0.45;
}

:deep(.apexcharts-tooltip) {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
}

:deep(.apexcharts-gridlines-horizontal),
:deep(.apexcharts-gridlines-vertical) {
  display: none !important;
}

:deep(.apexcharts-grid) {
  display: none !important;
}

:deep(.apexcharts-xaxis-line),
:deep(.apexcharts-yaxis-line) {
  display: none !important;
}

:deep(.apexcharts-xaxis),
:deep(.apexcharts-yaxis) {
  line, path {
    display: none !important;
  }
}

.update-button {
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 100px;
}

.update-button:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.update-button:disabled {
  background: var(--disabled);
  cursor: not-allowed;
  opacity: 0.7;
}

.button-text {
  font-weight: 500;
}

.date-picker-popup {
  position: absolute;
  bottom: calc(100% + 5px);
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 0;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  width: 300px;
  padding: 16px;
}

.calendar {
  width: 100%;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.month-nav {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.month-nav:hover {
  background: var(--hover);
}

.weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
  margin-bottom: 8px;
}

.days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.day:hover:not(.disabled) {
  background: var(--hover);
}

.day.selected {
  background: var(--primary);
  color: white;
}

.day.in-range {
  background: var(--primary-light);
  color: var(--primary);
}

.day.disabled {
  color: var(--text-disabled);
  cursor: not-allowed;
}

.day.today {
  font-weight: bold;
  border: 1px solid var(--primary);
}

.day.other-month {
  color: var(--text-disabled);
}

.calendar-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.apply-btn {
  padding: 6px 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.apply-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.apply-btn:disabled {
  background: var(--disabled);
  cursor: not-allowed;
  opacity: 0.7;
}

.date-input {
  width: 200px;
  cursor: pointer;
  text-align: left;
}
</style> 