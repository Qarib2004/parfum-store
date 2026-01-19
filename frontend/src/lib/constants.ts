export const USER_ROLES = {
    USER: 'USER',
    OWNER: 'OWNER',
    ADMIN: 'ADMIN',
  } as const;
  
  export const ORDER_STATUS = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
  } as const;
  
  export const REQUEST_STATUS = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
  } as const;
  
  export const NOTIFICATION_TYPES = {
    MESSAGE: 'MESSAGE',
    ORDER: 'ORDER',
    REQUEST_STATUS: 'REQUEST_STATUS',
    PRODUCT_UPDATE: 'PRODUCT_UPDATE',
    SYSTEM: 'SYSTEM',
  } as const;
  
  export const FRAGRANCE_TYPES = [
    'Floral',
    'Oriental',
    'Woody',
    'Fresh',
    'Fruity',
    'Spicy',
    'Citrus',
    'Marine',
  ] as const;
  
  export const VOLUMES = [30, 50, 75, 100, 150, 200] as const;
  
  export const ORDER_STATUS_LABELS = {
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  } as const;
  
  export const REQUEST_STATUS_LABELS = {
    PENDING: 'Under Review',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
  } as const;
  
  export const NOTIFICATION_TYPE_LABELS = {
    MESSAGE: 'Message',
    ORDER: 'Order',
    REQUEST_STATUS: 'Request',
    PRODUCT_UPDATE: 'Product Update',
    SYSTEM: 'System',
  } as const;
  
  export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    PRODUCTS_PER_PAGE: 12,
    MESSAGES_PER_PAGE: 50,
    NOTIFICATIONS_PER_PAGE: 20,
  } as const;
  
  export const OWNER_REQUIREMENTS = {
    MIN_PRODUCTS: 15,
    MIN_QUANTITY_PER_PRODUCT: 7,
    MIN_TOTAL_QUANTITY: 105,
  } as const;
  
  export const FILE_LIMITS = {
    MAX_IMAGE_SIZE_MB: 5,
    MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  } as const;
  