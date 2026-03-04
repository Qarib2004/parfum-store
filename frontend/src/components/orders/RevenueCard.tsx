import styles from "./RevenueCard.module.scss";

interface RevenueCardProps {
  label: string;
  value: string | number;
  accent?: "amber" | "blue" | "emerald";
}

export function RevenueCard({ label, value, accent }: RevenueCardProps) {
  return (
    <div className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={`${styles.value} ${accent ? styles[accent] : ""}`}>{value}</p>
    </div>
  );
}