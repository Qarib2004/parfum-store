'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useMyShop } from '@/hooks/useMyShop';
import { Package, Store, MapPin, ArrowRight } from 'lucide-react';
import { useProducts } from '@/hooks/useProduct';
import { formatRelativeDate } from '@/lib/utils';
import style from './my-shop.module.scss';

export default function MyShopPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { shop, isLoading, error } = useMyShop();
  const { products, pagination } = useProducts({ ownerId: user?.id, limit: 6 });

  useEffect(() => {
    if (user && user.role !== 'OWNER' && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
    return (
      <div className={style.statePage}>
        <p className={style.stateText}>You don't have a shop. This page is only for owners.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={style.statePage}>
        <div className={style.skeleton} />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className={style.statePage}>
        <p className={style.stateText}>Shop not found. Please contact support.</p>
      </div>
    );
  }

  return (
    <div className={style.page}>

      <div className={style.header}>
        <div className={style.headerMain}>
          <div className={style.logoWrap}>
            {shop.logoUrl ? (
              <img className={style.logoImg} src={shop.logoUrl} alt={shop.name} />
            ) : (
              <div className={style.logoPlaceholder}>
                <Store size={26} />
              </div>
            )}
          </div>
          <div>
            <h1 className={style.title}>{shop.name}</h1>
            {shop.address && (
              <p className={style.address}>
                <MapPin size={14} /> {shop.address}
              </p>
            )}
          </div>
        </div>
        <div className={style.headerMeta}>
          <p className={style.metaText}>Created {formatRelativeDate(shop.createdAt)}</p>
          <Link href={`/dashboard/shops/${shop.id}`} className={style.viewPublic}>
            View public page
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {shop.description && (
        <div className={style.about}>
          <h2 className={style.sectionTitle}>About shop</h2>
          <p className={style.aboutText}>{shop.description}</p>
        </div>
      )}

      <div className={style.productsSection}>
        <div className={style.productsHeader}>
          <h2 className={style.sectionTitle}>Products in this shop</h2>
          <Link href="/dashboard/my-products" className={style.manageLink}>
            Manage products
          </Link>
        </div>

        {products && products.length > 0 ? (
          <div className={style.productsGrid}>
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/dashboard/products/${product.slug}`}
                className={style.productCard}
              >
                <div className={style.productThumb}>
                  {product.imageUrl ? (
                    <img className={style.productImg} src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className={style.productPlaceholder}>
                      <Package size={22} />
                    </div>
                  )}
                </div>
                <div className={style.productBody}>
                  <p className={style.productName}>{product.name}</p>
                  <p className={style.productBrand}>{product.brand}</p>
                  <p className={style.productMetaRow}>
                    <span>{product.volume}ml</span>
                    <span>{product.quantity} pcs</span>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={style.empty}>
            <p className={style.emptyTitle}>No products yet</p>
            <p className={style.emptyDesc}>Start by adding your first product to the catalog.</p>
            <Link href="/dashboard/products/add" className={style.addBtn}>
              Add product
            </Link>
          </div>
        )}

        {pagination && pagination.total > products.length && (
          <div className={style.moreRow}>
            <p className={style.moreText}>
              Showing {products.length} of {pagination.total} products
            </p>
            <Link href="/dashboard/my-products" className={style.moreLink}>
              View all
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}

