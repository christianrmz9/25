/**
 * Utilidades para manejar eventos del menú de navegación
 * 
 * Este archivo proporciona funciones para actualizar el estado de expansión
 * de los elementos del menú sin mutar directamente las props
 */
import { findItemById } from '../../config/navigation';

// Event listener para manejar la expansión de elementos del menú
const setupMenuListeners = (navigationItems, updateNavigationState) => {
  if (!navigationItems || !updateNavigationState) {
    console.error('setupMenuListeners: Se requieren navigationItems y updateNavigationState');
    return () => {}; // Retornar una función vacía para evitar errores
  }

  // Función para manejar el evento de expansión
  const handleMenuItemExpanded = (event) => {
    if (!event || !event.detail) return;
    
    const { id, expanded } = event.detail;
    if (!id) return;
    
    // Ya no necesitamos verificar si navigationItems es un ref
    const itemToUpdate = findItemById(id, navigationItems);
    
    if (itemToUpdate) {
      // Crear una copia profunda del array para evitar mutaciones directas
      const updatedItems = JSON.parse(JSON.stringify(navigationItems));
      
      // Encontrar y actualizar el elemento en la copia
      const updatedItem = findItemById(id, updatedItems);
      if (updatedItem) {
        updatedItem.expanded = expanded;
        
        // Actualizar el estado en el componente padre
        updateNavigationState(updatedItems);
      }
    }
  };
  
  // Agregar event listener
  window.addEventListener('menu-item-expanded', handleMenuItemExpanded);
  
  // Devolver una función para eliminar el event listener
  return () => {
    window.removeEventListener('menu-item-expanded', handleMenuItemExpanded);
  };
};

export { setupMenuListeners }; 