"use client";

import Link from "next/link";

import { useAuth } from "@/hooks/useAuth";

import { useCartStore } from "@/store/cartStore";

import {
  Bell,
  ShoppingCart,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

import { useAppNotifications } from "@/hooks/useNotification";

import { useState, useRef, useEffect } from "react";

import { formatRelativeDate } from "@/lib/utils";
import style from "./navbar.module.scss";

interface NavbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (val: boolean) => void;
}

export function Navbar({ sidebarOpen, setSidebarOpen }: NavbarProps) {
  const { user, logout } = useAuth();

  const {
    AppNotifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useAppNotifications({
    page: 1,
    limit: 10,
  });

  const { getTotalItems } = useCartStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const cartItemsCount = getTotalItems();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;

      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setDropdownOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className={style.nav}>
      {" "}
      <div className={style.inner}>
        {" "}
        <button
          className={style.burger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {" "}
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>{" "}
        <Link href="/dashboard" className={style.logo}>
          {" "}
          <span className={style.logoText}>ESSENCE</span>{" "}
          <span className={style.logoSub}>parfumerie</span>{" "}
        </Link>{" "}
        <div className={style.searchWrap}>
          {" "}
          <input
            className={style.search}
            type="search"
            placeholder="Search for products..."
          />{" "}
        </div>{" "}
        <div className={style.actions}>
          {" "}
          <div className={style.notificationsWrap} ref={notificationsRef}>
            {" "}
            <button
              className={style.iconBtn}
              type="button"
              onClick={() => setNotificationsOpen((v) => !v)}
              aria-label="Open notifications"
            >
              {" "}
              <Bell size={20} />{" "}
              {unreadCount > 0 && (
                <span className={style.badge}> {unreadCount}</span>
              )}
            </button>{" "}
            {notificationsOpen && (
              <>
                {" "}
                <div
                  className={style.notificationsOverlay}
                  onClick={() => setNotificationsOpen(false)}
                />{" "}
                <div className={style.notificationsModal}>
                  {" "}
                  <div className={style.notificationsHeader}>
                    {" "}
                    <h3>Notifications</h3>{" "}
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        className={style.markAllBtn}
                        onClick={() => markAllAsRead()}
                      >
                        {" "}
                        Mark all as read{" "}
                      </button>
                    )}
                  </div>{" "}
                  <div className={style.notificationsBody}>
                    {" "}
                    {isLoading ? (
                      <div className={style.notificationsEmpty}>
                        {" "}
                        <p>Loading...</p>{" "}
                      </div>
                    ) : AppNotifications.length === 0 ? (
                      <div className={style.notificationsEmpty}>
                        {" "}
                        <p>No notifications yet</p>{" "}
                      </div>
                    ) : (
                      <ul className={style.notificationsList}>
                        {" "}
                        {AppNotifications.map((n) => (
                          <li
                            key={n.id}
                            className={`$ {
                      style.notificationItem
                    }

                    $ {
                       !n.read ? style.notificationItemUnread : ''
                    }

                    `}
                            onClick={() => {
                              if (!n.read) {
                                markAsRead(n.id);
                              }

                              if (n.link) {
                                window.location.href = n.link;
                              }
                            }}
                          >
                            {" "}
                            <div className={style.notificationMain}>
                              {" "}
                              <p className={style.notificationTitle}>
                                {" "}
                                {n.title}
                              </p>{" "}
                              <p className={style.notificationMessage}>
                                {" "}
                                {n.message}
                              </p>{" "}
                            </div>{" "}
                            <div className={style.notificationMeta}>
                              {" "}
                              <span className={style.notificationDate}>
                                {" "}
                                {formatRelativeDate(n.createdAt)}
                              </span>{" "}
                            </div>{" "}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>{" "}
                </div>{" "}
              </>
            )}
          </div>{" "}
          <Link href="/dashboard/cart" className={style.iconBtn}>
            {" "}
            <ShoppingCart size={20} />{" "}
            {cartItemsCount > 0 && (
              <span className={style.badge}> {cartItemsCount}</span>
            )}
          </Link>{" "}
          <div className={style.profileWrap} ref={dropdownRef}>
            {" "}
            <button
              className={style.avatarBtn}
              onClick={() => setDropdownOpen((v) => !v)}
            >
              {" "}
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
                className={`$ {
        style.chevron
      }

      $ {
        dropdownOpen ? style.chevronOpen : ''
      }

      `}
              />{" "}
            </button>{" "}
            {dropdownOpen && (
              <div className={style.dropdown}>
                {" "}
                <div className={style.dropdownInfo}>
                  {" "}
                  <p className={style.dropdownName}> {user?.username}</p>{" "}
                  <p className={style.dropdownEmail}> {user?.email}</p>{" "}
                  <span className={style.dropdownRole}> {user?.role}</span>{" "}
                </div>{" "}
                <div className={style.dropdownDivider} />{" "}
                <Link
                  href="/dashboard/profile"
                  className={style.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  {" "}
                  Profile{" "}
                </Link>{" "}
                {user?.role === "OWNER" && (
                  <Link
                    href="/dashboard/my-shop"
                    className={style.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    {" "}
                    My stores{" "}
                  </Link>
                )}
                {user?.role === "ADMIN" && (
                  <Link
                    href="/dashboard/admin"
                    className={style.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    {" "}
                    Admin panel{" "}
                  </Link>
                )}
                <div className={style.dropdownDivider} />{" "}
                <button
                  className={`$ {
            style.dropdownItem
          }

          $ {
            style.dropdownLogout
          }

          `}
                  onClick={logout}
                >
                  {" "}
                  <LogOut size={14} /> Exit{" "}
                </button>{" "}
              </div>
            )}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </nav>
  );
}
