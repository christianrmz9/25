/**
 * Servicio para obtener datos del dashboard
 * 
 * Este servicio actúa como una capa de abstracción entre los componentes
 * y la fuente de datos. Actualmente utiliza datos de ejemplo, pero está
 * diseñado para facilitar la transición a una API real en el futuro.
 */

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