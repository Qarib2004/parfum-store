import Link from "next/link";
import styles from "./EmptyCart.module.scss";

export function EmptyCart() {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>🛒</span>
      <h2 className={styles.title}>Your cart is empty</h2>
      <p className={styles.subtitle}>Looks like you haven't added anything yet</p>
      <Link href="/products" className={styles.cta}>
        Browse products
      </Link>
    </div>
  );
}