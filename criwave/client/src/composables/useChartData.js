import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import dashboardService from '../services/dashboardService';

/**
 * Composable para cargar y gestionar datos de gráficos
 * Incluye soporte para carga bajo demanda (cuando el elemento es visible)
 * 
 * @param {String} dataType - Tipo de datos a cargar ('ventasDiarias', 'ventasSemanales', etc.)
 * @param {Object} options - Opciones adicionales
 * @returns {Object} - Datos y funciones para usar en el componente
 */
export function useChartData(dataType, options = {}) {
  const {
    loadOnVisible = true,
    autoRefresh = false,
    refreshInterval = 60000, // 1 minuto por defecto
  } = options;
  
  const chartData = ref(null);
  const isLoading = ref(true);
  const isVisible = ref(!loadOnVisible); // Si no cargamos al ser visible, asumimos que ya es visible
  const error = ref(null);
  
  // Referencias para IntersectionObserver
  let observer = null;
  let intervalId = null;
  
  /**
   * Cargar datos según el tipo especificado
   */
  const loadData = async () => {
    // Solo cargar si el componente es visible o no usamos carga bajo demanda
    if (!isVisible.value && loadOnVisible) return;
    
    isLoading.value = true;
    error.value = null;
    
    try {
      // Obtener datos del dashboard
      const dashboardData = await dashboardService.getDashboardData();
      
      // Extraer la sección de datos correcta según el tipo
      switch (dataType) {
        case 'ventasDiarias':
          chartData.value = dashboardData.ventas?.diarias || [];
          break;
        case 'ventasSemanales':
          chartData.value = dashboardData.ventas?.semanales || [];
          break;
        case 'ventasMensuales':
          chartData.value = dashboardData.ventas?.mensuales || [];
          break;
        default:
          // Si el tipo no coincide, intentar extraer directamente
          chartData.value = dashboardData[dataType] || null;
      }
      
    } catch (err) {
      console.error(`Error cargando datos para ${dataType}:`, err);
      error.value = err.message || 'Error al cargar datos';
    } finally {
      isLoading.value = false;
    }
  };
  
  /**
   * Establecer el observador de intersección
   */
  const setupObserver = (el) => {
    if (!el || !loadOnVisible) return;
    
    // Crear nuevo observador
    observer = new IntersectionObserver((entries) => {
      const isIntersecting = entries[0].isIntersecting;
      
      if (isIntersecting && !isVisible.value) {
        isVisible.value = true;
        // Cargar datos cuando sea visible
        nextTick(loadData);
        
        // Detener observación si no necesitamos recargar
        if (!autoRefresh) {
          observer.disconnect();
          observer = null;
        }
      }
    }, {
      threshold: 0.1 // 10% visible para activar
    });
    
    // Empezar a observar
    observer.observe(el);
  };
  
  /**
   * Configurar intervalo de actualización
   */
  const setupRefreshInterval = () => {
    if (!autoRefresh || !refreshInterval) return;
    
    intervalId = setInterval(() => {
      if (isVisible.value) {
        loadData();
      }
    }, refreshInterval);
  };
  
  /**
   * Limpiar recursos al desmontar el componente
   */
  const cleanup = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  
  // Configurar todo al montar el componente
  onMounted(() => {
    // Si no usamos carga bajo demanda, cargar inmediatamente
    if (!loadOnVisible) {
      loadData();
    }
    
    // Configurar intervalo de actualización si es necesario
    if (autoRefresh) {
      setupRefreshInterval();
    }
  });
  
  // Limpiar recursos al desmontar
  onUnmounted(cleanup);
  
  return {
    chartData,
    isLoading,
    isVisible,
    error,
    loadData,
    setupObserver,
    refresh: () => loadData() // Alias para recarga manual
  };
} 