/**
 * Configuración de navegación del sistema
 * 
 * Este archivo define la estructura jerárquica del menú de navegación.
 * Todos los elementos deben tener un ID único para facilitar el control de estado.
 * 
 * Estructura de cada elemento:
 * {
 *   id: string (identificador único)
 *   text: string (texto a mostrar)
 *   icon: string (identificador del icono)
 *   href: string (enlace de navegación, opcional)
 *   expanded: boolean (estado inicial expandido/colapsado, para items con hijos)
 *   badge: string (texto para insignia, opcional)
 *   active: boolean (indica si es el elemento activo, opcional)
 *   isSection: boolean (indica si es un encabezado de sección, opcional)
 *   children: array (elementos hijos, opcional)
 * }
 */

export const navigationConfig = [
  // Dashboard
  {
    id: 'dashboard',
    text: 'Dashboard',
    icon: 'nav-icon-chart',
    href: '/dashboard'
  },
  
  // Punto de venta
  {
    id: 'punto-venta',
    text: 'Punto de venta',
    icon: 'nav-icon-cart',
    href: '/punto-venta'
  },
  
  // Tiendas (con subitems)
  {
    id: 'tiendas',
    text: 'Tiendas',
    icon: 'nav-icon-shop',
    expanded: false,
    children: [
      {
        id: 'tiendas-admin',
        text: 'Administración de tiendas',
        icon: 'nav-icon-store',
        href: '/tiendas/admin'
      },
      {
        id: 'tiendas-inventario',
        text: 'Carga de inventario',
        icon: 'nav-icon-inventory',
        href: '/tiendas/inventario'
      },
      {
        id: 'tiendas-ventas',
        text: 'Ventas por tienda',
        icon: 'nav-icon-trending-up',
        href: '/tiendas/ventas'
      },
      {
        id: 'tiendas-reportes',
        text: 'Reportes de tienda',
        icon: 'nav-icon-report',
        href: '/tiendas/reportes'
      }
    ]
  },
  
  // Compras (con subitems)
  {
    id: 'compras',
    text: 'Compras',
    icon: 'nav-icon-shopping',
    expanded: false,
    children: [
      {
        id: 'compras-ordenes',
        text: 'Órdenes de compra',
        icon: 'nav-icon-order',
        href: '/compras/ordenes'
      },
      {
        id: 'compras-proveedores',
        text: 'Proveedores',
        icon: 'nav-icon-users',
        href: '/compras/proveedores'
      },
      {
        id: 'compras-recepcion',
        text: 'Recepción de mercancía',
        icon: 'nav-icon-package',
        href: '/compras/recepcion'
      }
    ]
  },
  
  // Cobranza
  {
    id: 'cobranza',
    text: 'Cobranza',
    icon: 'nav-icon-payment',
    href: '/cobranza'
  },
  
  // Logística (encabezado de sección)
  {
    id: 'logistica-header',
    text: 'LOGÍSTICA',
    isSection: true
  },
  
  // Elementos de logística
  {
    id: 'bancos',
    text: 'Bancos',
    icon: 'nav-icon-bank',
    href: '/logistica/bancos'
  },
  {
    id: 'administracion',
    text: 'Administración',
    icon: 'nav-icon-admin',
    href: '/logistica/administracion'
  },
  
  // Catálogos (con subitems)
  {
    id: 'catalogos',
    text: 'Catálogos',
    icon: 'nav-icon-folder',
    expanded: false,
    children: [
      {
        id: 'catalogos-articulos',
        text: 'Artículos',
        icon: 'nav-icon-box',
        href: '/catalogos/articulos'
      },
      {
        id: 'catalogos-clientes',
        text: 'Clientes',
        icon: 'nav-icon-user',
        href: '/catalogos/clientes'
      },
      {
        id: 'catalogos-empleados',
        text: 'Empleados',
        icon: 'nav-icon-account',
        href: '/catalogos/empleados'
      }
    ]
  },
  
  // Configuración (con subitems)
  {
    id: 'configuracion',
    text: 'Configuración',
    icon: 'nav-icon-settings',
    expanded: false,
    children: [
      {
        id: 'config-general',
        text: 'General',
        icon: 'nav-icon-settings',
        href: '/configuracion/general'
      },
      {
        id: 'config-permisos',
        text: 'Permisos',
        icon: 'nav-icon-lock',
        href: '/configuracion/permisos'
      },
      {
        id: 'config-roles',
        text: 'Roles',
        icon: 'nav-icon-people',
        href: '/configuracion/roles'
      },
      {
        id: 'config-usuarios',
        text: 'Usuarios',
        icon: 'nav-icon-user',
        href: '/configuracion/usuarios'
      },
      {
        id: 'config-empresa',
        text: 'Datos de empresa',
        icon: 'nav-icon-business',
        href: '/configuracion/empresa'
      },
      {
        id: 'config-impuestos',
        text: 'Impuestos',
        icon: 'nav-icon-money',
        href: '/configuracion/impuestos'
      }
    ]
  }
];

/**
 * Función auxiliar para buscar un elemento por ID en la estructura de navegación
 * @param {string} id - ID del elemento a buscar
 * @param {Array} items - Elementos donde buscar (por defecto, toda la navegación)
 * @returns {Object|null} - El elemento encontrado o null
 */
export const findItemById = (id, items = navigationConfig) => {
  if (!id || !items || !Array.isArray(items)) {
    return null;
  }
  
  // Función recursiva para buscar en toda la estructura
  const findInItems = (itemsToSearch) => {
    if (!itemsToSearch || !Array.isArray(itemsToSearch)) {
      return null;
    }
    
    for (const item of itemsToSearch) {
      if (!item) continue;
      
      // Verificar si es el elemento buscado
      if (item.id === id) return item;
      
      // Buscar en hijos si existen
      if (item.children && item.children.length > 0) {
        const found = findInItems(item.children);
        if (found) return found;
      }
    }
    return null;
  };
  
  return findInItems(items);
};

/**
 * Función para transformar un array plano de rutas en un árbol de navegación
 * Útil para añadir nuevas rutas fácilmente
 * 
 * Ejemplo de uso:
 * const nuevasRutas = [
 *   { path: '/nueva-seccion', name: 'Nueva Sección', icon: 'nav-icon-folder' },
 *   { path: '/nueva-seccion/elemento', name: 'Nuevo Elemento', icon: 'nav-icon-file' }
 * ];
 * const estructuraActualizada = appendRoutes(navigationConfig, nuevasRutas);
 */
export const appendRoutes = (navigationTree, flatRoutes) => {
  // Crear copia de la estructura actual
  const newTree = JSON.parse(JSON.stringify(navigationTree));
  
  // Función para generar un ID único basado en el path
  const pathToId = (path) => {
    return path.substring(1).replace(/\//g, '-');
  };
  
  // Procesar cada ruta
  flatRoutes.forEach(route => {
    // Separar path en segmentos
    const segments = route.path.split('/').filter(Boolean);
    
    // Si es una ruta de nivel superior
    if (segments.length === 1) {
      // Generar ID único
      const id = pathToId(route.path);
      
      // Verificar si ya existe
      const existingIndex = newTree.findIndex(item => item.id === id);
      
      if (existingIndex === -1) {
        // Añadir como nuevo elemento
        newTree.push({
          id,
          text: route.name,
          icon: route.icon || 'nav-icon-folder',
          href: route.path,
          expanded: false,
          children: []
        });
      }
    }
    // Si es una subruta
    else {
      // Encontrar el elemento padre
      const parentPath = '/' + segments.slice(0, segments.length - 1).join('/');
      const parentId = pathToId(parentPath);
      
      // Buscar el elemento padre en toda la estructura
      const parent = findItemById(parentId, newTree);
      
      if (parent) {
        // Generar ID único para el hijo
        const childId = pathToId(route.path);
        
        // Verificar si ya existe
        const existingChildIndex = parent.children ? parent.children.findIndex(child => child.id === childId) : -1;
        
        if (existingChildIndex === -1) {
          // Añadir como hijo
          if (!parent.children) parent.children = [];
          
          parent.children.push({
            id: childId,
            text: route.name,
            icon: route.icon || 'nav-icon-file',
            href: route.path
          });
        }
      }
    }
  });
  
  return newTree;
}; 