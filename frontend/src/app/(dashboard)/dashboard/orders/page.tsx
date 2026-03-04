"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useOrderStore } from "@/store/useOrderStore";
import { OrderStatus } from "@/types";

import styles from "./my-order.module.scss";
import { StatPill } from "@/components/orders/StatPill";
import { FILTERS } from "@/constants/filters";
import { OrderCard } from "@/components/orders/OrderCard";
import { STATUS_CFG } from "@/components/orders/StatusBadge";
import { SkeletonCard } from "@/components/orders/SkeletonCard";

export default function MyOrdersPage() {
  const [filter, setFilter] = useState<OrderStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const {
    orders, pagination, stats,
    loading, error,
    fetchUserOrders, fetchStats, cancelOrder, clearError,
  } = useOrderStore();

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchUserOrders({ page, limit: 8 }); }, [page, fetchUserOrders]);

  const handleCancel = async (id: string) => {
    setCancelling(id);
    try {
      await cancelOrder(id);
    } finally {
      setCancelling(null);
    }
  };

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Orders</h1>
            <p className={styles.subtitle}>Purchase history</p>
          </div>
          <Link href="/cart" className={styles.backLink}>
            ← Cart
          </Link>
        </div>

        {stats && (
          <div className={styles.stats}>
            <StatPill label="Total"      value={stats.total}      />
            <StatPill label="Pending"    value={stats.pending}    accent="amber"   />
            <StatPill label="Processing" value={stats.processing} accent="blue"    />
            <StatPill label="Completed"  value={stats.completed}  accent="emerald" />
          </div>
        )}

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
                {cnt != null && (
                  <span className={styles.filterCount}>{cnt}</span>
                )}
              </button>
            );
          })}
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <p>{error}</p>
            <button onClick={clearError} className={styles.errorClose}>✕</button>
          </div>
        )}

        {loading ? (
          <div className={styles.list}>
            {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>📦</span>
            <div className={styles.emptyText}>
              <p className={styles.emptyTitle}>
                {filter === "ALL"
                  ? "No orders yet"
                  : `No "${STATUS_CFG[filter as OrderStatus]?.label}" orders`}
              </p>
              <p className={styles.emptySubtitle}>Time to find something you'll love</p>
            </div>
            <Link href="/products" className={styles.emptyCta}>
              Browse catalog
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onCancel={handleCancel}
                cancelling={cancelling}
              />
            ))}
          </div>
        )}

        {pagination && pagination.totalPages > 1 && (
          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>
              {pagination.total} orders · {pagination.page} / {pagination.totalPages}
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
  );
}