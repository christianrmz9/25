<template>
  <span 
    class="material-icon" 
    :class="[
      `size-${size}`, 
      { 'filled': filled, 'outlined': !filled }
    ]"
    :aria-hidden="!ariaLabel"
    :aria-label="ariaLabel"
  >
    {{ name }}
  </span>
</template>

<script>
/**
 * Componente para mostrar iconos de Material Symbols
 * 
 * Utiliza la fuente de Material Symbols (https://fonts.google.com/icons)
 * 
 * @component MaterialIcon
 */
export default {
  name: 'MaterialIcon',
  
  props: {
    /**
     * Nombre del icono según Material Icons
     */
    name: {
      type: String,
      required: true
    },
    
    /**
     * Tamaño del icono (xs, sm, md, lg, xl)
     */
    size: {
      type: String,
      default: 'md',
      validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
    },
    
    /**
     * Si es true, muestra el icono relleno (filled)
     * Si es false, muestra el icono solo contorno (outlined)
     */
    filled: {
      type: Boolean,
      default: true
    },
    
    /**
     * Etiqueta aria-label para accesibilidad
     * Si no se proporciona, el icono se oculta para lectores de pantalla
     */
    ariaLabel: {
      type: String,
      default: ''
    }
  }
};
</script>

<style>
/* Asegurarse de que la fuente de Material Symbols esté cargada en el proyecto */
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,0..200');

.material-icon {
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
  vertical-align: middle;
}

/* Tamaños predefinidos */
.material-icon.size-xs {
  font-size: 14px;
}

.material-icon.size-sm {
  font-size: 18px;
}

.material-icon.size-md {
  font-size: 24px;
}

.material-icon.size-lg {
  font-size: 32px;
}

.material-icon.size-xl {
  font-size: 40px;
}

/* Estilos para filled o outlined */
.material-icon.filled {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

.material-icon.outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style> 