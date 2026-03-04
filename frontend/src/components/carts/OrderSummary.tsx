import { formatPrice } from "@/utils/format";
import styles from "./OrderSummary.module.scss";

interface OrderSummaryProps {
  totalItems: number;
  totalPrice: number;
  onCheckout: () => void;
  isLoading: boolean;
}

const SHIPPING_THRESHOLD = 100;
const SHIPPING_COST = 9.99;

export function OrderSummary({
  totalItems,
  totalPrice,
  onCheckout,
  isLoading,
}: OrderSummaryProps) {
  const isFreeShipping = totalPrice >= SHIPPING_THRESHOLD;
  const shipping = isFreeShipping ? 0 : SHIPPING_COST;
  const grandTotal = totalPrice + shipping;
  const progressPct = Math.min((totalPrice / SHIPPING_THRESHOLD) * 100, 100);

  return (
    <div className={styles.summary}>
      <h2 className={styles.title}>Order Summary</h2>

      <div className={styles.lines}>
        <div className={styles.line}>
          <span className={styles.lineLabel}>Subtotal ({totalItems} items)</span>
          <span className={styles.lineValue}>{formatPrice(totalPrice)}</span>
        </div>
        <div className={styles.line}>
          <span className={styles.lineLabel}>Shipping</span>
          <span className={`${styles.lineValue} ${isFreeShipping ? styles.free : ""}`}>
            {isFreeShipping ? "Free" : formatPrice(SHIPPING_COST)}
          </span>
        </div>
      </div>

      {!isFreeShipping && (
        <div className={styles.shippingProgress}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
          <p className={styles.progressText}>
            Add <strong>{formatPrice(SHIPPING_THRESHOLD - totalPrice)}</strong> more for free shipping
          </p>
        </div>
      )}

      <div className={styles.divider} />

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalValue}>{formatPrice(grandTotal)}</span>
      </div>

      <button
        className={styles.checkoutBtn}
        onClick={onCheckout}
        disabled={isLoading || totalItems === 0}
      >
        {isLoading ? (
          <span className={styles.spinner} />
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Proceed to Checkout
          </>
        )}
      </button>

      <div className={styles.trust}>
        <span>🔒 Secure payment via Stripe</span>
      </div>
    </div>
  );
}