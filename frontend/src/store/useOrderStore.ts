import { create } from "zustand";
import { Order, OrderStatus, Pagination } from "@/types";
import { orderApi } from "@/lib/api/endpoints";

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  cancelled: number;
  totalRevenue: number;
}

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  stats: OrderStats | null;
  pagination: Pagination | null;

  loading: boolean;
  error: string | null;

  fetchUserOrders: (params?: { page?: number; limit?: number }) => Promise<void>;
  fetchOwnerOrders: (params?: { page?: number; limit?: number }) => Promise<void>;
  fetchOrderById: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  cancelOrder: (id: string) => Promise<void>;
  clearError: () => void;
  clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderState>()((set, get) => ({
  orders: [],
  currentOrder: null,
  stats: null,
  pagination: null,
  loading: false,
  error: null,

  fetchUserOrders: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await orderApi.getUserOrders(params);
      set({
        orders: res.data.data?.orders ?? [],
        pagination: res.data.data?.pagination ?? null,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchOwnerOrders: async (params) => {
    set({ loading: true, error: null });
    try {
      const res = await orderApi.getOwnerOrders(params);
      set({
        orders: res.data.data?.orders ?? [],
        pagination: res.data.data?.pagination ?? null,
      });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchOrderById: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await orderApi.getOrderById(id);
      set({ currentOrder: res.data.data ?? null });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const res = await orderApi.getOrderStats();
      set({ stats: res.data.data ?? null });
    } catch (err: any) {
      set({ error: err.response?.data?.message ?? err.message });
    } finally {
      set({ loading: false });
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ loading: true, error: null });
    try {
      const res = await orderApi.updateOrderStatus(id, status);
      const updated = res.data.data;
      set((state) => ({
        currentOrder: state.currentOrder?.id === id ? updated ?? state.currentOrder : state.currentOrder,
        orders: state.orders.map((o) => (o.id === id && updated ? updated : o)),
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.message;
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  cancelOrder: async (id) => {
    set({ loading: true, error: null });
    try {
      const res = await orderApi.cancelOrder(id);
      const updated = res.data.data;
      set((state) => ({
        currentOrder: state.currentOrder?.id === id ? updated ?? state.currentOrder : state.currentOrder,
        orders: state.orders.map((o) => (o.id === id && updated ? updated : o)),
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.message;
      set({ error: msg });
      throw new Error(msg);
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
  clearCurrentOrder: () => set({ currentOrder: null }),
}));