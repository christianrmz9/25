/**
 * Servicio para obtener datos del dashboard
 * 
 * Este servicio actúa como una capa de abstracción entre los componentes
 * y la fuente de datos. Actualmente utiliza datos de ejemplo, pero está
 * diseñado para facilitar la transición a una API real en el futuro.
 */

import apiService from './apiService';
import mockApi from './mockApi';

// Determinar si estamos en modo desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';

// Estado para almacenar datos en caché
const cache = {
  dashboardData: null,
  lastFetched: null,
  cacheTime: 5 * 60 * 1000 // 5 minutos (en milisegundos)
};

/**
 * Servicio para obtener y gestionar datos del dashboard
 */
export default {
  /**
   * Obtener todos los datos del dashboard en una sola llamada
   * Implementa caché para evitar llamadas innecesarias
   */
  async getDashboardData() {
    // Usar caché si los datos son recientes
    if (cache.dashboardData && 
        cache.lastFetched && 
        (Date.now() - cache.lastFetched) < cache.cacheTime) {
      console.log('Usando datos en caché del dashboard');
      return Promise.resolve(cache.dashboardData);
    }
    
    try {
      let response;
      
      // Usar API mock en desarrollo
      if (isDevelopment) {
        console.log('Usando API mock para datos del dashboard');
        response = await mockApi.getDashboardOverview();
      } else {
        // Usar API real en producción
        response = await apiService.get('/dashboard/overview');
      }
      
      // Guardar en caché
      cache.dashboardData = response.data;
      cache.lastFetched = Date.now();
      
      return response.data;
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
      throw error;
    }
  },

  /**
   * Forzar recarga de datos (ignorar caché)
   */
  async refreshDashboardData() {
    try {
      let response;
      
      // Usar API mock en desarrollo
      if (isDevelopment) {
        response = await mockApi.getDashboardOverview();
      } else {
        // Usar API real en producción
        response = await apiService.get('/dashboard/overview');
      }
      
      // Actualizar caché
      cache.dashboardData = response.data;
      cache.lastFetched = Date.now();
      
      return response.data;
    } catch (error) {
      console.error('Error actualizando datos del dashboard:', error);
      throw error;
    }
  },

  /**
   * Obtener una sección específica de datos
   * @param {string} section - Nombre de la sección (ej: 'ventas', 'usuarios')
   */
  async getSectionData(section) {
    try {
      // Intentar obtener del caché primero
      const allData = await this.getDashboardData();
      return allData[section] || null;
    } catch (error) {
      console.error(`Error obteniendo datos de la sección ${section}:`, error);
      throw error;
    }
  }
};

// Importar datos de ejemplo
import {
  dailySalesData,
  weeklySalesData,
  monthlySalesData,
  topProductsData,
  topCustomersData,
  salesByHourData,
  salesByDayData,
  salesByMonthData
} from '../data/mockData';

// Configuración del servicio
const API_BASE_URL = '/api'; // URL base para la API real (cuando se implemente)
const USE_MOCK_DATA = true; // Cambiar a false cuando se conecte a la API real

/**
 * Obtiene las ventas del día actual
 * @returns {Promise<Object>} Datos de ventas diarias
 */
export async function getDailySales() {
  if (USE_MOCK_DATA) {
    // Simular un retraso de red para imitar una API real
    await new Promise(resolve => setTimeout(resolve, 300));
    return dailySalesData;
  } else {
    // Código para obtener datos de la API real
    const response = await fetch(`${API_BASE_URL}/sales/daily`);
    if (!response.ok) {
      throw new Error('Error al obtener datos de ventas diarias');
    }
    return await response.json();
  }
}

/**
 * Obtiene las ventas de la semana actual
 * @returns {Promise<Object>} Datos de ventas semanales
 */
export async function getWeeklySales() {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return weeklySalesData;
  } else {
    const response = await fetch(`${API_BASE_URL}/sales/weekly`);
    if (!response.ok) {
      throw new Error('Error al obtener datos de ventas semanales');
    }
    return await response.json();
  }
}

/**
 * Obtiene las ventas del mes actual
 * @returns {Promise<Object>} Datos de ventas mensuales
 */
export async function getMonthlySales() {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return monthlySalesData;
  } else {
    const response = await fetch(`${API_BASE_URL}/sales/monthly`);
    if (!response.ok) {
      throw new Error('Error al obtener datos de ventas mensuales');
    }
    return await response.json();
  }
}

/**
 * Obtiene los productos más vendidos
 * @param {number} limit - Número máximo de productos a obtener
 * @returns {Promise<Array>} Lista de productos más vendidos
 */
export async function getTopProducts(limit = 5) {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return topProductsData.slice(0, limit);
  } else {
    const response = await fetch(`${API_BASE_URL}/products/top?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Error al obtener datos de productos más vendidos');
    }
    return await response.json();
  }
}

/**
 * Obtiene los clientes principales
 * @param {number} limit - Número máximo de clientes a obtener
 * @returns {Promise<Array>} Lista de clientes principales
 */
export async function getTopCustomers(limit = 5) {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return topCustomersData.slice(0, limit);
  } else {
    const response = await fetch(`${API_BASE_URL}/customers/top?limit=${limit}`);
    if (!response.ok) {
      throw new Error('Error al obtener datos de clientes principales');
    }
    return await response.json();
  }
}

/**
 * Obtiene las ventas por hora para el día actual
 * @returns {Promise<Array>} Datos de ventas por hora
 */
export async function getSalesByHour() {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return salesByHourData;
  } else {
    const response = await fetch(`${API_BASE_URL}/sales/by-hour`);
    if (!response.ok) {
      throw new Error('Error al obtener datos de ventas por hora');
    }
    return await response.json();
  }
}

/**
 * Obtiene las ventas por día para la semana actual
 * @returns {Promise<Array>} Datos de ventas por día
 */
export async function getSalesByDay() {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return salesByDayData;
  } else {
    const response = await fetch(`${API_BASE_URL}/sales/by-day`);
    if (!response.ok) {
      throw new Error('Error al obtener datos de ventas por día');
    }
    return await response.json();
  }
}

/**
 * Obtiene las ventas por mes para el año actual
 * @returns {Promise<Array>} Datos de ventas por mes
 */
export async function getSalesByMonth() {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return salesByMonthData;
  } else {
    const response = await fetch(`${API_BASE_URL}/sales/by-month`);
    if (!response.ok) {
      throw new Error('Error al obtener datos de ventas por mes');
    }
    return await response.json();
  }
} 