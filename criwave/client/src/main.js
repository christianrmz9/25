/**
 * Punto de entrada principal de la aplicación
 * 
 * Inicializa la aplicación Vue y monta el componente raíz
 */
import { createApp } from 'vue';
import App from './App.vue';

// Importar estilos globales
import './styles/themes.css';
import './styles/global.css';
import './styles/responsive.css';

// Crear la aplicación Vue
const app = createApp(App);

// Montar la aplicación en el elemento con id 'app'
app.mount('#app'); 