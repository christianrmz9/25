import axios from 'axios';

// Crear instancia de axios con configuración predeterminada
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_URL || '/api',
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para solicitudes
apiClient.interceptors.request.use(
  config => {
    // Aquí puedes modificar las solicitudes antes de enviarlas
    // Por ejemplo, añadir tokens de autenticación
    
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    
    return config;
  },
  error => {
    // Manejar errores de solicitud
    console.error('Error en la solicitud API:', error);
    return Promise.reject(error);
  }
);

// Interceptor para respuestas
apiClient.interceptors.response.use(
  response => {
    // Procesar respuestas exitosas
    return response;
  },
  error => {
    // Manejar errores de respuesta
    if (error.response) {
      // El servidor respondió con un código de estado fuera del rango 2xx
      console.error('Error de respuesta API:', {
        status: error.response.status,
        data: error.response.data
      });
      
      // Aquí puedes manejar códigos de estado específicos
      // Por ejemplo, redireccionar al login si hay un error 401
      
      // if (error.response.status === 401) {
      //   router.push('/login');
      // }
      
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      console.error('No se recibió respuesta del servidor:', error.request);
    } else {
      // Algo ocurrió al configurar la solicitud
      console.error('Error de configuración API:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * Servicio para realizar llamadas a la API
 */
export default {
  /**
   * Realiza una solicitud GET
   * @param {string} url - URL a solicitar
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} - Promesa con respuesta
   */
  get(url, params = {}) {
    return apiClient.get(url, { params });
  },
  
  /**
   * Realiza una solicitud POST
   * @param {string} url - URL a solicitar
   * @param {Object} data - Datos a enviar
   * @returns {Promise} - Promesa con respuesta
   */
  post(url, data = {}) {
    return apiClient.post(url, data);
  },
  
  /**
   * Realiza una solicitud PUT
   * @param {string} url - URL a solicitar
   * @param {Object} data - Datos a enviar
   * @returns {Promise} - Promesa con respuesta
   */
  put(url, data = {}) {
    return apiClient.put(url, data);
  },
  
  /**
   * Realiza una solicitud DELETE
   * @param {string} url - URL a solicitar
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise} - Promesa con respuesta
   */
  delete(url, params = {}) {
    return apiClient.delete(url, { params });
  }
}; 