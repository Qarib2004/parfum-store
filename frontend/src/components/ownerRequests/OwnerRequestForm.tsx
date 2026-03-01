'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOwnerRequestSchema, CreateOwnerRequestInput } from '@/schemas/ownerRequest.schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ownerRequestApi } from '@/lib/api/endpoints';
import { useState } from 'react';
import { getErrorMessage } from '@/lib/utils';
import { Plus, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { OWNER_REQUIREMENTS } from '@/lib/constants';
import style from './owner-request-form.module.scss';

export function OwnerRequestForm() {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateOwnerRequestInput>({
    resolver: zodResolver(createOwnerRequestSchema),
    defaultValues: {
      products: Array(OWNER_REQUIREMENTS.MIN_PRODUCTS).fill({
        name: '',
        brand: '',
        quantity: OWNER_REQUIREMENTS.MIN_QUANTITY_PER_PRODUCT,
      }),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'products' });

  const products = watch('products');
  const totalProducts = products.filter((p) => p.name && p.brand).length;
  const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);

  const createRequestMutation = useMutation({
    mutationFn: (data: CreateOwnerRequestInput) => ownerRequestApi.createOwnerRequest(data),
    onSuccess: () => {
      toast.success('Request submitted successfully!', {
        description: 'An administrator will review your request shortly',
      });
      queryClient.invalidateQueries({ queryKey: ['myOwnerRequests'] });
    },
    onError: (err) => {
      const msg = getErrorMessage(err);
      setError(msg);
      toast.error('Failed to submit request', { description: msg });
    },
  });

  const onSubmit = (data: CreateOwnerRequestInput) => {
    createRequestMutation.mutate(data);
  };

  const productsReady = totalProducts >= OWNER_REQUIREMENTS.MIN_PRODUCTS;
  const quantityReady = totalQuantity >= OWNER_REQUIREMENTS.MIN_TOTAL_QUANTITY;

  return (
    <form className={style.form} onSubmit={handleSubmit(onSubmit)}>

      {error && (
        <div className={style.errorBanner}>
          <p>{error}</p>
        </div>
      )}

      <div className={style.stats}>
        <div className={`${style.statCard} ${productsReady ? style.statCardDone : ''}`}>
          <p className={style.statLabel}>Unique fragrances</p>
          <p className={style.statValue}>
            <span className={productsReady ? style.statNumDone : style.statNum}>{totalProducts}</span>
            <span className={style.statTotal}> / {OWNER_REQUIREMENTS.MIN_PRODUCTS}</span>
          </p>
        </div>
        <div className={`${style.statCard} ${quantityReady ? style.statCardDone : ''}`}>
          <p className={style.statLabel}>Total quantity</p>
          <p className={style.statValue}>
            <span className={quantityReady ? style.statNumDone : style.statNum}>{totalQuantity}</span>
            <span className={style.statTotal}> / {OWNER_REQUIREMENTS.MIN_TOTAL_QUANTITY}</span>
          </p>
        </div>
      </div>

      <div className={style.section}>
        <div className={style.sectionHeader}>
          <h3 className={style.sectionTitle}>Product list</h3>
          <button
            className={style.addBtn}
            type="button"
            onClick={() => append({ name: '', brand: '', quantity: OWNER_REQUIREMENTS.MIN_QUANTITY_PER_PRODUCT })}
          >
            <Plus size={15} />
            Add product
          </button>
        </div>

        <div className={style.productList}>
          {fields.map((field, index) => (
            <div key={field.id} className={style.productRow}>

              <span className={style.rowIndex}>#{index + 1}</span>

              <div className={style.rowFields}>
                <div className={style.field}>
                  <label className={style.label}>Fragrance name *</label>
                  <input
                    className={style.input}
                    type="text"
                    {...register(`products.${index}.name`)}
                    placeholder="Chanel No. 5"
                  />
                  {errors.products?.[index]?.name && (
                    <p className={style.fieldError}>{errors.products[index]?.name?.message}</p>
                  )}
                </div>

                <div className={style.field}>
                  <label className={style.label}>Brand *</label>
                  <input
                    className={style.input}
                    type="text"
                    {...register(`products.${index}.brand`)}
                    placeholder="Chanel"
                  />
                  {errors.products?.[index]?.brand && (
                    <p className={style.fieldError}>{errors.products[index]?.brand?.message}</p>
                  )}
                </div>

                <div className={style.field}>
                  <label className={style.label}>Quantity *</label>
                  <input
                    className={`${style.input} ${style.inputQty}`}
                    type="number"
                    min={OWNER_REQUIREMENTS.MIN_QUANTITY_PER_PRODUCT}
                    {...register(`products.${index}.quantity`, { valueAsNumber: true })}
                    placeholder={String(OWNER_REQUIREMENTS.MIN_QUANTITY_PER_PRODUCT)}
                  />
                  {errors.products?.[index]?.quantity && (
                    <p className={style.fieldError}>{errors.products[index]?.quantity?.message}</p>
                  )}
                </div>
              </div>

              {fields.length > OWNER_REQUIREMENTS.MIN_PRODUCTS && (
                <button
                  className={style.removeBtn}
                  type="button"
                  onClick={() => remove(index)}
                  title="Remove"
                >
                  <Trash2 size={15} />
                </button>
              )}

            </div>
          ))}
        </div>

        {errors.products && typeof errors.products.message === 'string' && (
          <div className={style.errorBanner}>
            <p>{errors.products.message}</p>
          </div>
        )}
      </div>

      <button
        className={style.submitBtn}
        type="submit"
        disabled={createRequestMutation.isPending}
      >
        {createRequestMutation.isPending ? 'Submitting...' : 'Submit request'}
      </button>

      <div className={style.info}>
        <div className={style.infoHeader}>
          <Info size={15} />
          <h4 className={style.infoTitle}>Important information</h4>
        </div>
        <ul className={style.infoList}>
          <li>All products must be unique (different name + brand)</li>
          <li>Minimum {OWNER_REQUIREMENTS.MIN_QUANTITY_PER_PRODUCT} units per product</li>
          <li>Minimum {OWNER_REQUIREMENTS.MIN_PRODUCTS} different fragrances required</li>
          <li>An administrator will review your request within 24–48 hours</li>
        </ul>
      </div>

    </form>
  );
}