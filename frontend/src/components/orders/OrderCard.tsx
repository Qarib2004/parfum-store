import { useState } from "react";
import Link from "next/link";
import { Order } from "@/types";
import { StatusBadge } from "./StatusBadge";
import styles from "./OrderCard.module.scss";
import { stripeApi } from "@/lib/api/endpoints";
import { formatDate, formatPrice } from  "@/utils/format";

interface OrderCardProps {
  order: Order;
  onCancel: (id: string) => void;
  cancelling: string | null;
}

export function OrderCard({ order, onCancel, cancelling }: OrderCardProps) {
  const [repaying, setRepaying] = useState(false);

  const handleRepay = async () => {
    setRepaying(true);
    try {
      const payload = order.items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));
      const res = await stripeApi.createCheckoutSession(payload);
      const url = res.data.data?.sessionUrl;
      if (url) window.location.href = url;
    } catch {
    } finally {
      setRepaying(false);
    }
  };

  const canCancel = order.status === "PENDING" || order.status === "PROCESSING";
  const extraCount = order.items.length - 3;
  const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.orderNumber}>#{order.orderNumber}</span>
          <StatusBadge status={order.status} />
        </div>
        <span className={styles.date}>{formatDate(order.createdAt)}</span>
      </div>

      <div className={styles.body}>
        <div className={styles.avatars}>
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className={styles.avatar}>
              {item.product.imageUrl ? (
                <img src={item.product.imageUrl} alt={item.product.name} />
              ) : (
                <span>🧴</span>
              )}
            </div>
          ))}
          {extraCount > 0 && (
            <div className={`${styles.avatar} ${styles.avatarExtra}`}>
              +{extraCount}
            </div>
          )}
        </div>

        <div className={styles.info}>
          <p className={styles.productName}>
            {order.items[0]?.product.name}
            {order.items.length > 1 && (
              <span className={styles.moreItems}> and {order.items.length - 1} more</span>
            )}
          </p>
          <p className={styles.qty}>{totalQty} pcs.</p>
        </div>

        <span className={styles.total}>{formatPrice(order.totalAmount)}</span>
      </div>

      <div className={styles.actions}>
        <Link href={`/dashboard/my-orders/${order.id}`} className={styles.btnDetails}>
          Details
        </Link>

        {order.status === "PENDING" && (
          <button
            onClick={handleRepay}
            disabled={repaying}
            className={styles.btnPay}
          >
            {repaying ? "Loading..." : "Pay now"}
          </button>
        )}

        {canCancel && (
          <button
            onClick={() => onCancel(order.id)}
            disabled={cancelling === order.id}
            className={styles.btnCancel}
          >
            {cancelling === order.id ? "..." : "Cancel"}
          </button>
        )}
      </div>
    </div>
  );
}