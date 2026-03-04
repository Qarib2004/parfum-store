import styles from "./SkeletonCard.module.scss";

export function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={`${styles.bone} ${styles.short}`} />
        <div className={`${styles.bone} ${styles.badge}`} />
      </div>
      <div className={styles.body}>
        <div className={styles.avatars}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.avatar} />
          ))}
        </div>
        <div className={styles.info}>
          <div className={`${styles.bone} ${styles.title}`} />
          <div className={`${styles.bone} ${styles.sub}`} />
        </div>
        <div className={`${styles.bone} ${styles.price}`} />
      </div>
      <div className={`${styles.bone} ${styles.action}`} />
    </div>
  );
}