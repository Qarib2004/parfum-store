'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/products/ProductCard';
import { Search, Filter, X } from 'lucide-react';
import { FRAGRANCE_TYPES } from '@/lib/constants';
import { useProducts } from '@/hooks/useProduct';
import style from './product-page.module.scss';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [minPrice, setMinPrice] = useState<number>();
  const [maxPrice, setMaxPrice] = useState<number>();
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const { products, pagination, isLoading } = useProducts({
    page,
    limit: 12,
    search: search || undefined,
    brand: selectedBrand || undefined,
    fragranceType: selectedType || undefined,
    minPrice,
    maxPrice,
  });

  const handleClearFilters = () => {
    setSearch('');
    setSelectedBrand('');
    setSelectedType('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setPage(1);
  };

  const hasActiveFilters = search || selectedBrand || selectedType || minPrice || maxPrice;

  return (
    <div className={style.page}>

      <div className={style.header}>
        <h1 className={style.headerTitle}>All products</h1>
        <p className={style.headerSub}>Find your perfect fragrance</p>
      </div>

      <div className={style.toolbar}>

        <div className={style.searchWrap}>
          <Search size={16} className={style.searchIcon} />
          <input
            className={style.searchInput}
            type="text"
            placeholder="Search by name or brand..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <button
          className={`${style.filterToggle} ${filtersOpen ? style.filterToggleActive : ''}`}
          onClick={() => setFiltersOpen((v) => !v)}
        >
          <Filter size={15} />
          Filters
          {hasActiveFilters && <span className={style.filterDot} />}
        </button>

        <div className={`${style.filters} ${filtersOpen ? style.filtersOpen : ''}`}>

          <div className={style.filterGroup}>
            <label className={style.filterLabel}>Brand</label>
            <input
              className={style.filterInput}
              type="text"
              placeholder="Enter brand..."
              value={selectedBrand}
              onChange={(e) => { setSelectedBrand(e.target.value); setPage(1); }}
            />
          </div>

          <div className={style.filterGroup}>
            <label className={style.filterLabel}>Fragrance type</label>
            <select
              className={style.filterSelect}
              value={selectedType}
              onChange={(e) => { setSelectedType(e.target.value); setPage(1); }}
            >
              <option value="">All types</option>
              {FRAGRANCE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className={style.filterGroup}>
            <label className={style.filterLabel}>Price</label>
            <div className={style.priceRange}>
              <input
                className={style.filterInput}
                type="number"
                placeholder="Min"
                value={minPrice || ''}
                onChange={(e) => { setMinPrice(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
              />
              <span className={style.priceSep}>—</span>
              <input
                className={style.filterInput}
                type="number"
                placeholder="Max"
                value={maxPrice || ''}
                onChange={(e) => { setMaxPrice(e.target.value ? Number(e.target.value) : undefined); setPage(1); }}
              />
            </div>
          </div>

          {hasActiveFilters && (
            <button className={style.clearBtn} onClick={handleClearFilters}>
              <X size={14} />
              Clear filters
            </button>
          )}
        </div>
      </div>

      <div className={style.results}>
        {isLoading ? (
          <div className={style.grid}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={style.skeleton} />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <>
            <p className={style.total}>
              {pagination?.total || 0} products found
            </p>

            <div className={style.grid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className={style.pagination}>
                <button
                  className={style.pageBtn}
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </button>

                <span className={style.pageInfo}>
                  Page {page} of {pagination.totalPages}
                </span>

                <button
                  className={style.pageBtn}
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={style.empty}>
            <h3 className={style.emptyTitle}>No products found</h3>
            <p className={style.emptyDesc}>Try adjusting your search or filters</p>
            {hasActiveFilters && (
              <button className={style.clearBtn} onClick={handleClearFilters}>
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
}