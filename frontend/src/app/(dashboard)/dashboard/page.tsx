"use client";

import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import {
  Package,
  Store,
  ShoppingBag,
  TrendingUp,
  Users,
  MessageSquare,
} from "lucide-react";
import { useProducts } from "@/hooks/useProduct";
import { useShops } from "@/hooks/useShops";
import { useOrderStats } from "@/hooks/useOrderStats";
import style from "./page.module.scss";

export default function DashboardPage() {
  const { user } = useAuth();

  const { products, isLoading: productsLoading } = useProducts({ limit: 6 });
  const { shopsData, isLoading: shopsLoading, error: shopsError } = useShops(3);
  const { orderStats, isLoading: statsLoading } = useOrderStats(!!user);

  if (productsLoading || shopsLoading || statsLoading)
    return <p className={style.stateMsg}>Loading...</p>;
  if (shopsError)
    return <p className={style.stateMsg}>Error loading shops</p>;

  return (
    <div className={style.page}>

      <div className={style.header}>
        <h1 className={style.headerTitle}>Welcome, {user?.username}!</h1>
        <p className={style.headerSub}>Glad to see you again</p>
      </div>

      <div className={style.stats}>
        <div className={style.statCard}>
          <div className={style.statIcon}>
            <Package size={20} />
          </div>
          <div className={style.statInfo}>
            <p className={style.statLabel}>Total products</p>
            <h3 className={style.statValue}>{products?.length || 0}</h3>
          </div>
        </div>

        <div className={style.statCard}>
          <div className={style.statIcon}>
            <Store size={20} />
          </div>
          <div className={style.statInfo}>
            <p className={style.statLabel}>Stores</p>
            <h3 className={style.statValue}>{shopsData?.shops?.length || 0}</h3>
          </div>
        </div>

        <div className={style.statCard}>
          <div className={style.statIcon}>
            <ShoppingBag size={20} />
          </div>
          <div className={style.statInfo}>
            <p className={style.statLabel}>Orders</p>
            <h3 className={style.statValue}>{orderStats?.total || 0}</h3>
          </div>
        </div>

        <div className={style.statCard}>
          <div className={`${style.statIcon} ${style.statIconAccent}`}>
            <TrendingUp size={20} />
          </div>
          <div className={style.statInfo}>
            <p className={style.statLabel}>Revenue</p>
            <h3 className={style.statValue}>
              ${orderStats?.totalRevenue?.toFixed(2) || "0.00"}
            </h3>
          </div>
        </div>
      </div>

      <div className={style.section}>
        <h2 className={style.sectionTitle}>Quick Actions</h2>
        <div className={style.actions}>
          {user?.role === "USER" && (
            <Link href="/dashboard/owner-request" className={style.actionCard}>
              <div className={style.actionIcon}>
                <Users size={20} />
              </div>
              <div>
                <h3 className={style.actionTitle}>Become an owner</h3>
                <p className={style.actionDesc}>Apply to become a store owner</p>
              </div>
            </Link>
          )}

          {(user?.role === "OWNER" || user?.role === "ADMIN") && (
            <Link href="/dashboard/products/add" className={style.actionCard}>
              <div className={style.actionIcon}>
                <Package size={20} />
              </div>
              <div>
                <h3 className={style.actionTitle}>Add product</h3>
                <p className={style.actionDesc}>Create a new product in the catalog</p>
              </div>
            </Link>
          )}

          <Link href="/dashboard/products" className={style.actionCard}>
            <div className={style.actionIcon}>
              <Store size={20} />
            </div>
            <div>
              <h3 className={style.actionTitle}>View products</h3>
              <p className={style.actionDesc}>View all available products</p>
            </div>
          </Link>

          <Link href="/dashboard/messages" className={style.actionCard}>
            <div className={style.actionIcon}>
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className={style.actionTitle}>Messages</h3>
              <p className={style.actionDesc}>Contact sellers</p>
            </div>
          </Link>
        </div>
      </div>

      <div className={style.section}>
        <div className={style.sectionHeader}>
          <h2 className={style.sectionTitle}>Latest products</h2>
          <Link href="/dashboard/products" className={style.viewAll}>View all</Link>
        </div>

        <div className={style.products}>
          {products && products.length > 0 ? (
            products.map((product) => (
              <Link
                key={product.id}
                href={`/dashboard/products/${product.slug}`}
                className={style.productCard}
              >
                <div className={style.productImg}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className={style.productImgPlaceholder}>
                      <Package size={24} />
                    </div>
                  )}
                </div>
                <div className={style.productInfo}>
                  <h3 className={style.productName}>{product.name}</h3>
                  <p className={style.productBrand}>{product.brand}</p>
                  <div className={style.productMeta}>
                    <span className={style.productPrice}>${product.price}</span>
                    <span className={style.productVolume}>{product.volume}ml</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className={style.empty}>
              <p>Products not found</p>
            </div>
          )}
        </div>
      </div>

      {shopsData?.shops && shopsData.shops.length > 0 && (
        <div className={style.section}>
          <div className={style.sectionHeader}>
            <h2 className={style.sectionTitle}>Popular stores</h2>
            <Link href="/dashboard/shops" className={style.viewAll}>View all</Link>
          </div>

          <div className={style.shops}>
            {shopsData.shops.map((shop) => (
              <Link
                key={shop.id}
                href={`/dashboard/shops/${shop.id}`}
                className={style.shopCard}
              >
                <div className={style.shopLogo}>
                  {shop.logoUrl ? (
                    <img src={shop.logoUrl} alt={shop.name} />
                  ) : (
                    <Store size={22} />
                  )}
                </div>
                <div className={style.shopInfo}>
                  <h3 className={style.shopName}>{shop.name}</h3>
                  {shop.description && (
                    <p className={style.shopDesc}>{shop.description}</p>
                  )}
                  {shop.address && (
                    <p className={style.shopAddress}>{shop.address}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {user?.role === "USER" && (
        <div className={style.ownerBanner}>
          <div className={style.ownerBannerIcon}>
            <Users size={24} />
          </div>
          <div className={style.ownerBannerBody}>
            <h3 className={style.ownerBannerTitle}>Do you want to sell products?</h3>
            <p className={style.ownerBannerDesc}>
              Apply to become a store owner. Minimum requirements: 15 unique
              fragrances, 7 units of each.
            </p>
            <Link href="/dashboard/owner-request" className={style.ownerBannerBtn}>
              Apply now
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}