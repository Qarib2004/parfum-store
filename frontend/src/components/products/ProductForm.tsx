'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, CreateProductInput } from '@/schemas/product.schema';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getErrorMessage, isFileSizeValid, isImageFile } from '@/lib/utils';
import { FRAGRANCE_TYPES, VOLUMES } from '@/lib/constants';
import { Upload, X } from 'lucide-react';
import { useOwnerProducts } from '@/hooks/useProduct';
import style from './product-form.module.scss';
import { toast } from 'sonner';

export function ProductForm() {
  const router = useRouter();
  const { createProduct, createProductWithImage, isCreating } = useOwnerProducts();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { volume: 100, quantity: 1, price: 0 },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!isImageFile(file)) { setError('Please select an image file'); return; }
      if (!isFileSizeValid(file, 5)) { setError('File size must not exceed 5MB'); return; }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  const onSubmit = async (data: CreateProductInput) => {
    try {
      if (selectedFile) {
        createProductWithImage(
          { data, file: selectedFile },
          {
            onSuccess: () => {
              toast.success("Product created successfully!");
              reset();
              setSelectedFile(null);
              setPreviewUrl(null);
              router.push("/dashboard/my-products");
            },
            onError: (error) => {
              const errorMsg = getErrorMessage(error);
              setError(errorMsg);
              toast.error("Failed to create product.", {
                description: errorMsg,
              });
            },
          }
        );
      } else {
        createProduct(data, {
          onSuccess: () => {
            toast.success("Product created successfully!");
            reset();
            router.push("/dashboard/my-products");
          },
          onError: (error) => {
            const errorMsg = getErrorMessage(error);
            setError(errorMsg);
            toast.error("Failed to create product.", {
              description: errorMsg,
            });
          },
        });
      }
    } catch (err) {
      const errorMsg = "An error occurred while creating the product.";
      setError(errorMsg);
      toast.error(errorMsg);
    }
  };

  return (
    <form className={style.form} onSubmit={handleSubmit(onSubmit)}>

      {error && (
        <div className={style.errorBanner}>
          <p>{error}</p>
        </div>
      )}

      <div className={style.field}>
        <label className={style.label}>Product image</label>

        {previewUrl ? (
          <div className={style.preview}>
            <img className={style.previewImg} src={previewUrl} alt="Preview" />
            <button className={style.removeBtn} type="button" onClick={handleRemoveFile}>
              <X size={14} />
              Remove
            </button>
          </div>
        ) : (
          <label className={style.uploadZone}>
            <input
              className={style.uploadInput}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <Upload size={24} className={style.uploadIcon} />
            <p className={style.uploadText}>Click or drag image here</p>
            <p className={style.uploadHint}>PNG, JPG, WEBP — up to 5MB</p>
          </label>
        )}
      </div>

      <div className={style.grid}>

        <div className={`${style.field} ${style.colSpan2}`}>
          <label className={style.label} htmlFor="name">Product name *</label>
          <input
            className={style.input}
            id="name"
            type="text"
            {...register('name')}
            placeholder="Chanel No. 5"
          />
          {errors.name && <p className={style.fieldError}>{errors.name.message}</p>}
        </div>

        <div className={style.field}>
          <label className={style.label} htmlFor="brand">Brand *</label>
          <input
            className={style.input}
            id="brand"
            type="text"
            {...register('brand')}
            placeholder="Chanel"
          />
          {errors.brand && <p className={style.fieldError}>{errors.brand.message}</p>}
        </div>

        <div className={style.field}>
          <label className={style.label} htmlFor="fragranceType">Fragrance type *</label>
          <select
            className={style.select}
            id="fragranceType"
            {...register('fragranceType')}
          >
            <option value="">Select type</option>
            {FRAGRANCE_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.fragranceType && <p className={style.fieldError}>{errors.fragranceType.message}</p>}
        </div>

        <div className={style.field}>
          <label className={style.label} htmlFor="volume">Volume (ml) *</label>
          <select
            className={style.select}
            id="volume"
            {...register('volume', { valueAsNumber: true })}
          >
            {VOLUMES.map((vol) => (
              <option key={vol} value={vol}>{vol} ml</option>
            ))}
          </select>
          {errors.volume && <p className={style.fieldError}>{errors.volume.message}</p>}
        </div>

        <div className={style.field}>
          <label className={style.label} htmlFor="quantity">Quantity *</label>
          <input
            className={style.input}
            id="quantity"
            type="number"
            min="1"
            {...register('quantity', { valueAsNumber: true })}
            placeholder="10"
          />
          {errors.quantity && <p className={style.fieldError}>{errors.quantity.message}</p>}
        </div>

        <div className={style.field}>
          <label className={style.label} htmlFor="price">Price (USD) *</label>
          <input
            className={style.input}
            id="price"
            type="number"
            min="0"
            step="0.01"
            {...register('price', { valueAsNumber: true })}
            placeholder="99.99"
          />
          {errors.price && <p className={style.fieldError}>{errors.price.message}</p>}
        </div>

        <div className={`${style.field} ${style.colSpan2}`}>
          <label className={style.label} htmlFor="description">Description</label>
          <textarea
            className={style.textarea}
            id="description"
            rows={4}
            {...register('description')}
            placeholder="Describe your product..."
          />
          {errors.description && <p className={style.fieldError}>{errors.description.message}</p>}
        </div>

      </div>

      <div className={style.actions}>
        <button
          className={style.cancelBtn}
          type="button"
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button
          className={style.submitBtn}
          type="submit"
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : 'Create product'}
        </button>
      </div>

    </form>
  );
}