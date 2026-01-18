export type UserRole = 'USER' | 'OWNER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  slug: string;
  volume: number;
  fragranceType: string;
  quantity: number;
  price: number;
  description?: string;
  imageUrl?: string;
  ownerId: string;
  owner?: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  logoUrl?: string;
  ownerId: string;
  owner?: User;
  createdAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  read: boolean;
  createdAt: string;
}

export interface Conversation {
  user: User;
  lastMessage: Message;
  unreadCount: number;
}

export type NotificationType = 'MESSAGE' | 'ORDER' | 'REQUEST_STATUS' | 'PRODUCT_UPDATE' | 'SYSTEM';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  metadata?: any;
  createdAt: string;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user?: User;
  totalAmount: number;
  status: OrderStatus;
  stripePaymentId?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ProductDetail {
  name: string;
  brand: string;
  quantity: number;
}

export interface OwnerRequest {
  id: string;
  userId: string;
  user?: User;
  productsCount: number;
  totalQuantity: number;
  productDetails: ProductDetail[];
  status: RequestStatus;
  adminComment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}