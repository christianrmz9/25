<template>
  <div class="dashboard-view">
    <h1 class="dashboard-title">Dashboard</h1>
    
    <!-- KPIs / Métricas principales -->
    <section class="dashboard-kpis">
      <div class="kpi-cards">
        <div v-for="(kpi, index) in kpis" :key="index" class="kpi-card">
          <div class="kpi-value" :class="{ 'is-loading': !kpiData }">
            <div v-if="kpiData" class="value">
              {{ formatKpiValue(kpi.id, kpiData[kpi.id]) }}
            </div>
            <div v-else class="skeleton-value"></div>
          </div>
          <div class="kpi-label">{{ kpi.label }}</div>
        </div>
      </div>
    </section>
    
    <!-- Gráficos principales -->
    <section class="dashboard-charts">
      <div class="charts-grid">
        <!-- Gráfico de ventas diarias (prioridad alta, cargar inmediatamente) -->
        <sales-chart 
          title="Ventas diarias" 
          data-type="ventasDiarias"
          :load-on-visible="false"
        />
        
        <!-- Gráfico de ventas semanales (prioridad media, cargar cuando sea visible) -->
        <sales-chart 
          title="Ventas semanales" 
          data-type="ventasSemanales"
        />
        
        <!-- Gráfico de ventas mensuales (prioridad media, cargar cuando sea visible) -->
        <sales-chart 
          title="Ventas mensuales" 
          data-type="ventasMensuales"
        />
      </div>
    </section>
    
    <!-- Sección productos más vendidos (carga diferida) -->
    <section class="dashboard-top-products">
      <h2 class="section-title">Productos más vendidos</h2>
      <div class="products-table-container" ref="productsTableRef">
        <div v-if="!isProductsVisible || isProductsLoading" class="products-skeleton">
          <div class="skeleton-row header"></div>
          <div v-for="i in 5" :key="i" class="skeleton-row"></div>
        </div>
        
        <table v-else-if="topProducts && topProducts.length" class="products-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>Unidades</th>
              <th>Ingresos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(product, index) in topProducts" :key="product.id">
              <td>{{ index + 1 }}</td>
              <td>{{ product.nombre }}</td>
              <td>{{ product.ventas }}</td>
              <td>{{ formatCurrency(product.ingresos) }}</td>
            </tr>
          </tbody>
        </table>
        
        <div v-else class="no-data-message">
          No hay datos de productos disponibles
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import SalesChart from '../components/dashboard/SalesChart.vue';
import dashboardService from '../services/dashboardService';

export default {
  name: 'DashboardView',
  
  components: {
    SalesChart
  },
  
  setup() {
    // Estado para KPIs
    const kpiData = ref(null);
    
    // Estado para productos
    const topProducts = ref(null);
    const isProductsLoading = ref(true);
    const isProductsVisible = ref(false);
    const productsTableRef = ref(null);
    
    // Observer para productos
    let productsObserver = null;
    
    // Definición de KPIs
    const kpis = [
      { id: 'ventasHoy', label: 'Ventas de hoy', format: 'currency' },
      { id: 'ventasSemana', label: 'Ventas de la semana', format: 'currency' },
      { id: 'ventasMes', label: 'Ventas del mes', format: 'currency' },
      { id: 'clientesNuevos', label: 'Clientes nuevos', format: 'number' },
      { id: 'pedidosPendientes', label: 'Pedidos pendientes', format: 'number' },
      { id: 'satisfaccionCliente', label: 'Satisfacción', format: 'percent' }
    ];
    
    /**
     * Cargar datos KPI
     */
    const loadKpiData = async () => {
      try {
        const dashboardData = await dashboardService.getDashboardData();
        kpiData.value = dashboardData.kpis;
      } catch (error) {
        console.error('Error cargando KPIs:', error);
      }
    };
    
    /**
     * Cargar datos de productos más vendidos
     */
    const loadTopProducts = async () => {
      if (!isProductsVisible.value) return;
      
      isProductsLoading.value = true;
      
      try {
        const dashboardData = await dashboardService.getDashboardData();
        topProducts.value = dashboardData.productos?.masVendidos || [];
      } catch (error) {
        console.error('Error cargando productos más vendidos:', error);
      } finally {
        isProductsLoading.value = false;
      }
    };
    
    /**
     * Configurar observer para productos
     */
    const setupProductsObserver = () => {
      if (!productsTableRef.value) return;
      
      productsObserver = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !isProductsVisible.value) {
          isProductsVisible.value = true;
          loadTopProducts();
          productsObserver.disconnect();
        }
      }, { threshold: 0.1 });
      
      productsObserver.observe(productsTableRef.value);
    };
    
    /**
     * Formatear valor de KPI según su tipo
     */
    const formatKpiValue = (id, value) => {
      if (value === undefined || value === null) return '-';
      
      const kpi = kpis.find(k => k.id === id);
      if (!kpi) return value;
      
      switch (kpi.format) {
        case 'currency':
          return formatCurrency(value);
        case 'percent':
          return `${value}%`;
        case 'number':
        default:
          return value.toLocaleString();
      }
    };
    
    /**
     * Formatear valor como moneda
     */
    const formatCurrency = (value) => {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    };
    
    // Configurar al montar el componente
    onMounted(() => {
      // Cargar KPIs inmediatamente (datos críticos)
      loadKpiData();
      
      // Configurar observación para productos (carga diferida)
      setupProductsObserver();
    });
    
    // Limpiar recursos al desmontar
    onUnmounted(() => {
      if (productsObserver) {
        productsObserver.disconnect();
      }
    });
    
    return {
      kpis,
      kpiData,
      topProducts,
      isProductsLoading,
      isProductsVisible,
      productsTableRef,
      formatKpiValue,
      formatCurrency
    };
  }
};
</script>

<style scoped>
.dashboard-view {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-title {
  margin-bottom: 24px;
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
}

/* KPIs */
.dashboard-kpis {
  margin-bottom: 32px;
}

.kpi-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.kpi-card {
  background-color: var(--bg-primary);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  text-align: center;
}

.kpi-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.kpi-label {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.skeleton-value {
  height: 36px;
  width: 80%;
  margin: 0 auto 8px;
  background-color: var(--skeleton-color, rgba(0, 0, 0, 0.1));
  border-radius: 4px;
  animation: pulse 1.5s ease-in-out infinite;
}

/* Gráficos */
.dashboard-charts {
  margin-bottom: 32px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

/* Productos más vendidos */
.dashboard-top-products {
  margin-bottom: 32px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--text-primary);
}

.products-table-container {
  background-color: var(--bg-primary);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow-x: auto;
}

.products-table {
  width: 100%;
  border-collapse: collapse;
}

.products-table th {
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid var(--border);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
}

.products-table td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
}

.products-skeleton {
  width: 100%;
}

.skeleton-row {
  height: 50px;
  background-color: var(--skeleton-color, rgba(0, 0, 0, 0.1));
  border-radius: 4px;
  margin-bottom: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-row.header {
  height: 40px;
  width: 100%;
}

.no-data-message {
  padding: 32px;
  text-align: center;
  color: var(--text-secondary);
  font-style: italic;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .kpi-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .kpi-cards {
    grid-template-columns: 1fr;
  }
}
</style> 