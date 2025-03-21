/**
 * Punto de entrada principal de la aplicación
 * 
 * Inicializa la aplicación Vue y monta el componente raíz
 */
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// Importar estilos globales (variables debe ser el primero)
import './styles/variables.css'
import './styles/main.css'
import './styles/themes.css'
import './styles/global.css'
import './styles/responsive.css'

// Crear la aplicación Vue
const app = createApp(App)

// Usar router y store
app.use(router)
app.use(store)

// Montar la aplicación en el elemento con id 'app'
app.mount('#app') 