import styles from "./StatPill.module.scss";

interface StatPillProps {
  label: string;
  value: number | string;
  accent?: "amber" | "blue" | "emerald";
}

export function StatPill({ label, value, accent }: StatPillProps) {
  return (
    <div className={styles.pill}>
      <p className={`${styles.value} ${accent ? styles[accent] : ""}`}>{value}</p>
      <p className={styles.label}>{label}</p>
    </div>
  );
}