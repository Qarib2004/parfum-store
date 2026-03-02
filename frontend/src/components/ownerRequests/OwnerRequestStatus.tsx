import { OwnerRequest } from '@/types';
import { Clock, Package } from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import style from './owner-request-status.module.scss';

interface OwnerRequestStatusProps {
  request: OwnerRequest;
}

export function OwnerRequestStatus({ request }: OwnerRequestStatusProps) {
  return (
    <div className={style.card}>

      <div className={style.header}>
        <div className={style.headerIcon}>
          <Clock size={20} />
        </div>
        <div>
          <h2 className={style.headerTitle}>Your request is under review</h2>
          <p className={style.headerSub}>Submitted {formatRelativeDate(request.createdAt)}</p>
        </div>
      </div>

      <div className={style.body}>

        <div className={style.infoBlock}>
          <div className={style.infoIcon}>
            <Package size={18} />
          </div>
          <div className={style.infoContent}>
            <h3 className={style.infoTitle}>Request details</h3>
            <div className={style.infoRows}>
              <div className={style.infoRow}>
                <span className={style.infoLabel}>Unique fragrances</span>
                <span className={style.infoValue}>{request.productsCount}</span>
              </div>
              <div className={style.infoRow}>
                <span className={style.infoLabel}>Total quantity</span>
                <span className={style.infoValue}>{request.totalQuantity} pcs</span>
              </div>
            </div>
          </div>
        </div>

        <div className={style.productList}>
          <h4 className={style.listTitle}>Product list</h4>
          <div className={style.listItems}>
            {request.productDetails.map((product, index) => (
              <div key={index} className={style.listItem}>
                <span className={style.listIndex}>{index + 1}</span>
                <div className={style.listMeta}>
                  <p className={style.listName}>{product.name}</p>
                  <p className={style.listBrand}>{product.brand}</p>
                </div>
                <span className={style.listQty}>{product.quantity} pcs</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className={style.footer}>
        <p className={style.footerText}>
          An administrator will review your request shortly. You will receive a notification once a decision has been made.
        </p>
      </div>

    </div>
  );
}