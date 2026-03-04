import { CartItem as CartItemType } from "@/types";
import styles from "./CartItem.module.scss";
import { formatPrice } from "@/utils/format";

interface CartItemProps {
  item: CartItemType;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
}

export function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const { product, quantity, productId } = item;

  const handleDecrement = () => {
    if (quantity <= 1) {
      onRemove(productId);
    } else {
      onUpdateQuantity(productId, quantity - 1);
    }
  };

  const handleIncrement = () => {
    onUpdateQuantity(productId, quantity + 1);
  };

  return (
    <div className={styles.item}>
      <div className={styles.image}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <span className={styles.imageFallback}>🧴</span>
        )}
      </div>

      <div className={styles.info}>
        <p className={styles.name}>{product.name}</p>
        {product.description && (
          <p className={styles.description}>{product.description}</p>
        )}
        <p className={styles.unitPrice}>{formatPrice(product.price)} each</p>
      </div>

      <div className={styles.controls}>
        <button
          className={styles.qtyBtn}
          onClick={handleDecrement}
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className={styles.qty}>{quantity}</span>
        <button
          className={styles.qtyBtn}
          onClick={handleIncrement}
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      <span className={styles.subtotal}>
        {formatPrice(product.price * quantity)}
      </span>

      <button
        className={styles.removeBtn}
        onClick={() => onRemove(productId)}
        aria-label="Remove item"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}