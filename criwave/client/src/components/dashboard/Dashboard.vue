<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <!-- Título y subtítulo eliminados -->
    </div>
    
    <div class="sales-cards">
      <!-- Tarjeta de ventas diarias -->
      <sales-card
        title="Ventas del día"
        :amount="dailySales.amount"
        :count="dailySales.count"
        :average="dailySales.average"
        :change="dailySales.change"
        :change-amount="dailySales.changeAmount"
        comparison-period="día anterior"
      />
      
      <!-- Tarjeta de ventas semanales -->
      <sales-card
        title="Ventas de la semana"
        :amount="weeklySales.amount"
        :count="weeklySales.count"
        :average="weeklySales.average"
        :change="weeklySales.change"
        :change-amount="weeklySales.changeAmount"
        comparison-period="semana anterior"
      />
      
      <!-- Tarjeta de ventas mensuales -->
      <sales-card
        title="Ventas del mes"
        :amount="monthlySales.amount"
        :count="monthlySales.count"
        :average="monthlySales.average"
        :change="monthlySales.change"
        :change-amount="monthlySales.changeAmount"
        comparison-period="mes anterior"
      />
    </div>
    
    <!-- Gráfico de ingresos de los últimos 12 meses -->
    <div class="revenue-chart-section">
      <revenue-chart
        :revenue-data="revenueData"
        :historical-data="historicalRevenueData"
        :change-percent="revenueChangePercent"
        :change-amount="revenueChangeAmount"
        :auto-generate-historical="true"
        :default-show-comparison="showRevenueComparison"
        @comparison-changed="showRevenueComparison = $event"
        class="dashboard-item revenue-chart"
      />
    </div>
  </div>
</template>

<script>
/**
 * Componente principal del Dashboard
 * 
 * Muestra un resumen de las métricas principales del negocio,
 * comenzando con las ventas del día.
 * 
 * @component AppDashboard
 */
import SalesCard from './SalesCard.vue';
import RevenueChart from './RevenueChart.vue';
// Importar los servicios
import { getDailySales, getWeeklySales, getMonthlySales } from '../../services/dashboardService';
import revenueService from '../../services/revenueService';

export default {
  name: 'AppDashboard',
  
  components: {
    SalesCard,
    RevenueChart
  },
  
  data() {
    return {
      // Inicializar con valores vacíos que se llenarán al cargar
      dailySales: {
        amount: 0,
        count: 0,
        average: 0,
        change: 0,
        changeAmount: 0
      },
      // Datos de ventas semanales
      weeklySales: {
        amount: 0,
        count: 0,
        average: 0,
        change: 0,
        changeAmount: 0
      },
      // Datos de ventas mensuales
      monthlySales: {
        amount: 0,
        count: 0,
        average: 0,
        change: 0,
        changeAmount: 0
      },
      // Datos para el gráfico de ingresos
      revenueData: [],
      historicalRevenueData: [],
      revenueChangePercent: 0,
      revenueChangeAmount: 0,
      isLoadingRevenue: false,
      showRevenueComparison: false,
      isLoading: true,
      error: null
    };
  },
  
  methods: {
    /**
     * Carga los datos del dashboard desde el servicio
     */
    async loadDashboardData() {
      try {
        this.isLoading = true;
        this.error = null;
        
        // Cargar múltiples conjuntos de datos en paralelo
        const [dailyData, weeklyData, monthlyData] = await Promise.all([
          getDailySales(),
          getWeeklySales(),
          getMonthlySales()
        ]);
        
        // Mapear los datos al formato esperado por los componentes
        this.dailySales = {
          amount: dailyData.total,
          count: dailyData.count,
          average: dailyData.average,
          change: dailyData.change,
          changeAmount: dailyData.changeAmount
        };
        
        this.weeklySales = {
          amount: weeklyData.total,
          count: weeklyData.count,
          average: weeklyData.average,
          change: weeklyData.change,
          changeAmount: weeklyData.changeAmount
        };
        
        this.monthlySales = {
          amount: monthlyData.total,
          count: monthlyData.count,
          average: monthlyData.average,
          change: monthlyData.change,
          changeAmount: monthlyData.changeAmount
        };
        
        this.isLoading = false;
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        this.error = 'No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.';
        this.isLoading = false;
      }
    },

    async loadRevenueData() {
      this.isLoadingRevenue = true;
      try {
        const { current, historical, changePercent, changeAmount } = await revenueService.getRevenueData({
          includeHistorical: true
        });
        
        this.revenueData = current;
        this.historicalRevenueData = historical;
        this.revenueChangePercent = changePercent;
        this.revenueChangeAmount = changeAmount;
      } catch (error) {
        console.error('Error al cargar los datos de ingresos:', error);
      } finally {
        this.isLoadingRevenue = false;
      }
    }
  },
  
  mounted() {
    // Cargar datos al montar el componente
    this.loadDashboardData();
    this.loadRevenueData();
  }
};
</script>

<style scoped>
/* Estilos del dashboard */
.dashboard-container {
  width: 100%;
  padding: 5px 0;
}

/* Estilos del encabezado */
.dashboard-header {
  margin-bottom: 5px;
}

/* Contenedor de tarjetas */
.sales-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  /* Añadir perspectiva para mejorar el efecto 3D */
  perspective: 1000px;
}

/* Sección de gráfico de ingresos */
.revenue-chart-section {
  margin-bottom: 30px;
}

/* Estado de carga */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(125, 130, 152, 0.2);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Mensaje de error */
.error-message {
  display: flex;
  align-items: center;
  padding: 16px;
  background-color: rgba(209, 67, 67, 0.1);
  color: var(--error);
  border-radius: 8px;
  margin-bottom: 24px;
}

.error-message svg {
  width: 24px;
  height: 24px;
  margin-right: 12px;
}

/* Ajustes responsive */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 3px 0;
  }
  
  .sales-cards {
    grid-template-columns: 1fr;
    gap: 18px;
    /* Mantener la perspectiva en móviles */
    perspective: 800px;
  }
  
  .loading-spinner {
    width: 32px;
    height: 32px;
  }
}
</style> 