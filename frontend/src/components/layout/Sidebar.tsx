'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Package,
  Store,
  MessageSquare,
  ShoppingBag,
  FileText,
  Users,
  Settings,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path: string) => pathname === path;

  const userLinks = [
    { href: '/dashboard', label: 'Главная', icon: Home },
    { href: '/dashboard/products', label: 'Товары', icon: Package },
    { href: '/dashboard/shops', label: 'Магазины', icon: Store },
    { href: '/dashboard/messages', label: 'Сообщения', icon: MessageSquare },
    { href: '/dashboard/orders', label: 'Заказы', icon: ShoppingBag },
  ];

  const ownerLinks = [
    { href: '/dashboard/my-products', label: 'Мои товары', icon: Package },
    { href: '/dashboard/my-shop', label: 'Мой магазин', icon: Store },
    { href: '/dashboard/my-orders', label: 'Заказы товаров', icon: ShoppingBag },
  ];

  const adminLinks = [
    { href: '/dashboard/admin/requests', label: 'Заявки', icon: FileText },
    { href: '/dashboard/admin/users', label: 'Пользователи', icon: Users },
  ];

  return (
    <aside>
      <nav>
        <div>
          <p>Основное</p>
          <ul>
            {userLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link href={link.href}>
                    <Icon />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {user?.role === 'USER' && (
          <div>
            <Link href="/dashboard/owner-request">
              Стать владельцем
            </Link>
          </div>
        )}

        {(user?.role === 'OWNER' || user?.role === 'ADMIN') && (
          <div>
            <p>Владелец</p>
            <ul>
              {ownerLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <Icon />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {user?.role === 'ADMIN' && (
          <div>
            <p>Администратор</p>
            <ul>
              {adminLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <Icon />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div>
          <Link href="/dashboard/settings">
            <Settings />
            <span>Настройки</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}