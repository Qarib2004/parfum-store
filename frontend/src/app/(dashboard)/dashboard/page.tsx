"use client";

import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { orderApi, shopApi } from "@/lib/api/endpoints";
import Link from "next/link";
import {
  Package,
  Store,
  ShoppingBag,
  TrendingUp,
  Users,
  MessageSquare,
} from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProduct";
import style from "./page.module.scss";
import { useShops } from "@/hooks/useShops";
import { useOrderStats } from "@/hooks/useOrderStats";

export default function DashboardPage() {
  const { user } = useAuth();

  const { products, isLoading: productsLoading } = useProducts({ limit: 6 });
  const { shopsData, isLoading: shopsLoading, error: shopsError } = useShops(3);
  const { orderStats, isLoading: statsLoading } = useOrderStats(!!user);

  if (productsLoading || shopsLoading || statsLoading) return <p>Loading...</p>;
  if (shopsError) return <p>Error loading shops</p>;

  return (
    <div>
      <div>
        <h1>Welcome, {user?.username}!</h1>
        <p>Glad to see you again</p>
      </div>

      <div>
        <div>
          <div>
            <Package />
          </div>
          <div>
            <p>Total products</p>
            <h3>{products?.length || 0}</h3>
          </div>
        </div>

        <div>
          <div>
            <Store />
          </div>
          <div>
            <p>Stores</p>
            <h3>{shopsData?.shops?.length || 0}</h3>
          </div>
        </div>

        <div>
          <div>
            <ShoppingBag />
          </div>
          <div>
            <p>Orders</p>
            <h3>{orderStats?.total || 0}</h3>
          </div>
        </div>

        <div>
          <div>
            <TrendingUp />
          </div>
          <div>
            <p>Revenue</p>
            <h3>${orderStats?.totalRevenue?.toFixed(2) || "0.00"}</h3>
          </div>
        </div>
      </div>

      <div>
        <h2>Quick Actions</h2>
        <div>
          {user?.role === "USER" && (
            <Link href="/dashboard/owner-request">
              <Users />
              <div>
                <h3>Become an owner</h3>
                <p>Apply to become a store owner</p>
              </div>
            </Link>
          )}

          {(user?.role === "OWNER" || user?.role === "ADMIN") && (
            <Link href="/dashboard/products/add">
              <Package />
              <div>
                <h3>Add product</h3>
                <p>Create a new product in the catalog</p>
              </div>
            </Link>
          )}

          <Link href="/dashboard/products">
            <Store />
            <div>
              <h3>View products</h3>
              <p>View all available products</p>
            </div>
          </Link>

          <Link href="/dashboard/messages">
            <MessageSquare />
            <div>
              <h3>Messages</h3>
              <p>Contact sellers</p>
            </div>
          </Link>
        </div>
      </div>

      <div>
        <div>
          <h2>Latest products</h2>
          <Link href="/dashboard/products">View all</Link>
        </div>

        {productsLoading ? (
          <div>
            <p>Loading products...</p>
          </div>
        ) : (
          <div>
            {products && products.length > 0 ? (
              products.map((product) => (
                <Link
                  key={product.id}
                  href={`/dashboard/products/${product.slug}`}
                >
                  <div>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} />
                    ) : (
                      <div>
                        <Package />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3>{product.name}</h3>
                    <p>{product.brand}</p>
                    <div>
                      <span>${product.price}</span>
                      <span>{product.volume}ml</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div>
                <p>Товары не найдены</p>
              </div>
            )}
          </div>
        )}
      </div>

      {shopsData?.shops && shopsData.shops.length > 0 && (
        <div>
          <div>
            <h2>Popular stores</h2>
            <Link href="/dashboard/shops">View all</Link>
          </div>

          <div>
            {shopsData.shops.map((shop) => (
              <Link key={shop.id} href={`/dashboard/shops/${shop.slug}`}>
                <div>
                  {shop.logoUrl ? (
                    <img src={shop.logoUrl} alt={shop.name} />
                  ) : (
                    <Store />
                  )}
                </div>
                <div>
                  <h3>{shop.name}</h3>
                  {shop.description && <p>{shop.description}</p>}
                  {shop.address && <p>{shop.address}</p>}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {user?.role === "USER" && (
        <div>
          <div>
            <Users />
          </div>
          <div>
            <h3>Do you want to sell products?</h3>
            <p>
              Apply to become a store owner. Minimum requirements: 15 unique
              fragrances, 7 units of each.
            </p>
            <Link href="/dashboard/owner-request">Apply now</Link>
          </div>
        </div>
      )}
    </div>
  );
}
