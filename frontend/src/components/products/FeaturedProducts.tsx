"use client";

import Link from "next/link";
import { useProducts } from "@/hooks/useProduct";
import styles from "./FeaturedProducts.module.scss";
import { useCartStore } from "@/store/cartStore";

function formatPrice(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export function FeaturedProducts() {
  const { products, isLoading } = useProducts({ limit: 4 });
  const addItem = useCartStore((s) => s.addItem);

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.eyebrow}>Featured</p>
          <h2 className={styles.heading}>New arrivals</h2>
        </div>
        <Link href="/products" className={styles.viewAll}>
          View all →
        </Link>
      </div>

      <div className={styles.grid}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className={styles.skeleton}>
                <div className={styles.skeletonImage} />
                <div className={styles.skeletonBody}>
                  <div className={`${styles.bone} ${styles.boneName}`} />
                  <div className={`${styles.bone} ${styles.boneSub}`} />
                  <div className={`${styles.bone} ${styles.bonePrice}`} />
                </div>
              </div>
            ))
          : products.slice(0, 4).map((product) => (
              <div key={product.id} className={styles.card}>
                <Link href={`/products/${product.slug ?? product.id}`} className={styles.cardImage}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <span className={styles.cardFallback}>✦</span>
                  )}
                  <div className={styles.cardOverlay}>
                    <span>View product</span>
                  </div>
                </Link>

                <div className={styles.cardBody}>
                  <div className={styles.cardInfo}>
                    <p className={styles.cardName}>{product.name}</p>
                    {product.brand && (
                      <p className={styles.cardBrand}>{product.brand}</p>
                    )}
                  </div>
                  <div className={styles.cardFooter}>
                    <span className={styles.cardPrice}>{formatPrice(product.price)}</span>
                    <button
                      className={styles.addBtn}
                      onClick={() =>
                        addItem({ productId: product.id, product, quantity: 1 })
                      }
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}