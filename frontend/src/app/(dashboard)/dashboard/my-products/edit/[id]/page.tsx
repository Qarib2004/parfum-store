"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EditProductForm } from "@/components/products/EditProductForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useProduct } from "@/hooks/useProduct";
import style from "./edit-product.module.scss";

export default function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { user } = useAuth();
  const router = useRouter();
  const { product, isLoading } = useProduct(params.id);

  useEffect(() => {
    if (user && user.role !== "OWNER" && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  useEffect(() => {
    if (
      product &&
      user &&
      product.ownerId !== user.id &&
      user.role !== "ADMIN"
    ) {
      router.push("/dashboard/my-products");
    }
  }, [product, user, router]);

  if (!user || (user.role !== "OWNER" && user.role !== "ADMIN")) {
    return (
      <div className={style.statePage}>
        <p className={style.stateText}>
          You do not have permission to edit products
        </p>
      </div>
    );
  }

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
        <Link href="/dashboard/my-products" className={style.stateLink}>
          Back to my products
        </Link>
      </div>
    );
  }

  if (product.ownerId !== user.id && user.role !== "ADMIN") {
    return (
      <div className={style.statePage}>
        <h2 className={style.stateTitle}>
          You do not have permission to edit this product
        </h2>
        <Link href="/dashboard/my-products" className={style.stateLink}>
          Back to my products
        </Link>
      </div>
    );
  }

  return (
    <div className={style.page}>
      <Link href="/dashboard/my-products" className={style.backLink}>
        <ArrowLeft size={16} />
        Back to my products
      </Link>

      <div className={style.header}>
        <h1 className={style.headerTitle}>Edit product</h1>
        <p className={style.headerSub}>Update your product information</p>
      </div>

      <EditProductForm product={product} />
    </div>
  );
}
