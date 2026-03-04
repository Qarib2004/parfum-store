"use client";

import Link from "next/link";
import { useShops } from "@/hooks/useShops";
import styles from "./FeaturedShops.module.scss";

export function FeaturedShops() {
  const { shopsData, isLoading } = useShops(3);
  const shops = shopsData?.shops ?? shopsData ?? [];

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div>
          <p className={styles.eyebrow}>Marketplace</p>
          <h2 className={styles.heading}>Our sellers</h2>
        </div>
        <Link href="/shops" className={styles.viewAll}>
          All shops →
        </Link>
      </div>

      <div className={styles.grid}>
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeleton}>
                <div className={styles.skeletonAvatar} />
                <div className={styles.skeletonBody}>
                  <div className={`${styles.bone} ${styles.boneName}`} />
                  <div className={`${styles.bone} ${styles.boneSub}`} />
                </div>
              </div>
            ))
          : (shops as any[]).map((shop) => (
              <Link
                key={shop.id}
                href={`/shops/${shop.slug ?? shop.id}`}
                className={styles.card}
              >
                <div className={styles.avatar}>
                  {shop.imageUrl ? (
                    <img src={shop.imageUrl} alt={shop.name} />
                  ) : (
                    <span className={styles.avatarFallback}>
                      {shop.name?.[0]?.toUpperCase() ?? "S"}
                    </span>
                  )}
                </div>

                <div className={styles.info}>
                  <p className={styles.name}>{shop.name}</p>
                  {shop.description && (
                    <p className={styles.desc}>{shop.description}</p>
                  )}
                  {shop._count?.products != null && (
                    <p className={styles.meta}>
                      {shop._count.products} products
                    </p>
                  )}
                </div>

                <span className={styles.arrow}>→</span>
              </Link>
            ))}
      </div>
    </section>
  );
}