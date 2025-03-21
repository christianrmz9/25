import { createStore } from 'vuex';
import theme from './theme';

// Crear la tienda con módulos
const store = createStore({
  modules: {
    theme
  },
  state: {
    // Estado global de la aplicación
    loading: false,
    error: null
  },
  mutations: {
    // Mutaciones para actualizar el estado
    SET_LOADING(state, isLoading) {
      state.loading = isLoading;
    },
    SET_ERROR(state, error) {
      state.error = error;
    }
  },
  actions: {
    // Acciones para realizar operaciones asíncronas
    setLoading({ commit }, isLoading) {
      commit('SET_LOADING', isLoading);
    },
    setError({ commit }, error) {
      commit('SET_ERROR', error);
    }
  },
  getters: {
    // Getters para acceder al estado
    isLoading: state => state.loading,
    hasError: state => !!state.error,
    errorMessage: state => state.error
  }
});

export default store; 