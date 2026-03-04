import { Order } from "@/types";
import styles from "./OrderDetails.module.scss";
import { formatDate, formatPrice } from "@/utils/format";

interface OrderDetailsProps {
  order: Order;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <p className={styles.label}>Order number</p>
          <p className={styles.value}>#{order.orderNumber}</p>
        </div>
        <div className={styles.headerRight}>
          <p className={styles.label}>Date</p>
          <p className={styles.value}>{formatDate(order.createdAt)}</p>
        </div>
      </div>

      <div className={styles.items}>
        {order.items.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemImage}>
              {item.product.imageUrl ? (
                <img src={item.product.imageUrl} alt={item.product.name} />
              ) : (
                <span>🧴</span>
              )}
            </div>
            <div className={styles.itemInfo}>
              <p className={styles.itemName}>{item.product.name}</p>
              <p className={styles.itemQty}>Qty: {item.quantity}</p>
            </div>
            <span className={styles.itemPrice}>
              {formatPrice(item.product.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.totals}>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Subtotal</span>
          <span className={styles.totalValue}>{formatPrice(order.totalAmount)}</span>
        </div>
        <div className={styles.totalRow}>
          <span className={styles.totalLabel}>Shipping</span>
          <span className={`${styles.totalValue} ${styles.free}`}>Free</span>
        </div>
        <div className={styles.divider} />
        <div className={styles.totalRow}>
          <span className={styles.grandLabel}>Total paid</span>
          <span className={styles.grandValue}>{formatPrice(order.totalAmount)}</span>
        </div>
      </div>
    </div>
  );
}