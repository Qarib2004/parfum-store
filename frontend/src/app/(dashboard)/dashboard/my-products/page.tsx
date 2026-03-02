"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Plus, Package, Edit, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useOwnerProducts } from "@/hooks/useProduct";
import style from "./my-products.module.scss";
import { toast } from "sonner";

export default function MyProductsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { products, stats, isLoading, deleteProduct, isDeleting } =
    useOwnerProducts();

  useEffect(() => {
    if (user && user.role !== "OWNER" && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleDeleteProduct = (id: string, brand: string) => {
    toast.warning(`Delete product "${brand}"?`, {
      description: "This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => {
          deleteProduct(id, {
            onSuccess: () => {
              toast.success("Product deleted successfully.");
            },
            onError: (error) => {
              toast.error("Failed to delete product.", {
                description:
                  (error as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message || "Please try again later.",
              });
            },
          });
        },
      },
      cancel: <button onClick={() => toast.dismiss()}>Cancel</button>,
    });
  };

  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
    return (
      <div className={style.denied}>
        <p className={style.deniedText}>
          You don't have permission to view this page
        </p>
      </div>
    );
  }

  return (
    <div className={style.page}>
      <div className={style.header}>
        <div>
          <h1 className={style.headerTitle}>My products</h1>
          <p className={style.headerSub}>Manage your product listings</p>
        </div>
        <Link href="/dashboard/products/add" className={style.addBtn}>
          <Plus size={16} />
          Add product
        </Link>
      </div>

      {stats && (
        <div className={style.stats}>
          <div className={style.statCard}>
            <p className={style.statLabel}>Total products</p>
            <h3 className={style.statValue}>{stats.totalProducts}</h3>
          </div>
          <div className={style.statCard}>
            <p className={style.statLabel}>Total quantity</p>
            <h3 className={style.statValue}>{stats.totalQuantity} pcs</h3>
          </div>
          <div className={style.statCard}>
            <p className={style.statLabel}>Average price</p>
            <h3 className={style.statValue}>
              {formatPrice(stats.averagePrice)}
            </h3>
          </div>
          <div className={style.statCard}>
            <p className={style.statLabel}>Unique brands</p>
            <h3 className={style.statValue}>{stats.uniqueBrands}</h3>
          </div>
        </div>
      )}

      <div className={style.tableWrap}>
        {isLoading ? (
          <div className={style.skeletons}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className={style.skeleton} />
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <table className={style.table}>
            <thead>
              <tr>
                <th className={style.th}>Product</th>
                <th className={style.th}>Brand</th>
                <th className={style.th}>Price</th>
                <th className={style.th}>Quantity</th>
                <th className={style.th}>Status</th>
                <th className={style.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className={style.tr}>
                  <td className={style.td}>
                    <div className={style.productCell}>
                      <div className={style.productThumb}>
                        {product.imageUrl ? (
                          <img
                            className={style.productImg}
                            src={product.imageUrl}
                            alt={product.name}
                          />
                        ) : (
                          <div className={style.productImgPlaceholder}>
                            <Package size={16} />
                          </div>
                        )}
                      </div>
                      <div className={style.productMeta}>
                        <Link
                          href={`/dashboard/products/${product.slug}`}
                          className={style.productName}
                        >
                          {product.name}
                        </Link>
                        <p className={style.productSub}>
                          {product.fragranceType} · {product.volume}ml
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className={style.td}>
                    <span className={style.cellText}>{product.brand}</span>
                  </td>

                  <td className={style.td}>
                    <span className={style.price}>
                      {formatPrice(product.price)}
                    </span>
                  </td>

                  <td className={style.td}>
                    <span className={style.cellText}>
                      {product.quantity} pcs
                    </span>
                  </td>

                  <td className={style.td}>
                    {product.quantity > 0 ? (
                      <span className={`${style.badge} ${style.badgeIn}`}>
                        In stock
                      </span>
                    ) : (
                      <span className={`${style.badge} ${style.badgeOut}`}>
                        Out of stock
                      </span>
                    )}
                  </td>

                  <td className={style.td}>
                    <div className={style.actions}>
                      <Link
                        href={`/dashboard/my-products/edit/${product.id}`}
                        className={style.editBtn}
                        title="Edit"
                      >
                        <Edit size={15} />
                      </Link>
                      <button
                        className={style.deleteBtn}
                        onClick={() =>
                          handleDeleteProduct(product.id, product.brand)
                        }
                        disabled={isDeleting}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className={style.empty}>
            <div className={style.emptyIcon}>
              <Package size={28} />
            </div>
            <h3 className={style.emptyTitle}>No products yet</h3>
            <p className={style.emptyDesc}>
              Start by adding your first product
            </p>
            <Link href="/dashboard/products/add" className={style.addBtn}>
              <Plus size={16} />
              Add product
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
