"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  Package,
  Store,
  MessageSquare,
  ShoppingBag,
  FileText,
  Users,
  Settings,
} from "lucide-react";
import style from "./sidebar.module.scss";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isActive = (path: string) => pathname === path;

  const userLinks = [
    { href: "/dashboard", label: "Home", icon: Home },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/dashboard/shops", label: "Stores", icon: Store },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/orders", label: "My orders", icon: ShoppingBag },
  ];

  const ownerLinks = [
    { href: "/dashboard/my-products", label: "My  products", icon: Package },
    { href: "/dashboard/my-shop", label: "My stores", icon: Store },
    {
      href: "/dashboard/my-orders",
      label: "Product orders",
      icon: ShoppingBag,
    },
  ];

  const adminLinks = [
    { href: "/dashboard/admin/requests", label: "Requests", icon: FileText },
    // { href: "/dashboard/admin/users", label: "Users", icon: Users },
  ];

  return (
    <aside className={`${style.aside} ${open ? style.asideOpen : ""}`}>
      <nav className={style.nav}>
        <div className={style.section}>
          <p className={style.sectionTitle}>Basics</p>
          <ul className={style.list}>
            {userLinks.map((link) => {
              const Icon = link.icon;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${style.link} ${
                      isActive(link.href) ? style.linkActive : ""
                    }`}
                    onClick={onClose}
                  >
                    <Icon size={18} className={style.linkIcon} />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {user?.role === "USER" && (
          <div className={style.ownerBanner}>
            <Link
              href="/dashboard/owner-request"
              className={style.ownerBannerBtn}
              onClick={onClose}
            >
              Become an owner
            </Link>
          </div>
        )}

        {(user?.role === "OWNER" || user?.role === "ADMIN") && (
          <div className={style.section}>
            <p className={style.sectionTitle}>Owner</p>
            <ul className={style.list}>
              {ownerLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`${style.link} ${
                        isActive(link.href) ? style.linkActive : ""
                      }`}
                      onClick={onClose}
                    >
                      <Icon size={18} className={style.linkIcon} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {user?.role === "ADMIN" && (
          <div className={style.section}>
            <p className={style.sectionTitle}>Admin</p>
            <ul className={style.list}>
              {adminLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`${style.link} ${
                        isActive(link.href) ? style.linkActive : ""
                      }`}
                      onClick={onClose}
                    >
                      <Icon size={18} className={style.linkIcon} />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className={style.settingsWrap}>
          <Link
            href="/dashboard/settings"
            className={`${style.link} ${
              isActive("/dashboard/settings") ? style.linkActive : ""
            }`}
            onClick={onClose}
          >
            <Settings size={18} className={style.linkIcon} />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
}
