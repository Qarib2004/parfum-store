'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ownerRequestApi } from '@/lib/api/endpoints';
import { OwnerRequestForm } from '@/components/ownerRequests/OwnerRequestForm';
import { OwnerRequestStatus } from '@/components/ownerRequests/OwnerRequestStatus';
import { OWNER_REQUIREMENTS } from '@/lib/constants';
import { CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import style from './owner-request.module.scss';

export default function OwnerRequestPage() {
  const { user } = useAuth();
  const router = useRouter();

  const { data: requests, isLoading } = useQuery({
    queryKey: ['myOwnerRequests'],
    queryFn: async () => {
      const response = await ownerRequestApi.getUserOwnerRequests();
      return response.data.data;
    },
    enabled: !!user && user.role === 'USER',
  });

  useEffect(() => {
    if (user && user.role !== 'USER') {
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user || user.role !== 'USER') {
    return (
      <div className={style.statePage}>
        <h2 className={style.stateTitle}>You are already an owner</h2>
        <p className={style.stateDesc}>This page is only available for regular users</p>
      </div>
    );
  }

  const pendingRequest = requests?.find((r) => r.status === 'PENDING');
  const lastRequest = requests?.[0];

  return (
    <div className={style.page}>

      <div className={style.header}>
        <h1 className={style.headerTitle}>Become a shop owner</h1>
        <p className={style.headerSub}>Submit a request and start selling your products</p>
      </div>

      <div className={style.requirements}>
        <div className={style.reqIcon}>
          <Package size={22} />
        </div>
        <div className={style.reqBody}>
          <h2 className={style.reqTitle}>Owner requirements</h2>
          <p className={style.reqDesc}>To receive owner status you must provide:</p>
          <ul className={style.reqList}>
            <li className={style.reqItem}>
              <CheckCircle size={15} className={style.reqCheck} />
              Minimum {OWNER_REQUIREMENTS.MIN_PRODUCTS} unique fragrances
            </li>
            <li className={style.reqItem}>
              <CheckCircle size={15} className={style.reqCheck} />
              At least {OWNER_REQUIREMENTS.MIN_QUANTITY_PER_PRODUCT} units of each fragrance
            </li>
            <li className={style.reqItem}>
              <CheckCircle size={15} className={style.reqCheck} />
              Total quantity: at least {OWNER_REQUIREMENTS.MIN_TOTAL_QUANTITY} units
            </li>
          </ul>
        </div>
      </div>

      {isLoading ? (
        <div className={style.skeleton} />
      ) : pendingRequest ? (
        <OwnerRequestStatus request={pendingRequest} />
      ) : lastRequest?.status === 'REJECTED' ? (
        <div className={`${style.statusBanner} ${style.statusRejected}`}>
          <XCircle size={20} className={style.statusIcon} />
          <div>
            <h3 className={style.statusTitle}>Request rejected</h3>
            <p className={style.statusDesc}>
              Unfortunately your previous request was rejected.
              {lastRequest.adminComment && ` Reason: ${lastRequest.adminComment}`}
            </p>
            <p className={style.statusHint}>You may submit a new request below</p>
          </div>
        </div>
      ) : lastRequest?.status === 'APPROVED' ? (
        <div className={`${style.statusBanner} ${style.statusApproved}`}>
          <CheckCircle size={20} className={style.statusIcon} />
          <div>
            <h3 className={style.statusTitle}>Request approved!</h3>
            <p className={style.statusDesc}>Your request has been approved. Please refresh the page.</p>
          </div>
        </div>
      ) : null}

      {!pendingRequest && (!lastRequest || lastRequest.status === 'REJECTED') && (
        <div className={style.formSection}>
          <div className={style.formHeader}>
            <h2 className={style.formTitle}>Submit a request</h2>
            <p className={style.formDesc}>
              Fill in your product details. After submission an administrator will review your request and make a decision.
            </p>
          </div>
          <OwnerRequestForm />
        </div>
      )}

      {requests && requests.length > 0 && (
        <div className={style.history}>
          <h2 className={style.historyTitle}>Request history</h2>
          <div className={style.historyList}>
            {requests.map((request) => (
              <div key={request.id} className={style.historyItem}>
                <div className={`${style.historyIconWrap} ${
                  request.status === 'APPROVED' ? style.historyIconApproved :
                  request.status === 'REJECTED' ? style.historyIconRejected :
                  style.historyIconPending
                }`}>
                  {request.status === 'PENDING'  && <Clock size={16} />}
                  {request.status === 'APPROVED' && <CheckCircle size={16} />}
                  {request.status === 'REJECTED' && <XCircle size={16} />}
                </div>

                <div className={style.historyContent}>
                  <div className={style.historyTop}>
                    <h3 className={`${style.historyStatus} ${
                      request.status === 'APPROVED' ? style.historyStatusApproved :
                      request.status === 'REJECTED' ? style.historyStatusRejected :
                      style.historyStatusPending
                    }`}>
                      {request.status === 'PENDING'  && 'Pending'}
                      {request.status === 'APPROVED' && 'Approved'}
                      {request.status === 'REJECTED' && 'Rejected'}
                    </h3>
                    <p className={style.historyDate}>
                      {new Date(request.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </p>
                  </div>

                  <div className={style.historyMeta}>
                    <span className={style.historyMetaItem}>Products: {request.productsCount}</span>
                    <span className={style.historyMetaItem}>Quantity: {request.totalQuantity}</span>
                  </div>

                  {request.adminComment && (
                    <div className={style.adminComment}>
                      <p className={style.adminCommentLabel}>Admin comment:</p>
                      <p className={style.adminCommentText}>{request.adminComment}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}