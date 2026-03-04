import { OrderStatus } from "@/types";
import styles from "./StatusBadge.module.scss";

export const STATUS_CFG: Record<OrderStatus, { label: string; cls: string }> = {
  PENDING:    { label: "Awaiting payment", cls: "pending"    },
  PROCESSING: { label: "Processing",       cls: "processing" },
  COMPLETED:  { label: "Completed",        cls: "completed"  },
  CANCELLED:  { label: "Cancelled",        cls: "cancelled"  },
};

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const cfg = STATUS_CFG[status];
  return (
    <span className={`${styles.badge} ${styles[cfg.cls]}`}>
      <span className={styles.dot} />
      {cfg.label}
    </span>
  );
}