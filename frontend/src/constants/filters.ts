import { OrderStatus } from "@/types";

export const FILTERS: { label: string; value: OrderStatus | "ALL" }[] = [
  { label: "All",        value: "ALL"        },
  { label: "Pending",    value: "PENDING"    },
  { label: "Processing", value: "PROCESSING" },
  { label: "Completed",  value: "COMPLETED"  },
  { label: "Cancelled",  value: "CANCELLED"  },
];