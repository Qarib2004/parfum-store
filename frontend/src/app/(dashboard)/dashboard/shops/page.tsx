'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { shopApi } from '@/lib/api/endpoints';
import { Shop } from '@/types';
import { Search, Store, MapPin } from 'lucide-react';
import style from './shops-page.module.scss';

export default function ShopsPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['shopsList', { page, search }],
    queryFn: async () => {
      const response = await shopApi.getAllShops({
        page,
        limit: 9,
        search: search || undefined,
      });
      return response.data.data;
    },
  });

  const shops: Shop[] = data?.shops || [];
  const pagination = data?.pagination;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className={style.page}>

      <div className={style.header}>
        <h1 className={style.headerTitle}>Stores</h1>
        <p className={style.headerSub}>Discover perfumery shops and their collections</p>
      </div>

      <div className={style.toolbar}>
        <div className={style.searchWrap}>
          <Search size={16} className={style.searchIcon} />
          <input
            className={style.searchInput}
            type="text"
            placeholder="Search by store name..."
            value={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className={style.results}>
        {isLoading ? (
          <div className={style.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={style.skeleton} />
            ))}
          </div>
        ) : shops.length > 0 ? (
          <>
            <div className={style.grid}>
              {shops.map((shop) => (
                <Link
                  key={shop.id}
                  href={`/dashboard/shops/${shop.id}`}
                  className={style.card}
                >
                  <div className={style.logoWrap}>
                    {shop.logoUrl ? (
                      <img className={style.logoImg} src={shop.logoUrl} alt={shop.name} />
                    ) : (
                      <div className={style.logoPlaceholder}>
                        <Store size={22} />
                      </div>
                    )}
                  </div>
                  <div className={style.cardBody}>
                    <h3 className={style.cardTitle}>{shop.name}</h3>
                    {shop.address && (
                      <p className={style.cardAddress}>
                        <MapPin size={13} />
                        <span>{shop.address}</span>
                      </p>
                    )}
                    {shop.description && (
                      <p className={style.cardDesc}>{shop.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className={style.pagination}>
                <button
                  className={style.pageBtn}
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>
                <span className={style.pageInfo}>
                  Page {page} of {pagination.totalPages}
                </span>
                <button
                  className={style.pageBtn}
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={style.empty}>
            <h3 className={style.emptyTitle}>No stores found</h3>
            <p className={style.emptyDesc}>Try changing your search query.</p>
          </div>
        )}
      </div>

    </div>
  );
}

