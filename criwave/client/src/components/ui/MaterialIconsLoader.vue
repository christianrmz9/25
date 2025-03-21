<template>
  <!-- Este componente no tiene salida visual, solo carga la fuente de Material Icons -->
  <div class="material-icons-loader"></div>
</template>

<script>
/**
 * Componente para cargar la fuente de Material Icons
 * 
 * Este componente carga la fuente de Material Icons desde Google Fonts
 * Debe incluirse una sola vez en la aplicación, idealmente en App.vue
 * 
 * @component MaterialIconsLoader
 */
export default {
  name: 'MaterialIconsLoader',
  
  created() {
    this.loadMaterialIcons();
  },
  
  methods: {
    /**
     * Carga la fuente de Material Icons desde Google Fonts
     */
    loadMaterialIcons() {
      // Verificar si ya existe el link de Material Icons
      const existingLink = document.getElementById('material-icons-font');
      if (existingLink) return;
      
      // Crear el enlace a la fuente
      const link = document.createElement('link');
      link.id = 'material-icons-font';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
      
      // Añadir al head del documento
      document.head.appendChild(link);
      
      console.log('Material Icons cargado correctamente');
    }
  }
};
</script> 