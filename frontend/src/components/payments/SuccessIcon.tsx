import styles from "./SuccessIcon.module.scss";

export function SuccessIcon() {
  return (
    <div className={styles.circle}>
      <svg className={styles.checkmark} viewBox="0 0 52 52" fill="none">
        <circle className={styles.ring} cx="26" cy="26" r="24" stroke="currentColor" strokeWidth="2" />
        <path className={styles.check} d="M14 26l8 8 16-16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}