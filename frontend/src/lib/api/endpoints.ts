import { ApiResponse, Order, OwnerRequest, Product, Shop, User } from "@/types";
import axiosInstance from "./axios";

//auth
export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    axiosInstance.post<ApiResponse<ApiResponse>>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    axiosInstance.post<ApiResponse<ApiResponse>>("/auth/login", data),

  logout: (refreshToken: string) =>
    axiosInstance.post<ApiResponse>("/auth/logout", { refreshToken }),

  refreshToken: (refreshToken: string) =>
    axiosInstance.post<ApiResponse<{ user: User; accessToken: string }>>(
      "/auth/refresh",
      { refreshToken }
    ),

  getUserCurrent: () => {
    axiosInstance.get<ApiResponse<User>>("/auth/me");
  },
};

//user
export const userApi = {
  getProfile: () => axiosInstance.get<ApiResponse<User>>("/users/profile"),

  getUserById: (userId: string) =>
    axiosInstance.get<ApiResponse<User>>(`/users/${userId}`),

  updateProfile: (data: Partial<User>) =>
    axiosInstance.put<ApiResponse<User>>("/users/profile", data),

  updateAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return axiosInstance.put<ApiResponse<User>>("/users/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteAvatar: () => axiosInstance.delete<ApiResponse<User>>("/users/avatar"),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    axiosInstance.put<ApiResponse>("/users/password", data),
};

//product
export const productApi = {
  getAllProducts: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    brand?: string;
    fragranceType?: string;
    minPrice?: number;
    maxPrice?: number;
    ownerId?: string;
  }) =>
    axiosInstance.get<ApiResponse<{ products: Product[]; pagination: any }>>(
      "/products",
      { params }
    ),

  getProductById: (id: string) =>
    axiosInstance.get<ApiResponse<Product>>(`/products/${id}`),

  getProductBySlug: (slug: string) =>
    axiosInstance.get<ApiResponse<Product>>(`/products/slug/${slug}`),

  createProduct: (data: any) =>
    axiosInstance.post<ApiResponse<Product>>("/products", data),

  createProductWithImage: (data: any, file: File) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => formData.append(key, data[key]));
    formData.append("image", file);
    return axiosInstance.post<ApiResponse<Product>>(
      "/products/with-image",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },

  updateProduct: (id: string, data: any) =>
    axiosInstance.put<ApiResponse<Product>>(`/products/${id}`, data),

  updateProductImage: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return axiosInstance.put<ApiResponse<Product>>(
      `/products/${id}/image`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
  },

  deleteProduct: (id: string) =>
    axiosInstance.delete<ApiResponse>(`/products/${id}`),

  getOwnerProducts: () =>
    axiosInstance.get<ApiResponse<Product[]>>("/products/my/products"),

  getOwnerProductsStats: () =>
    axiosInstance.get<ApiResponse<any>>("/products/my/stats"),
};

//shop

export const shopApi = {
  getAllShops: (params?: { page?: number; limit?: number; search?: string }) =>
    axiosInstance.get<ApiResponse<{ shops: Shop[]; pagination: any }>>(
      "/shops",
      { params }
    ),

  getShopById: (id: string) =>
    axiosInstance.get<ApiResponse<Shop>>(`/shops/${id}`),

  getShopBySlug: (slug: string) =>
    axiosInstance.get<ApiResponse<Shop>>(`/shops/slug/${slug}`),

  getMyShop: () => axiosInstance.get<ApiResponse<Shop>>("/shops/my"),

  createShop: (data: {
    name: string;
    description?: string;
    address?: string;
  }) => axiosInstance.post<ApiResponse<Shop>>("/shops", data),

  updateShop: (id: string, data: any) =>
    axiosInstance.put<ApiResponse<Shop>>(`/shops/${id}`, data),

  updateShopLogo: (id: string, file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    return axiosInstance.put<ApiResponse<Shop>>(`/shops/${id}/logo`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteShopLogo: (id: string) =>
    axiosInstance.delete<ApiResponse<Shop>>(`/shops/${id}/logo`),

  deleteShop: (id: string) => axiosInstance.delete<ApiResponse>(`/shops/${id}`),

  getShopProducts: (id: string, params?: { page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<{ products: Product[]; pagination: any }>>(
      `/shops/${id}/products`,
      { params }
    ),

  getShopProductsBySlug: (
    slug: string,
    params?: { page?: number; limit?: number }
  ) =>
    axiosInstance.get<ApiResponse<{ products: Product[]; pagination: any }>>(
      `/shops/slug/${slug}/products`,
      { params }
    ),
};

//notifications
export const notificationApi = {
  getNotifications: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get<
      ApiResponse<{
        notifications: Notification[];
        unreadCount: number;
        pagination: any;
      }>
    >("/notifications", { params }),

  getUnreadNotifications: () =>
    axiosInstance.get<ApiResponse<Notification[]>>("/notifications/unread"),

  getUnreadCount: () =>
    axiosInstance.get<ApiResponse<{ count: number }>>(
      "/notifications/unread-count"
    ),

  markAsRead: (id: string) =>
    axiosInstance.put<ApiResponse<Notification>>(`/notifications/${id}/read`),

  markAllAsRead: () =>
    axiosInstance.put<ApiResponse>("/notifications/read-all"),

  deleteNotification: (id: string) =>
    axiosInstance.delete<ApiResponse>(`/notifications/${id}`),

  deleteAllRead: () =>
    axiosInstance.delete<ApiResponse>("/notifications/read/all"),
};

//orders
export const orderApi = {
  getUserOrders: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<{ orders: Order[]; pagination: any }>>(
      "/orders/my",
      { params }
    ),

  getOrderById: (id: string) =>
    axiosInstance.get<ApiResponse<Order>>(`/orders/${id}`),

  getOwnerOrders: (params?: { page?: number; limit?: number }) =>
    axiosInstance.get<ApiResponse<{ orders: Order[]; pagination: any }>>(
      "/orders/owner",
      { params }
    ),

  updateOrderStatus: (id: string, status: string) =>
    axiosInstance.put<ApiResponse<Order>>(`/orders/${id}/status`, { status }),

  cancelOrder: (id: string) =>
    axiosInstance.put<ApiResponse<Order>>(`/orders/${id}/cancel`),

  getOrderStats: () => axiosInstance.get<ApiResponse<any>>("/orders/stats"),
};




//owner request
export const ownerRequestApi = {
    createOwnerRequest: (data: { products: Array<{ name: string; brand: string; quantity: number }> }) =>
      axiosInstance.post<ApiResponse<OwnerRequest>>('/owner-requests', data),
    
    getUserOwnerRequests: () =>
      axiosInstance.get<ApiResponse<OwnerRequest[]>>('/owner-requests/my'),
    
    getOwnerRequestById: (id: string) =>
      axiosInstance.get<ApiResponse<OwnerRequest>>(`/owner-requests/${id}`),
    
    getAllOwnerRequests: (params?: { page?: number; limit?: number; status?: string }) =>
      axiosInstance.get<ApiResponse<{ requests: OwnerRequest[]; pagination: any }>>('/owner-requests', { params }),
    
    reviewOwnerRequest: (data: { requestId: string; status: 'APPROVED' | 'REJECTED'; adminComment?: string }) =>
      axiosInstance.put<ApiResponse<OwnerRequest>>(`/owner-requests/${data.requestId}/review`, data),
    
    deleteOwnerRequest: (id: string) =>
      axiosInstance.delete<ApiResponse>(`/owner-requests/${id}`),
  };



  //stripe
  export const stripeApi = {
    createCheckoutSession: (items: Array<{ productId: string; quantity: number }>) =>
      axiosInstance.post<ApiResponse<{ sessionId: string; sessionUrl: string; order: Order }>>('/stripe/create-checkout-session', { items }),
    
    checkPaymentStatus: (sessionId: string) =>
      axiosInstance.get<ApiResponse<any>>(`/stripe/payment-status/${sessionId}`),
  };