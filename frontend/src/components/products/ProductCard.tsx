import Link from "next/link";
import { Product } from "@/types";
import { Package, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";
import style from "./product-card.module.scss";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      product: product,
      quantity: 1,
    });
  };

  return (
    <Link href={`/dashboard/products/${product.slug}`} className={style.link}>
      <article className={style.card}>
        <div className={style.imgWrap}>
          {product.imageUrl ? (
            <img
              className={style.img}
              src={product.imageUrl}
              alt={product.name}
            />
          ) : (
            <div className={style.imgPlaceholder}>
              <Package size={32} />
            </div>
          )}

          {product.quantity === 0 && (
            <div className={style.outOfStock}>
              <span>Out of stock</span>
            </div>
          )}
        </div>

        <div className={style.info}>
          <div className={style.header}>
            <h3 className={style.name}>{product.name}</h3>
            <p className={style.brand}>{product.brand}</p>
          </div>

          <div className={style.tags}>
            <span className={style.tag}>{product.fragranceType}</span>
            <span className={style.tag}>{product.volume}ml</span>
          </div>

          {product.owner && (
            <div className={style.seller}>
              <span className={style.sellerLabel}>Seller:</span>
              <Link
                href={`/dashboard/shops/${product.owner.id}`}
                className={style.sellerLink}
                onClick={(e) => e.stopPropagation()}
              >
                {product.owner.username}
              </Link>
            </div>
          )}

          <div className={style.footer}>
            <span className={style.price}>{formatPrice(product.price)}</span>

            <button
              className={style.cartBtn}
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
            >
              <ShoppingCart size={15} />
              Add to cart
            </button>
          </div>

          {product.quantity > 0 && product.quantity < 10 && (
            <p className={style.lowStock}>Only {product.quantity} left</p>
          )}
        </div>
      </article>
    </Link>
  );
}
