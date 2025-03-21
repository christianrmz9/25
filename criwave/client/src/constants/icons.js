/**
 * Constantes para los iconos de Material Icons utilizados en la aplicación
 * 
 * Este archivo centraliza todos los nombres de iconos para facilitar su cambio
 * y mantener consistencia en toda la aplicación
 * 
 * @see https://fonts.google.com/icons
 */

// Iconos de navegación
export const ICON_DASHBOARD = 'dashboard';
export const ICON_NOTIFICATIONS = 'notifications';
export const ICON_TASK = 'task_alt';
export const ICON_NOTE = 'note';
export const ICON_EMAIL = 'email';
export const ICON_REPORT = 'summarize';
export const ICON_SETTINGS = 'settings';
export const ICON_WORKFLOW = 'account_tree';

// Iconos de favoritos
export const ICON_GLOBE = 'public';
export const ICON_HANDSHAKE = 'handshake';
export const ICON_PARTNERSHIP = 'connect_without_contact';
export const ICON_CALENDAR = 'event';

// Iconos de registros
export const ICON_USERS = 'group';
export const ICON_CONTACTS = 'contacts';

// Iconos de acciones
export const ICON_SEARCH = 'search';
export const ICON_CLOSE = 'close';
export const ICON_ADD = 'add';
export const ICON_EDIT = 'edit';
export const ICON_DELETE = 'delete';
export const ICON_SAVE = 'save';
export const ICON_MENU = 'menu';
export const ICON_HELP = 'help_outline';
export const ICON_INFO = 'info';
export const ICON_WARNING = 'warning';
export const ICON_ERROR = 'error';
export const ICON_SUCCESS = 'check_circle';
export const ICON_HISTORY = 'history';

// Iconos de UI
export const ICON_DARK_MODE = 'dark_mode';
export const ICON_LIGHT_MODE = 'light_mode';
export const ICON_ARROW_DOWN = 'keyboard_arrow_down';
export const ICON_ARROW_UP = 'keyboard_arrow_up';
export const ICON_ARROW_LEFT = 'keyboard_arrow_left';
export const ICON_ARROW_RIGHT = 'keyboard_arrow_right';
export const ICON_ARROW_DROP_DOWN = 'arrow_drop_down';
export const ICON_MORE = 'more_vert';
export const ICON_FILTER = 'filter_list';
export const ICON_SORT = 'sort';
export const ICON_REFRESH = 'refresh';
export const ICON_HOME = 'home';
export const ICON_LOGOUT = 'logout';
export const ICON_PERSON = 'person';

import {
  LayoutDashboard,
  ShoppingCart,
  Store,
  Package,
  TrendingUp,
  FileText,
  Building2,
  Users,
  Receipt,
  CreditCard,
  Building,
  Settings,
  Lock,
  User,
  Briefcase,
  DollarSign,
  FolderOpen,
  Box,
  Tags
} from 'lucide-vue-next';

/**
 * Mapeo de nombres genéricos de iconos a nombres específicos de Material Icons
 * 
 * Este mapeo permite usar nombres semánticos en los componentes,
 * y cambiar fácilmente la implementación real de los iconos si es necesario.
 */

export const ICON_MAPPING = {
  // Navegación principal
  'nav-icon-chart': LayoutDashboard,
  'nav-icon-cart': ShoppingCart,
  'nav-icon-shop': Store,
  'nav-icon-store': Store,
  'nav-icon-shopping': ShoppingCart,
  'nav-icon-payment': CreditCard,
  'nav-icon-folder': FolderOpen,
  'nav-icon-settings': Settings,
  
  // Subcategorías de compras y tiendas
  'nav-icon-inventory': Package,
  'nav-icon-trending-up': TrendingUp,
  'nav-icon-report': FileText,
  'nav-icon-order': Receipt,
  'nav-icon-package': Box,
  
  // Logística
  'nav-icon-bank': Building,
  'nav-icon-admin': Building2,
  
  // Catálogos
  'nav-icon-box': Box,
  'nav-icon-user': User,
  'nav-icon-account': Users,
  'nav-icon-tag': Tags,
  'nav-icon-structure': Building2,
  
  // Configuración
  'nav-icon-lock': Lock,
  'nav-icon-people': Users,
  'nav-icon-business': Briefcase,
  'nav-icon-money': DollarSign
};

/**
 * Función para obtener el nombre real del icono basado en el mapeo
 * @param {string} iconKey - Identificador del icono
 * @returns {string} - Nombre del icono de Material Icons
 */
export const getIconName = (iconKey) => {
  return ICON_MAPPING[iconKey] || iconKey;
};

export const getIconComponent = (iconKey) => {
  return ICON_MAPPING[iconKey] || FolderOpen; // FolderOpen como icono por defecto
};

export default {
  // Exportamos todos los iconos en un objeto para facilitar su importación
  dashboard: ICON_DASHBOARD,
  notifications: ICON_NOTIFICATIONS,
  task: ICON_TASK,
  note: ICON_NOTE,
  email: ICON_EMAIL,
  report: ICON_REPORT,
  settings: ICON_SETTINGS,
  workflow: ICON_WORKFLOW,
  globe: ICON_GLOBE,
  handshake: ICON_HANDSHAKE,
  partnership: ICON_PARTNERSHIP,
  calendar: ICON_CALENDAR,
  users: ICON_USERS,
  contacts: ICON_CONTACTS,
  search: ICON_SEARCH,
  close: ICON_CLOSE,
  add: ICON_ADD,
  edit: ICON_EDIT,
  delete: ICON_DELETE,
  save: ICON_SAVE,
  menu: ICON_MENU,
  help: ICON_HELP,
  info: ICON_INFO,
  warning: ICON_WARNING,
  error: ICON_ERROR,
  success: ICON_SUCCESS,
  history: ICON_HISTORY,
  darkMode: ICON_DARK_MODE,
  lightMode: ICON_LIGHT_MODE,
  arrowDown: ICON_ARROW_DOWN,
  arrowUp: ICON_ARROW_UP,
  arrowLeft: ICON_ARROW_LEFT,
  arrowRight: ICON_ARROW_RIGHT,
  arrowDropDown: ICON_ARROW_DROP_DOWN,
  more: ICON_MORE,
  filter: ICON_FILTER,
  sort: ICON_SORT,
  refresh: ICON_REFRESH,
  home: ICON_HOME,
  logout: ICON_LOGOUT,
  person: ICON_PERSON
}; 