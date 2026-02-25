'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/store/cartStore';
import { Bell, ShoppingCart, User, LogOut, ChevronDown } from 'lucide-react';
import { useAppNotifications } from '@/hooks/useNotification';
import { useState, useRef, useEffect } from 'react';
import style from './navbar.module.scss';

export function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useAppNotifications();
  const { getTotalItems } = useCartStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cartItemsCount = getTotalItems();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className={style.nav}>
      <div className={style.inner}>

        <Link href="/dashboard" className={style.logo}>
          <span className={style.logoText}>ESSENCE</span>
          <span className={style.logoSub}>parfumerie</span>
        </Link>

        <div className={style.searchWrap}>
          <input
            className={style.search}
            type="search"
            placeholder="Search for products..."
          />
        </div>

        <div className={style.actions}>

          <Link href="/dashboard/notifications" className={style.iconBtn}>
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className={style.badge}>{unreadCount}</span>
            )}
          </Link>

          <Link href="/dashboard/cart" className={style.iconBtn}>
            <ShoppingCart size={20} />
            {cartItemsCount > 0 && (
              <span className={style.badge}>{cartItemsCount}</span>
            )}
          </Link>

          <div className={style.profileWrap} ref={dropdownRef}>
            <button
              className={style.avatarBtn}
              onClick={() => setDropdownOpen((v) => !v)}
            >
              {user?.avatar ? (
                <img
                  className={style.avatarImg}
                  src={user.avatar}
                  alt={user.username}
                />
              ) : (
                <User size={18} />
              )}
              <ChevronDown
                size={14}
                className={`${style.chevron} ${dropdownOpen ? style.chevronOpen : ''}`}
              />
            </button>

            {dropdownOpen && (
              <div className={style.dropdown}>
                <div className={style.dropdownInfo}>
                  <p className={style.dropdownName}>{user?.username}</p>
                  <p className={style.dropdownEmail}>{user?.email}</p>
                  <span className={style.dropdownRole}>{user?.role}</span>
                </div>

                <div className={style.dropdownDivider} />

                <Link
                  href="/dashboard/profile"
                  className={style.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  Профиль
                </Link>

                {user?.role === 'OWNER' && (
                  <Link
                    href="/dashboard/my-shop"
                    className={style.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Мой магазин
                  </Link>
                )}

                {user?.role === 'ADMIN' && (
                  <Link
                    href="/dashboard/admin"
                    className={style.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    Админ панель
                  </Link>
                )}

                <div className={style.dropdownDivider} />

                <button
                  className={`${style.dropdownItem} ${style.dropdownLogout}`}
                  onClick={logout}
                >
                  <LogOut size={14} />
                  Exit
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}