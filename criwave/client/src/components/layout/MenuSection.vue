<template>
  <div class="menu-section">
    <div class="section-title">
      {{ title }}
    </div>
    <div class="section-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
/**
 * Componente para agrupar elementos de menú en secciones
 * 
 * Puede utilizarse para crear divisiones visuales en el menú
 * 
 * @component MenuSection
 */
export default {
  name: 'MenuSection',
  
  props: {
    /**
     * Título de la sección
     */
    title: {
      type: String,
      required: true
    }
  }
};
</script>

<style scoped>
.menu-section {
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.section-title {
  font-size: var(--section-title-size);
  font-weight: var(--section-title-weight);
  color: var(--section-title-color);
  text-transform: var(--section-title-transform);
  letter-spacing: var(--section-title-spacing);
  padding: var(--section-title-padding);
  margin-bottom: 0.25rem;
}

.section-content {
  /* Contenido opcional */
}
</style> 