/**
 * Servicio para gestionar los datos de ingresos
 * Proporciona funciones para obtener los datos actuales y históricos
 */
import { ref, computed } from 'vue';

// Meses en español
const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Cache para los datos
const revenueCache = ref({
  currentYear: new Date().getFullYear(),
  data: {},
  loading: false,
  error: null
});

/**
 * Obtener los últimos 12 meses a partir de una fecha dada
 * @param {Date} date - Fecha de referencia 
 * @returns {Array} - Array con los nombres de los últimos 12 meses
 */
function getLast12Months(date = new Date()) {
  const result = [];
  let currentDate = new Date(date);
  
  // Ajustar a final del mes
  currentDate.setDate(1);
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 12; i++) {
    const monthIndex = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    result.unshift({
      month: months[monthIndex],
      monthIndex,
      year
    });
    
    // Retroceder un mes
    currentDate.setMonth(currentDate.getMonth() - 1);
  }
  
  return result;
}

/**
 * Genera datos de ingresos simulados
 * @param {Array} monthsData - Array con datos de los meses
 * @param {Object} options - Opciones para la generación
 * @returns {Array} - Array con los datos de ingresos
 */
function generateRevenueData(monthsData, options = {}) {
  const { baseAmount = 1000000, variance = 0.5, growth = 0.1, seed = 123 } = options;
  
  // Función para obtener un número aleatorio "determinista" basado en una semilla
  // para que siempre devuelva los mismos valores para los mismos parámetros
  const seededRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  let prevAmount = baseAmount;
  return monthsData.map((monthData, index) => {
    // Hacer que los ingresos crezcan mes a mes con cierta varianza
    const growthFactor = 1 + growth * (index / 12);
    const randomFactor = 1 + (seededRandom(seed + index) * variance * 2 - variance);
    const amount = Math.floor(prevAmount * growthFactor * randomFactor);
    
    prevAmount = amount;
    
    return {
      ...monthData,
      revenue: amount
    };
  });
}

/**
 * Obtiene los datos de ingresos para los últimos 12 meses
 * @param {Object} options - Opciones para la petición
 * @returns {Promise} - Promise con los datos
 */
async function getRevenueData(options = {}) {
  const { forceRefresh = false, includeHistorical = false } = options;
  
  // Si ya tenemos los datos en caché y no se fuerza la actualización, devolverlos
  if (!forceRefresh && revenueCache.value.data.current) {
    if (includeHistorical && !revenueCache.value.data.historical) {
      await getHistoricalRevenueData();
    }
    return Promise.resolve({
      current: revenueCache.value.data.current,
      historical: includeHistorical ? revenueCache.value.data.historical : [],
      changePercent: revenueCache.value.data.changePercent,
      changeAmount: revenueCache.value.data.changeAmount
    });
  }
  
  // Marcar como cargando
  revenueCache.value.loading = true;
  revenueCache.value.error = null;
  
  try {
    // Simular petición a API con un timeout
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Obtener los últimos 12 meses
    const months = getLast12Months();
    
    // Generar datos simulados
    const currentYearData = generateRevenueData(months, {
      baseAmount: 1000000,
      variance: 0.4,
      growth: 0.12,
      seed: revenueCache.value.currentYear
    });
    
    // Guardar en caché
    revenueCache.value.data.current = currentYearData;
    
    // Si se piden datos históricos, obtenerlos
    if (includeHistorical) {
      await getHistoricalRevenueData();
    }
    
    // Calcular cambios
    calculateYearOverYearChanges();
    
    // Marcar como no cargando
    revenueCache.value.loading = false;
    
    return {
      current: revenueCache.value.data.current,
      historical: includeHistorical ? revenueCache.value.data.historical : [],
      changePercent: revenueCache.value.data.changePercent,
      changeAmount: revenueCache.value.data.changeAmount
    };
  } catch (error) {
    revenueCache.value.error = error.message || 'Error al obtener los datos de ingresos';
    revenueCache.value.loading = false;
    throw error;
  }
}

/**
 * Obtiene los datos históricos para comparación
 * @returns {Promise} - Promise con los datos
 */
async function getHistoricalRevenueData() {
  if (revenueCache.value.data.historical) {
    return Promise.resolve(revenueCache.value.data.historical);
  }
  
  // Simular petición a API con un timeout
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Obtener los meses del año anterior
  const prevYear = revenueCache.value.currentYear - 1;
  const lastDayOfPrevYear = new Date(prevYear, 11, 31);
  const prevYearMonths = getLast12Months(lastDayOfPrevYear);
  
  // Generar datos simulados para el año anterior (valores más bajos)
  const historicalData = generateRevenueData(prevYearMonths, {
    baseAmount: 800000,
    variance: 0.3,
    growth: 0.08,
    seed: prevYear
  });
  
  // Guardar en caché
  revenueCache.value.data.historical = historicalData;
  
  return historicalData;
}

/**
 * Calcula los cambios año a año
 */
function calculateYearOverYearChanges() {
  if (!revenueCache.value.data.current || !revenueCache.value.data.historical) {
    return;
  }
  
  const currentTotal = revenueCache.value.data.current.reduce((total, item) => total + item.revenue, 0);
  const historicalTotal = revenueCache.value.data.historical.reduce((total, item) => total + item.revenue, 0);
  
  const changeAmount = currentTotal - historicalTotal;
  const changePercent = (changeAmount / historicalTotal) * 100;
  
  revenueCache.value.data.changeAmount = changeAmount;
  revenueCache.value.data.changePercent = changePercent;
}

export default {
  getRevenueData,
  getHistoricalRevenueData,
  
  // Propiedades reactivas
  isLoading: computed(() => revenueCache.value.loading),
  error: computed(() => revenueCache.value.error)
}; 