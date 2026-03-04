"use client";

import { useEffect, useState } from "react";
import { useOrderStore } from "@/store/useOrderStore";
import { OrderStatus } from "@/types";
import styles from "./OwnerOrdersPage.module.scss";
import { RevenueCard } from "@/components/orders/RevenueCard";
import { formatPrice } from "@/utils/format";
import { FILTERS, STATUS_CFG } from "@/constants/orderConfig";
import { SkeletonRow } from "@/components/orders/SkeletonRow";
import { OrderRow } from "@/components/orders/OrderRow";

export default function OwnerOrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const {
    orders, pagination, stats,
    loading, error,
    fetchOwnerOrders, fetchStats, updateOrderStatus, clearError,
  } = useOrderStore();

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchOwnerOrders({ page, limit: 15 }); }, [page, fetchOwnerOrders]);

  const handleUpdate = async (id: string, status: OrderStatus) => {
    setUpdating(id);
    setUpdateError(null);
    try {
      await updateOrderStatus(id, status);
    } catch (err: any) {
      setUpdateError(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const dismissErrors = () => {
    clearError();
    setUpdateError(null);
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <h1 className={styles.title}>Store Orders</h1>
          <p className={styles.subtitle}>Manage customer orders</p>
        </div>

        {stats && (
          <div className={styles.stats}>
            <RevenueCard label="Total"      value={stats.total}                    />
            <RevenueCard label="Pending"    value={stats.pending}    accent="amber"   />
            <RevenueCard label="Processing" value={stats.processing} accent="blue"    />
            <RevenueCard label="Completed"  value={stats.completed}  accent="emerald" />
            <RevenueCard label="Revenue"    value={formatPrice(stats.totalRevenue)} />
          </div>
        )}

        <div className={styles.panel}>

          <div className={styles.filters}>
            {FILTERS.map((f) => {
              const cnt =
                f.value === "PENDING"    ? stats?.pending    :
                f.value === "PROCESSING" ? stats?.processing :
                f.value === "COMPLETED"  ? stats?.completed  :
                f.value === "CANCELLED"  ? stats?.cancelled  : null;

              return (
                <button
                  key={f.value}
                  onClick={() => { setFilter(f.value); setPage(1); }}
                  className={`${styles.filterBtn} ${filter === f.value ? styles.filterBtnActive : ""}`}
                >
                  {f.label}
                  {cnt != null && <span className={styles.filterCount}>{cnt}</span>}
                </button>
              );
            })}
          </div>

          {(error || updateError) && (
            <div className={styles.errorBanner}>
              <p>{updateError ?? error}</p>
              <button onClick={dismissErrors} className={styles.errorClose}>✕</button>
            </div>
          )}

          <div className={styles.colHeaders}>
            <span className={styles.colProducts}>Products</span>
            <span>Order / Customer</span>
            <span className={styles.colDate}>Date</span>
            <span>Amount</span>
            <span>Status</span>
          </div>

          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          ) : filtered.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>📋</span>
              <p className={styles.emptyText}>
                {filter === "ALL"
                  ? "No orders yet"
                  : `No "${STATUS_CFG[filter as OrderStatus]?.label}" orders`}
              </p>
            </div>
          ) : (
            filtered.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onUpdate={handleUpdate}
                updating={updating}
              />
            ))
          )}

          {pagination && pagination.totalPages > 1 && (
            <div className={styles.pagination}>
              <span className={styles.paginationInfo}>
                {pagination.total} orders · page {pagination.page} of {pagination.totalPages}
              </span>
              <div className={styles.paginationControls}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className={styles.pageBtn}
                >
                  ←
                </button>
                <button
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className={styles.pageBtn}
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}