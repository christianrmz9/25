<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="welcome-title">Bienvenido al Dashboard</h1>
      <p class="welcome-subtitle">Resumen de ventas y métricas clave</p>
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
// Importar el servicio de dashboard en lugar de los datos directamente
import { getDailySales, getWeeklySales, getMonthlySales } from '../../services/dashboardService';

export default {
  name: 'AppDashboard',
  
  components: {
    SalesCard
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
      isLoading: true,
      error: null
    };
  },
  
  computed: {
    /**
     * Genera un mensaje de bienvenida personalizado según la hora del día
     */
    welcomeMessage() {
      const hour = new Date().getHours();
      let greeting = '';
      
      if (hour < 12) {
        greeting = 'Buenos días';
      } else if (hour < 18) {
        greeting = 'Buenas tardes';
      } else {
        greeting = 'Buenas noches';
      }
      
      // Aquí se podría añadir el nombre del usuario cuando haya sistema de autenticación
      return `${greeting}, Usuario`;
    }
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
        
        // Aquí se pueden cargar más datos según sea necesario
        
        this.isLoading = false;
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        this.error = 'No se pudieron cargar los datos. Por favor, intenta de nuevo más tarde.';
        this.isLoading = false;
      }
    }
  },
  
  mounted() {
    // Cargar datos al montar el componente
    this.loadDashboardData();
  }
};
</script>

<style scoped>
/* Estilos del dashboard */
.dashboard-container {
  width: 100%;
  padding: 10px 0;
}

/* Estilos del encabezado */
.dashboard-header {
  margin-bottom: 24px;
}

.welcome-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  /* Añadir efecto de texto 3D sutil */
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  opacity: 0.95; /* Alta importancia pero no distrae de los datos */
}

.welcome-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.75; /* Menos prominente que el título */
}

/* Contenedor de tarjetas */
.sales-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
  /* Añadir perspectiva para mejorar el efecto 3D */
  perspective: 1000px;
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
    padding: 5px 0;
  }
  
  .welcome-title {
    font-size: 1.5rem;
  }
  
  .welcome-subtitle {
    font-size: 0.9rem;
  }
  
  .sales-cards {
    grid-template-columns: 1fr;
    gap: 24px;
    /* Mantener la perspectiva en móviles */
    perspective: 800px;
  }
  
  .loading-spinner {
    width: 32px;
    height: 32px;
  }
}
</style> 