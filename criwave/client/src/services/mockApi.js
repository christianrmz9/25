/**
 * Módulo para simular respuestas de API durante el desarrollo
 * Esto permite trabajar sin depender de un backend real
 */

// Generar datos aleatorios para gráficos
function generateRandomData(count, min, max, isIncremental = false) {
  const data = [];
  let lastValue = Math.floor(Math.random() * (max - min)) + min;
  
  for (let i = 0; i < count; i++) {
    if (isIncremental) {
      // Variación del 5-15% arriba o abajo
      const variation = lastValue * (0.05 + Math.random() * 0.1) * (Math.random() > 0.5 ? 1 : -1);
      lastValue = Math.max(min, Math.min(max, lastValue + variation));
      data.push(Math.floor(lastValue));
    } else {
      data.push(Math.floor(Math.random() * (max - min)) + min);
    }
  }
  
  return data;
}

// Generar etiquetas de días para gráficos
function generateDayLabels(count) {
  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = new Date();
  const labels = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    labels.push(days[date.getDay()]);
  }
  
  return labels;
}

// Generar etiquetas de semanas para gráficos
function generateWeekLabels(count) {
  const today = new Date();
  const labels = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - (i * 7));
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    
    labels.push(`${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`);
  }
  
  return labels;
}

// Generar etiquetas de meses para gráficos
function generateMonthLabels(count) {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  const today = new Date();
  const currentMonth = today.getMonth();
  const labels = [];
  
  for (let i = count - 1; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12; // Asegurar que sea siempre positivo
    labels.push(months[monthIndex]);
  }
  
  return labels;
}

// Generar datos completos del dashboard
function generateDashboardData() {
  // Generar valores actuales
  const ventasDiariasValues = generateRandomData(7, 8000, 15000);
  const ventasSemanalesValues = generateRandomData(4, 50000, 80000, true);
  const ventasMensualesValues = generateRandomData(6, 200000, 350000, true);
  
  // Ventas diarias (últimos 7 días)
  const ventasDiarias = {
    labels: generateDayLabels(7),
    values: ventasDiariasValues
  };
  
  // Ventas semanales (últimas 4 semanas)
  const ventasSemanales = {
    labels: generateWeekLabels(4),
    values: ventasSemanalesValues
  };
  
  // Ventas mensuales (últimos 6 meses)
  const ventasMensuales = {
    labels: generateMonthLabels(6),
    values: ventasMensualesValues
  };
  
  // KPIs principales
  const kpis = {
    ventasHoy: ventasDiarias.values[ventasDiarias.values.length - 1],
    ventasSemana: ventasSemanales.values[ventasSemanales.values.length - 1],
    ventasMes: ventasMensuales.values[ventasMensuales.values.length - 1],
    clientesNuevos: Math.floor(Math.random() * 50) + 10,
    pedidosPendientes: Math.floor(Math.random() * 30) + 5,
    satisfaccionCliente: Math.floor(Math.random() * 20) + 80 // 80-100%
  };
  
  // Datos completos
  return {
    ventas: {
      diarias: ventasDiarias,
      semanales: ventasSemanales,
      mensuales: ventasMensuales
    },
    kpis: kpis,
    // Añadir más secciones según necesidad
    productos: {
      masVendidos: [
        { id: 1, nombre: 'Producto A', ventas: 245, ingresos: 24500 },
        { id: 2, nombre: 'Producto B', ventas: 186, ingresos: 18600 },
        { id: 3, nombre: 'Producto C', ventas: 157, ingresos: 15700 },
        { id: 4, nombre: 'Producto D', ventas: 124, ingresos: 12400 },
        { id: 5, nombre: 'Producto E', ventas: 98, ingresos: 9800 }
      ]
    },
    timestamp: new Date().toISOString()
  };
}

// Simular retraso de red
function mockDelay(min = 300, max = 1200) {
  const delay = Math.random() * (max - min) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
}

// API mock
export default {
  // Simula obtener todos los datos del dashboard
  async getDashboardOverview() {
    await mockDelay();
    return {
      data: generateDashboardData(),
      status: 200
    };
  },
  
  // Simula obtener una sección específica
  async getSection(section) {
    await mockDelay();
    const allData = generateDashboardData();
    return {
      data: allData[section] || {},
      status: allData[section] ? 200 : 404
    };
  }
}; 