'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ProductForm } from '@/components/products/ProductForm';
import style from './add-product.module.scss';

export default function AddProductPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== 'OWNER' && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || (user.role !== 'OWNER' && user.role !== 'ADMIN')) {
    return (
      <div className={style.denied}>
        <p className={style.deniedText}>You don't have permission to create products</p>
      </div>
    );
  }

  return (
    <div className={style.page}>
      <div className={style.header}>
        <h1 className={style.headerTitle}>Add new product</h1>
        <p className={style.headerSub}>Fill in the product information below</p>
      </div>

      <ProductForm />
    </div>
  );
}