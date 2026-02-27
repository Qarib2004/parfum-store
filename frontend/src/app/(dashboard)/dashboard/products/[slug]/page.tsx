'use client';

import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  Store,
  MessageSquare,
  Plus,
  Minus,
  ArrowLeft,
} from 'lucide-react';
import { formatPrice, formatRelativeDate } from '@/lib/utils';
import { useProduct } from '@/hooks/useProduct';
import style from './product-details.module.scss';

export default function ProductDetailPage({ params }: { params: { slug: string } }) {
  const { product, isLoading } = useProduct(undefined, params.slug);
  const { addItem } = useCartStore();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (product) {
      addItem({ productId: product.id, product, quantity });
    }
  };

  const incrementQuantity = () => {
    if (product && quantity < product.quantity) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  if (isLoading) {
    return (
      <div className={style.statePage}>
        <div className={style.skeleton} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={style.statePage}>
        <h2 className={style.stateTitle}>Product not found</h2>
        <Link href="/dashboard/products" className={style.stateLink}>
          Back to products
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === product.ownerId;

  return (
    <div className={style.page}>

      <Link href="/dashboard/products" className={style.backLink}>
        <ArrowLeft size={16} />
        Back to products
      </Link>

      <div className={style.layout}>

        <div className={style.imgCol}>
          <div className={style.imgWrap}>
            {product.imageUrl ? (
              <img className={style.img} src={product.imageUrl} alt={product.name} />
            ) : (
              <div className={style.imgPlaceholder}>
                <Package size={48} />
              </div>
            )}
          </div>
        </div>

        <div className={style.infoCol}>

          <div className={style.badges}>
            <span className={style.badge}>{product.fragranceType}</span>
            {product.quantity === 0 && (
              <span className={`${style.badge} ${style.badgeOut}`}>Out of stock</span>
            )}
          </div>

          <h1 className={style.name}>{product.name}</h1>

          <div className={style.specs}>
            <div className={style.specRow}>
              <span className={style.specLabel}>Brand</span>
              <span className={style.specValue}>{product.brand}</span>
            </div>
            <div className={style.specRow}>
              <span className={style.specLabel}>Volume</span>
              <span className={style.specValue}>{product.volume}ml</span>
            </div>
          </div>

          {product.description && (
            <div className={style.description}>
              <h3 className={style.descTitle}>Description</h3>
              <p className={style.descText}>{product.description}</p>
            </div>
          )}

          <div className={style.priceRow}>
            <span className={style.price}>{formatPrice(product.price)}</span>
            {product.quantity > 0 && (
              <span className={style.stock}>{product.quantity} in stock</span>
            )}
          </div>

          {!isOwner && product.quantity > 0 && (
            <div className={style.cartSection}>
              <div className={style.qtyWrap}>
                <span className={style.qtyLabel}>Quantity</span>
                <div className={style.qtyControls}>
                  <button
                    className={style.qtyBtn}
                    onClick={decrementQuantity}
                    disabled={quantity === 1}
                  >
                    <Minus size={14} />
                  </button>
                  <span className={style.qtyValue}>{quantity}</span>
                  <button
                    className={style.qtyBtn}
                    onClick={incrementQuantity}
                    disabled={quantity === product.quantity}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              <button className={style.addBtn} onClick={handleAddToCart}>
                <ShoppingCart size={18} />
                Add to cart
              </button>
            </div>
          )}

          {isOwner && (
            <div className={style.ownerBar}>
              <p className={style.ownerBarNote}>This is your product</p>
              <Link
                href={`/dashboard/my-products/edit/${product.id}`}
                className={style.editBtn}
              >
                Edit product
              </Link>
            </div>
          )}

          {product.owner && (
            <div className={style.seller}>
              <h3 className={style.sellerTitle}>Seller</h3>
              <div className={style.sellerBody}>
                <div className={style.sellerProfile}>
                  {product.owner.avatar ? (
                    <img
                      className={style.sellerAvatar}
                      src={product.owner.avatar}
                      alt={product.owner.username}
                    />
                  ) : (
                    <div className={style.sellerAvatarFallback}>
                      {product.owner.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className={style.sellerMeta}>
                    <p className={style.sellerName}>{product.owner.username}</p>
                    {product.owner.shop && (
                      <Link
                        href={`/dashboard/shops/${product.owner.shop.slug}`}
                        className={style.shopLink}
                      >
                        <Store size={13} />
                        Visit shop
                      </Link>
                    )}
                  </div>
                </div>

                {!isOwner && (
                  <Link
                    href={`/dashboard/messages/${product.owner.id}`}
                    className={style.msgBtn}
                  >
                    <MessageSquare size={15} />
                    Message seller
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className={style.meta}>
            <p className={style.metaText}>Added {formatRelativeDate(product.createdAt)}</p>
            {product.updatedAt !== product.createdAt && (
              <p className={style.metaText}>Updated {formatRelativeDate(product.updatedAt)}</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}