import styles from "./SkeletonRow.module.scss";

export function SkeletonRow() {
  return (
    <div className={styles.row}>
      <div className={styles.thumbs}>
        <div className={styles.thumb} />
        <div className={styles.thumb} />
      </div>
      <div className={styles.info}>
        <div className={`${styles.bone} ${styles.short}`} />
        <div className={`${styles.bone} ${styles.title}`} />
        <div className={`${styles.bone} ${styles.sub}`} />
      </div>
      <div className={`${styles.bone} ${styles.date}`} />
      <div className={`${styles.bone} ${styles.amount}`} />
      <div className={`${styles.bone} ${styles.action}`} />
    </div>
  );
}