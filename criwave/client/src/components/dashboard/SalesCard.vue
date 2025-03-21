<template>
  <div class="sales-card">
    <!-- Encabezado de la tarjeta -->
    <div class="card-header">
      <h2 class="card-title">{{ title }}</h2>
    </div>
    
    <!-- Contenido principal -->
    <div class="card-content">
      <!-- Monto total de ventas -->
      <div class="amount-container">
        <span class="amount-prefix">$</span>
        <span class="amount">{{ formattedAmount }}</span>
      </div>
      
      <!-- Indicador de cambio -->
      <div class="change-container">
        <div class="change-indicator" :class="changeClass">
          <div class="change-icon">
            <span v-if="change > 0">▲</span>
            <span v-else-if="change < 0">▼</span>
          </div>
          <div class="change-values">
            <span class="change-percentage">{{ formattedPercentage }}%</span>
            <span class="change-amount">${{ formattedChangeAmount }}</span>
          </div>
        </div>
        <!-- Etiqueta de período de comparación -->
        <div class="comparison-period">vs {{ comparisonPeriod }}</div>
      </div>
    </div>
    
    <!-- Métricas adicionales -->
    <div class="card-metrics">
      <div class="metric">
        <span class="metric-label">Ventas</span>
        <span class="metric-value">{{ formattedCount }}</span>
      </div>
      
      <div class="metric">
        <span class="metric-label">Promedio</span>
        <span class="metric-value">${{ formattedAverage }}</span>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * Componente de tarjeta para mostrar las ventas del día
 * 
 * Muestra el monto total de ventas, número de ventas,
 * ticket promedio y porcentaje de cambio respecto al período anterior.
 * 
 * @component SalesCard
 * @example
 * <sales-card 
 *   title="Ventas del día" 
 *   :amount="12850.75" 
 *   :count="45"
 *   :average="285.57"
 *   :change="8.5"
 *   :change-amount="1250.25"
 *   comparison-period="día anterior"
 *   icon="users"
 * />
 */

export default {
  name: 'SalesCard',
  
  props: {
    /**
     * Título de la tarjeta
     */
    title: {
      type: String,
      default: 'Ventas'
    },
    
    /**
     * Monto total de ventas
     */
    amount: {
      type: Number,
      required: true
    },
    
    /**
     * Número de ventas
     */
    count: {
      type: Number,
      default: 0
    },
    
    /**
     * Ticket promedio
     */
    average: {
      type: Number,
      default: 0
    },
    
    /**
     * Porcentaje de cambio respecto al período anterior
     * Positivo indica aumento, negativo indica disminución
     */
    change: {
      type: Number,
      default: 0
    },
    
    /**
     * Cantidad de cambio en valor monetario
     */
    changeAmount: {
      type: Number,
      default: 0
    },
    
    /**
     * Período de comparación (día anterior, semana anterior, etc.)
     */
    comparisonPeriod: {
      type: String,
      default: 'período anterior'
    },
    
    /**
     * Nombre del icono a mostrar
     * Opciones: 'users', 'email', 'percent', etc.
     */
    icon: {
      type: String,
      default: 'users'
    }
  },
  
  computed: {
    /**
     * Formatea el monto con comas para miles y puntos para decimales
     */
    formattedAmount() {
      if (this.amount === undefined || this.amount === null) {
        return '0.00';
      }
      
      // Formatear con comas para miles y puntos para decimales
      return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
      }).format(this.amount).replace(/\./g, 'X').replace(/,/g, '.').replace(/X/g, ',');
    },
    
    /**
     * Formatea el promedio con comas para miles y puntos para decimales
     */
    formattedAverage() {
      if (this.average === undefined || this.average === null) {
        return '0.00';
      }
      
      // Formatear con comas para miles y puntos para decimales
      return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
      }).format(this.average).replace(/\./g, 'X').replace(/,/g, '.').replace(/X/g, ',');
    },
    
    /**
     * Formatea el monto de cambio con comas para miles y puntos para decimales
     */
    formattedChangeAmount() {
      // Si no se proporciona changeAmount, calcularlo aproximadamente basado en el porcentaje
      if (this.changeAmount === undefined || this.changeAmount === null) {
        if (this.amount === undefined || this.amount === null || this.change === undefined || this.change === null) {
          return '0.00';
        }
        const amountToFormat = Math.abs(this.amount * this.change / 100);
        return new Intl.NumberFormat('es-ES', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: true
        }).format(amountToFormat).replace(/\./g, 'X').replace(/,/g, '.').replace(/X/g, ',');
      }
      
      const amountToFormat = Math.abs(this.changeAmount);
      return new Intl.NumberFormat('es-ES', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        useGrouping: true
      }).format(amountToFormat).replace(/\./g, 'X').replace(/,/g, '.').replace(/X/g, ',');
    },
    
    /**
     * Determina la clase CSS para el indicador de cambio
     */
    changeClass() {
      return {
        'positive': this.change > 0,
        'negative': this.change < 0,
        'neutral': this.change === 0
      };
    },
    
    /**
     * Formatea el porcentaje de cambio con punto como separador decimal
     */
    formattedPercentage() {
      if (this.change === undefined || this.change === null) {
        return '0.0';
      }
      
      // Formatear con un máximo de 1 decimal y punto como separador decimal
      return Math.abs(this.change).toFixed(1);
    },
    
    /**
     * Formatea el número de ventas con comas como separadores de miles
     */
    formattedCount() {
      if (this.count === undefined || this.count === null) {
        return '0';
      }
      
      // Si es un número pequeño (menos de 1000), devolverlo sin formatear
      if (this.count < 1000) {
        return this.count.toString();
      }
      
      // Para números grandes, usar separadores de miles
      return new Intl.NumberFormat('es-ES', {
        useGrouping: true
      }).format(this.count).replace(/\./g, ',');
    }
  }
};
</script>

<style scoped>
/* Estilos de la tarjeta con efecto 3D */
.sales-card {
  background-color: var(--bg-secondary);
  border-radius: 10px;
  padding: 14px;
  /* Efecto 3D con múltiples sombras */
  box-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.05),
    0 4px 8px rgba(0, 0, 0, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  /* Borde con gradiente para efecto 3D */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(0, 0, 0, 0.1);
  /* Efecto de profundidad con transform */
  transform: translateY(0);
  transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  /* Efecto de brillo en el borde superior */
  background-image: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0) 20%
  );
}

/* Efecto de elevación al pasar el mouse */
.sales-card:hover {
  transform: translateY(-5px);
  box-shadow: 
    0 5px 10px rgba(0, 0, 0, 0.1),
    0 10px 20px rgba(0, 0, 0, 0.1),
    0 20px 40px rgba(0, 0, 0, 0.05),
    inset 0 -2px 0 rgba(0, 0, 0, 0.1),
    inset 0 2px 0 rgba(255, 255, 255, 0.1);
}

/* Efecto de presión al hacer clic */
.sales-card:active {
  transform: translateY(-2px);
  box-shadow: 
    0 2px 5px rgba(0, 0, 0, 0.1),
    0 5px 10px rgba(0, 0, 0, 0.05),
    inset 0 -1px 0 rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.1s cubic-bezier(0.165, 0.84, 0.44, 1);
}

/* Añadir un pseudo-elemento para el efecto de brillo en el borde */
.sales-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.5) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

/* Añadir un pseudo-elemento para el efecto de sombra en el borde inferior */
.sales-card::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.2) 50%,
    rgba(0, 0, 0, 0) 100%
  );
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

/* Encabezado de la tarjeta */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  /* Efecto de texto 3D sutil */
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  opacity: 0.9; /* Ligeramente menos prominente que el monto */
}

/* Contenido principal */
.card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  margin-top: -2px;
  margin-bottom: -2px;
}

.amount-container {
  display: flex;
  align-items: baseline;
}

.amount-prefix {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin-right: 4px;
  /* Efecto de texto 3D sutil */
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  opacity: 0.85;
}

.amount {
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--text-primary);
  /* Efecto de texto 3D más pronunciado */
  text-shadow: 
    0 1px 1px rgba(0, 0, 0, 0.1),
    0 2px 2px rgba(0, 0, 0, 0.05);
  opacity: 1; /* El monto es el elemento más importante, máxima opacidad */
}

/* Contenedor para el indicador de cambio y el período de comparación */
.change-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 92px;
}

/* Indicador de cambio */
.change-indicator {
  display: flex;
  align-items: center;
  padding: 3px 6px;
  border-radius: 10px;
  font-weight: 600;
  /* Efecto 3D para el indicador */
  box-shadow: 
    inset 0 -1px 0 rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Contenedor del icono de flecha */
.change-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
  font-size: 0.8rem;
}

/* Contenedor para los valores de cambio */
.change-values {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 50px; /* Ancho mínimo para asegurar centrado consistente */
}

/* Porcentaje de cambio */
.change-percentage {
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1.2;
  /* El color se hereda de la clase .positive o .negative */
  opacity: 0.95; /* Casi tan importante como el monto principal */
}

/* Cantidad de cambio */
.change-amount {
  font-size: 0.75rem;
  opacity: 0.85; /* Ligeramente menos prominente que el porcentaje */
}

/* Etiqueta de período de comparación */
.comparison-period {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-top: 4px;
  font-weight: 500;
  opacity: 0.75; /* Menos prominente que los valores de cambio */
}

.positive {
  background-color: rgba(46, 204, 113, 0.15); /* Verde más profesional */
  color: #27ae60; /* Verde más serio */
  /* Borde con gradiente para efecto 3D */
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.positive .change-percentage {
  color: #219653; /* Verde más oscuro para mejor contraste */
}

.positive .change-amount {
  color: #27ae60; /* Verde más serio */
}

.negative {
  background-color: rgba(231, 76, 60, 0.15); /* Rojo más profesional */
  color: #e74c3c; /* Rojo más serio */
  /* Borde con gradiente para efecto 3D */
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.negative .change-percentage {
  color: #c0392b; /* Rojo más oscuro para mejor contraste */
}

.negative .change-amount {
  color: #e74c3c; /* Rojo más serio */
}

.neutral {
  background-color: rgba(149, 165, 166, 0.15); /* Gris más profesional */
  color: #7f8c8d; /* Gris más serio */
  /* Borde con gradiente para efecto 3D */
  border: 1px solid rgba(149, 165, 166, 0.3);
}

/* Métricas adicionales */
.card-metrics {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  /* Borde con efecto 3D */
  border-top: 1px solid rgba(125, 130, 152, 0.1);
  position: relative;
  margin-top: 2px;
}

/* Efecto de sombra en el borde superior */
.card-metrics::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    to right,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.2) 50%,
    rgba(255, 255, 255, 0) 100%
  );
}

.metric {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 2px;
  opacity: 0.7; /* Menos prominente que la mayoría de los elementos */
}

.metric-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  /* Efecto de texto 3D sutil */
  text-shadow: 0 1px 1px rgba(0, 0, 0, 0.1);
  opacity: 0.9; /* Importante pero no tanto como el monto principal */
}

/* Ajustes responsive */
@media (max-width: 576px) {
  .sales-card {
    padding: 12px;
  }
  
  .card-title {
    font-size: 0.95rem;
  }
  
  .amount {
    font-size: 1.5rem;
  }
  
  .amount-prefix {
    font-size: 0.95rem;
  }
  
  .change-percentage {
    font-size: 0.8rem;
  }
  
  .change-amount {
    font-size: 0.7rem;
  }
  
  .comparison-period {
    font-size: 0.7rem;
  }
  
  .metric-value {
    font-size: 0.9rem;
  }
}
</style> 