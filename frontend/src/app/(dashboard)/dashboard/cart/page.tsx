"use client";

import { useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";

import styles from "./CartPage.module.scss";
import { stripeApi } from "@/lib/api/endpoints";
import { EmptyCart } from "@/components/carts/EmptyCart";
import { CartItem } from "@/components/carts/CartItem";
import { OrderSummary } from "@/components/carts/OrderSummary";

export default function CartPage() {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    try {
      const payload = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));
      const res = await stripeApi.createCheckoutSession(payload);
      const url = res.data.data?.sessionUrl;
      if (url) {
        clearCart();
        window.location.href = url;
      }
    } catch (err: any) {
      setCheckoutError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>

        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Shopping Cart</h1>
            {totalItems > 0 && (
              <p className={styles.subtitle}>{totalItems} item{totalItems !== 1 ? "s" : ""}</p>
            )}
          </div>
          <Link href="/products" className={styles.backLink}>
            ← Continue shopping
          </Link>
        </div>

        {checkoutError && (
          <div className={styles.errorBanner}>
            <p>{checkoutError}</p>
            <button onClick={() => setCheckoutError(null)} className={styles.errorClose}>✕</button>
          </div>
        )}

        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className={styles.layout}>

            <div className={styles.itemsPanel}>
              <div className={styles.colHeaders}>
                <span>Product</span>
                <span className={styles.colQty}>Quantity</span>
                <span className={styles.colTotal}>Total</span>
                <span />
              </div>

              <div className={styles.itemsList}>
                {items.map((item) => (
                  <CartItem
                    key={item.productId}
                    item={item}
                    onRemove={removeItem}
                    onUpdateQuantity={updateQuantity}
                  />
                ))}
              </div>

              <div className={styles.panelFooter}>
                <button onClick={clearCart} className={styles.clearBtn}>
                  Clear cart
                </button>
              </div>
            </div>

            <OrderSummary
              totalItems={totalItems}
              totalPrice={totalPrice}
              onCheckout={handleCheckout}
              isLoading={checkoutLoading}
            />
          </div>
        )}

      </div>
    </div>
  );
}