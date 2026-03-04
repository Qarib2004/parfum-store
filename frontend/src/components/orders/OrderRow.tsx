import { Order, OrderStatus } from "@/types";
import { StatusDropdown } from "./StatusDropdown";
import styles from "./OrderRow.module.scss";
import { formatDate, formatPrice } from "@/utils/format";

interface OrderRowProps {
  order: Order;
  onUpdate: (id: string, status: OrderStatus) => void;
  updating: string | null;
}

export function OrderRow({ order, onUpdate, updating }: OrderRowProps) {
  const buyer = order.user;
  const extraCount = order.items.length - 2;

  return (
    <div className={styles.row}>

      <div className={styles.thumbs}>
        {order.items.slice(0, 2).map((item) => (
          <div key={item.id} className={styles.thumb}>
            {item.product.imageUrl ? (
              <img src={item.product.imageUrl} alt={item.product.name} />
            ) : (
              <span>🧴</span>
            )}
          </div>
        ))}
        {extraCount > 0 && (
          <div className={`${styles.thumb} ${styles.thumbExtra}`}>
            +{extraCount}
          </div>
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.orderNumber}>#{order.orderNumber}</span>
        <p className={styles.productName}>
          {order.items[0]?.product.name}
          {order.items.length > 1 && (
            <span className={styles.moreItems}> +{order.items.length - 1}</span>
          )}
        </p>
        {buyer && (
          <p className={styles.buyer}>
            {buyer.username}
            {buyer.email && <span className={styles.buyerEmail}> · {buyer.email}</span>}
          </p>
        )}
      </div>

      <span className={styles.date}>{formatDate(order.createdAt)}</span>

      <span className={styles.amount}>{formatPrice(order.totalAmount)}</span>

      <div className={styles.statusCell}>
        <StatusDropdown order={order} onUpdate={onUpdate} updating={updating} />
      </div>
    </div>
  );
}