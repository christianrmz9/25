/**
 * Configuración de Vue CLI
 */
const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  // Configuración del servidor de desarrollo
  devServer: {
    port: 8080, // Puerto en el que se ejecutará el servidor
    open: true  // Abre automáticamente el navegador
  }
}) 