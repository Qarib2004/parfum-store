'use client';

import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { orderApi, shopApi } from '@/lib/api/endpoints';
import Link from 'next/link';
import { 
  Package, 
  Store, 
  ShoppingBag, 
  TrendingUp,
  Users,
  MessageSquare 
} from 'lucide-react';
import { useProduct, useProducts } from '@/hooks/useProduct';

export default function DashboardPage() {
  const { user } = useAuth();

  // Получаем последние продукты
  const { products, isLoading: productsLoading } = useProducts({ limit: 6 });

  // Получаем статистику заказов
  const { data: orderStats } = useQuery({
    queryKey: ['orderStats'],
    queryFn: async () => {
      const response = await orderApi.getOrderStats();
      return response.data.data;
    },
    enabled: !!user,
  });

  // Получаем магазины (первые 3)
  const { data: shopsData } = useQuery({
    queryKey: ['shops', { limit: 3 }],
    queryFn: async () => {
      const response = await shopApi.getAllShops({ limit: 3 });
      return response.data.data;
    },
  });

  return (
    <div>
      <div>
        <h1>Добро пожаловать, {user?.username}!</h1>
        <p>Рады видеть вас снова</p>
      </div>

      {/* Статистические карточки */}
      <div>
        <div>
          <div>
            <Package />
          </div>
          <div>
            <p>Всего товаров</p>
            <h3>{products?.length || 0}</h3>
          </div>
        </div>

        <div>
          <div>
            <Store />
          </div>
          <div>
            <p>Магазины</p>
            <h3>{shopsData?.shops?.length || 0}</h3>
          </div>
        </div>

        <div>
          <div>
            <ShoppingBag />
          </div>
          <div>
            <p>Заказы</p>
            <h3>{orderStats?.total || 0}</h3>
          </div>
        </div>

        <div>
          <div>
            <TrendingUp />
          </div>
          <div>
            <p>Выручка</p>
            <h3>${orderStats?.totalRevenue?.toFixed(2) || '0.00'}</h3>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <div>
        <h2>Быстрые действия</h2>
        <div>
          {user?.role === 'USER' && (
            <Link href="/dashboard/owner-request">
              <Users />
              <div>
                <h3>Стать владельцем</h3>
                <p>Подать заявку на статус владельца магазина</p>
              </div>
            </Link>
          )}

          {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
            <Link href="/dashboard/products/add">
              <Package />
              <div>
                <h3>Добавить товар</h3>
                <p>Создать новый товар в каталоге</p>
              </div>
            </Link>
          )}

          <Link href="/dashboard/products">
            <Store />
            <div>
              <h3>Просмотреть товары</h3>
              <p>Посмотреть все доступные товары</p>
            </div>
          </Link>

          <Link href="/dashboard/messages">
            <MessageSquare />
            <div>
              <h3>Сообщения</h3>
              <p>Связаться с продавцами</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Последние товары */}
      <div>
        <div>
          <h2>Последние товары</h2>
          <Link href="/dashboard/products">
            Посмотреть все
          </Link>
        </div>

        {productsLoading ? (
          <div>
            <p>Загрузка товаров...</p>
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
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                      />
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

      {/* Популярные магазины */}
      {shopsData?.shops && shopsData.shops.length > 0 && (
        <div>
          <div>
            <h2>Популярные магазины</h2>
            <Link href="/dashboard/shops">
              Посмотреть все
            </Link>
          </div>

          <div>
            {shopsData.shops.map((shop) => (
              <Link 
                key={shop.id} 
                href={`/dashboard/shops/${shop.slug}`}
              >
                <div>
                  {shop.logoUrl ? (
                    <img 
                      src={shop.logoUrl} 
                      alt={shop.name}
                    />
                  ) : (
                    <Store />
                  )}
                </div>
                <div>
                  <h3>{shop.name}</h3>
                  {shop.description && (
                    <p>{shop.description}</p>
                  )}
                  {shop.address && (
                    <p>{shop.address}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Статус заявки для USER */}
      {user?.role === 'USER' && (
        <div>
          <div>
            <Users />
          </div>
          <div>
            <h3>Хотите продавать товары?</h3>
            <p>Подайте заявку на статус владельца магазина. Минимальные требования: 15 уникальных ароматов по 7 штук каждого.</p>
            <Link href="/dashboard/owner-request">
              Подать заявку
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}