import { OrderStatus } from "@/types";

export const STATUS_CFG: Record<OrderStatus, { label: string; mod: string }> = {
  PENDING:    { label: "Pending",    mod: "pending"    },
  PROCESSING: { label: "Processing", mod: "processing" },
  COMPLETED:  { label: "Completed",  mod: "completed"  },
  CANCELLED:  { label: "Cancelled",  mod: "cancelled"  },
};

export const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING:    ["PROCESSING", "CANCELLED"],
  PROCESSING: ["COMPLETED",  "CANCELLED"],
};

export const FILTERS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All",        value: "ALL"        },
  { label: "Pending",    value: "PENDING"    },
  { label: "Processing", value: "PROCESSING" },
  { label: "Completed",  value: "COMPLETED"  },
  { label: "Cancelled",  value: "CANCELLED"  },
];