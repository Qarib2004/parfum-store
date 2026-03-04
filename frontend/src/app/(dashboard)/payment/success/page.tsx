"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useOrderStore } from "@/store/useOrderStore";
import { Order } from "@/types";

import styles from "./PaymentSuccessPage.module.scss";
import { SuccessIcon } from "@/components/payments/SuccessIcon";
import { OrderDetails } from "@/components/payments/OrderDetails";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId   = searchParams.get("order_id");
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { fetchOrderById, currentOrder } = useOrderStore();

  useEffect(() => {
    if (!orderId) {
      setError("Order not found.");
      setLoading(false);
      return;
    }

    fetchOrderById(orderId)
      .catch(() => setError("Could not load order details."))
      .finally(() => setLoading(false));
  }, [orderId, fetchOrderById]);

  useEffect(() => {
    if (currentOrder) setOrder(currentOrder);
  }, [currentOrder]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.hero}>
          <SuccessIcon />
          <div className={styles.heroText}>
            <h1 className={styles.title}>Payment successful!</h1>
            <p className={styles.subtitle}>
              Thank you for your order. We'll send you a confirmation shortly.
            </p>
          </div>
        </div>

        {loading ? (
          <div className={styles.skeleton}>
            <div className={styles.skeletonHeader}>
              <div className={`${styles.bone} ${styles.boneShort}`} />
              <div className={`${styles.bone} ${styles.boneMid}`} />
            </div>
            {[0, 1, 2].map((i) => (
              <div key={i} className={styles.skeletonRow}>
                <div className={styles.skeletonThumb} />
                <div className={styles.skeletonInfo}>
                  <div className={`${styles.bone} ${styles.boneTitle}`} />
                  <div className={`${styles.bone} ${styles.boneSub}`} />
                </div>
                <div className={`${styles.bone} ${styles.bonePrice}`} />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={styles.errorBox}>
            <p>{error}</p>
          </div>
        ) : order ? (
          <OrderDetails order={order} />
        ) : null}

        <div className={styles.actions}>
          <Link href="/dashboard/my-orders" className={styles.btnPrimary}>
            View my orders
          </Link>
          <Link href="/products" className={styles.btnSecondary}>
            Continue shopping
          </Link>
        </div>

        {sessionId && (
          <p className={styles.sessionId}>
            Session: <code>{sessionId}</code>
          </p>
        )}

      </div>
    </div>
  );
}