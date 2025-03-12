/**
 * Datos de ejemplo para el dashboard
 * 
 * Este archivo contiene datos ficticios para mostrar en el dashboard.
 * Cuando se implemente la conexión a la API real, este archivo puede ser
 * eliminado o reemplazado fácilmente.
 */

// Datos de ventas del día
export const dailySalesData = {
  total: 12850.75,
  count: 45,
  average: 285.57,
  change: 8.5, // porcentaje de cambio respecto al día anterior
  changeAmount: 1005.25 // cantidad monetaria de cambio respecto al día anterior
};

// Datos de ventas semanales
export const weeklySalesData = {
  total: 87325.50,
  count: 312,
  average: 279.89,
  change: 4.2,
  changeAmount: 3520.75 // cantidad monetaria de cambio respecto a la semana anterior
};

// Datos de ventas mensuales
export const monthlySalesData = {
  total: 345680.25,
  count: 1245,
  average: 277.65,
  change: 6.8,
  changeAmount: 22050.50 // cantidad monetaria de cambio respecto al mes anterior
};

// Datos de productos más vendidos
export const topProductsData = [
  { id: 1, name: 'Producto A', sales: 125, revenue: 4875.50 },
  { id: 2, name: 'Producto B', sales: 98, revenue: 3920.00 },
  { id: 3, name: 'Producto C', sales: 87, revenue: 2610.00 },
  { id: 4, name: 'Producto D', sales: 65, revenue: 1950.00 },
  { id: 5, name: 'Producto E', sales: 54, revenue: 1620.00 }
];

// Datos de clientes principales
export const topCustomersData = [
  { id: 1, name: 'Cliente A', purchases: 12, total: 4250.75 },
  { id: 2, name: 'Cliente B', purchases: 8, total: 3680.25 },
  { id: 3, name: 'Cliente C', purchases: 7, total: 2950.50 },
  { id: 4, name: 'Cliente D', purchases: 6, total: 2340.00 },
  { id: 5, name: 'Cliente E', purchases: 5, total: 1875.25 }
];

// Datos para gráficos de ventas por hora
export const salesByHourData = [
  { hour: '08:00', sales: 3, amount: 850.25 },
  { hour: '09:00', sales: 5, amount: 1250.50 },
  { hour: '10:00', sales: 8, amount: 2150.75 },
  { hour: '11:00', sales: 10, amount: 2750.00 },
  { hour: '12:00', sales: 12, amount: 3250.25 },
  { hour: '13:00', sales: 8, amount: 2350.50 },
  { hour: '14:00', sales: 6, amount: 1850.75 },
  { hour: '15:00', sales: 7, amount: 2050.00 },
  { hour: '16:00', sales: 9, amount: 2450.25 },
  { hour: '17:00', sales: 11, amount: 2950.50 },
  { hour: '18:00', sales: 7, amount: 1950.75 },
  { hour: '19:00', sales: 4, amount: 1250.00 },
  { hour: '20:00', sales: 2, amount: 750.25 }
];

// Datos para gráficos de ventas por día de la semana
export const salesByDayData = [
  { day: 'Lunes', sales: 38, amount: 10250.75 },
  { day: 'Martes', sales: 42, amount: 11350.50 },
  { day: 'Miércoles', sales: 45, amount: 12150.25 },
  { day: 'Jueves', sales: 48, amount: 13250.00 },
  { day: 'Viernes', sales: 52, amount: 14350.75 },
  { day: 'Sábado', sales: 65, amount: 17250.50 },
  { day: 'Domingo', sales: 22, amount: 8750.25 }
];

// Datos para gráficos de ventas por mes
export const salesByMonthData = [
  { month: 'Enero', sales: 845, amount: 235250.75 },
  { month: 'Febrero', sales: 782, amount: 215350.50 },
  { month: 'Marzo', sales: 825, amount: 228150.25 },
  { month: 'Abril', sales: 867, amount: 243250.00 },
  { month: 'Mayo', sales: 923, amount: 254350.75 },
  { month: 'Junio', sales: 945, amount: 267250.50 },
  { month: 'Julio', sales: 978, amount: 278750.25 },
  { month: 'Agosto', sales: 1023, amount: 292150.75 },
  { month: 'Septiembre', sales: 987, amount: 283350.50 },
  { month: 'Octubre', sales: 1045, amount: 298150.25 },
  { month: 'Noviembre', sales: 1123, amount: 313250.00 },
  { month: 'Diciembre', sales: 1245, amount: 345680.25 }
]; 