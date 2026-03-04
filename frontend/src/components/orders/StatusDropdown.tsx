import { Order, OrderStatus } from "@/types";
import { StatusBadge } from "./StatusBadge";
import styles from "./StatusDropdown.module.scss";
import { NEXT_STATUSES, STATUS_CFG } from "@/constants/orderConfig";

interface StatusDropdownProps {
  order: Order;
  onUpdate: (id: string, status: OrderStatus) => void;
  updating: string | null;
}

export function StatusDropdown({ order, onUpdate, updating }: StatusDropdownProps) {
  const options = NEXT_STATUSES[order.status];

  if (!options) return <StatusBadge status={order.status} />;

  const isUpdating = updating === order.id;

  return (
    <div className={styles.wrapper}>
      <select
        disabled={isUpdating}
        defaultValue=""
        onChange={(e) => {
          if (e.target.value) onUpdate(order.id, e.target.value as OrderStatus);
        }}
        className={styles.select}
      >
        <option value="" disabled>
          {isUpdating ? "Updating..." : STATUS_CFG[order.status].label}
        </option>
        {options.map((s) => (
          <option key={s} value={s}>
            → {STATUS_CFG[s].label}
          </option>
        ))}
      </select>
      <svg
        className={styles.chevron}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}