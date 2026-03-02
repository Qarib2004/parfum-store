'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Product, Shop } from '@/types';
import { ProductCard } from '@/components/products/ProductCard';
import { Store, MapPin, ArrowLeft } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import style from './shop-details.module.scss';
import { shopApi } from '@/lib/api/endpoints';

export default function ShopDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug && params.slug !== 'null' ? params.slug : null;

  const { data: shopData, isLoading: shopLoading } = useQuery({
    queryKey: ['shop', slug],
    queryFn: async () => {
      const response = await shopApi.getShopBySlug(slug!);
      return response.data.data as Shop;
    },
    enabled: !!slug,
  });
  
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['shopProducts', slug],
    queryFn: async () => {
      const response = await shopApi.getShopProductsBySlug(slug!, { page: 1, limit: 12 });
      return response.data.data as { products: Product[]; pagination: any };
    },
    enabled: !!slug,
  });

  const loading = shopLoading || productsLoading;
  const shop = shopData;
  const products = productsData?.products || [];
  const pagination = productsData?.pagination;

  if (loading) {
    return (
      <div className={style.statePage}>
        <div className={style.skeleton} />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className={style.statePage}>
        <h2 className={style.stateTitle}>Shop not found</h2>
        <Link href="/dashboard/shops" className={style.stateLink}>
          Back to stores
        </Link>
      </div>
    );
  }

  return (
    <div className={style.page}>

      <div className={style.topBar}>
        <Link href="/dashboard/shops" className={style.backLink}>
          <ArrowLeft size={16} />
          Back to stores
        </Link>
      </div>

      <header className={style.header}>
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
                <MapPin size={14} />
                <span>{shop.address}</span>
              </p>
            )}
            <p className={style.meta}>Created {formatRelativeDate(shop.createdAt)}</p>
          </div>
        </div>
      </header>

      {shop.description && (
        <section className={style.about}>
          <h2 className={style.sectionTitle}>About</h2>
          <p className={style.aboutText}>{shop.description}</p>
        </section>
      )}

      <section className={style.productsSection}>
        <div className={style.productsHeader}>
          <h2 className={style.sectionTitle}>Products</h2>
          {pagination && (
            <p className={style.productsMeta}>
              {pagination.total} products in this shop
            </p>
          )}
        </div>

        {products.length > 0 ? (
          <div className={style.grid}>
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className={style.empty}>
            <p className={style.emptyTitle}>No products yet</p>
            <p className={style.emptyDesc}>This shop has no products in the catalog.</p>
          </div>
        )}
      </section>

    </div>
  );
}

