"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ownerRequestApi } from "@/lib/api/endpoints";
import { OwnerRequest, RequestStatus } from "@/types";
import { getErrorMessage, formatRelativeDate } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Package,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import style from "./admin-requests.module.scss";

type FilterStatus = RequestStatus | "ALL";

export default function AdminRequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<FilterStatus>("PENDING");
  const [selectedRequest, setSelectedRequest] = useState<OwnerRequest | null>(
    null,
  );
  const [decision, setDecision] = useState<RequestStatus | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [user, router]);

  const { data, isLoading } = useQuery({
    queryKey: [
      "adminOwnerRequests",
      { status: statusFilter === "ALL" ? undefined : statusFilter },
    ],
    queryFn: async () => {
      const response = await ownerRequestApi.getAllOwnerRequests(
        statusFilter === "ALL" ? undefined : { status: statusFilter },
      );
      return response.data.data;
    },
    enabled: !!user && user.role === "ADMIN",
  });

  const reviewMutation = useMutation({
    mutationFn: (payload: {
      requestId: string;
      status: Exclude<RequestStatus, "PENDING">;
      adminComment?: string;
    }) => ownerRequestApi.reviewOwnerRequest(payload),
    onSuccess: () => {
      toast.success("Request reviewed successfully");
      queryClient.invalidateQueries({ queryKey: ["adminOwnerRequests"] });
      queryClient.invalidateQueries({ queryKey: ["myOwnerRequests"] });
      setSelectedRequest(null);
      setDecision(null);
      setComment("");
    },
    onError: (error) => {
      toast.error("Failed to review request", {
        description: getErrorMessage(error),
      });
    },
  });

  if (!user || user.role !== "ADMIN") {
    return (
      <div className={style.statePage}>
        <h2 className={style.stateTitle}>Access restricted</h2>
        <p className={style.stateDesc}>
          Only administrators can view owner requests.
        </p>
      </div>
    );
  }

  const requests: OwnerRequest[] = data?.requests || [];

  const handleOpenRequest = (request: OwnerRequest) => {
    setSelectedRequest(request);
    setDecision(null);
    setComment(request.adminComment || "");
  };

  const handleSubmitReview = () => {
    if (!selectedRequest || !decision || decision === "PENDING") return;

    reviewMutation.mutate({
      requestId: selectedRequest.id,
      status: decision,
      adminComment: comment || undefined,
    });
  };

  return (
    <div className={style.page}>
      <div className={style.header}>
        <div>
          <h1 className={style.headerTitle}>Owner requests</h1>
          <p className={style.headerSub}>
            Review and manage owner status requests
          </p>
        </div>
      </div>

      <div className={style.toolbar}>
        <div className={style.filterGroup}>
          <Filter size={14} className={style.filterIcon} />
          <select
            className={style.filterSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ALL">All</option>
          </select>
        </div>
      </div>

      <div className={style.layout}>
        <div className={style.listCol}>
          {isLoading ? (
            <div className={style.skeletonList}>
              {[...Array(4)].map((_, i) => (
                <div key={i} className={style.skeletonItem} />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className={style.empty}>
              <h3 className={style.emptyTitle}>No requests</h3>
              <p className={style.emptyDesc}>
                There are no owner requests for the selected status.
              </p>
            </div>
          ) : (
            <ul className={style.list}>
              {requests.map((request) => (
                <li
                  key={request.id}
                  className={`${style.listItem} ${
                    selectedRequest?.id === request.id
                      ? style.listItemActive
                      : ""
                  }`}
                  onClick={() => handleOpenRequest(request)}
                >
                  <div className={style.listStatusIcon}>
                    {request.status === "PENDING" && <Clock size={16} />}
                    {request.status === "APPROVED" && <CheckCircle size={16} />}
                    {request.status === "REJECTED" && <XCircle size={16} />}
                  </div>
                  <div className={style.listContent}>
                    <div className={style.listTop}>
                      <p className={style.listUser}>
                        {request.user?.username || "User"}{" "}
                        <span className={style.listEmail}>
                          {request.user?.email}
                        </span>
                      </p>
                      <span
                        className={`${style.listStatus} ${
                          request.status === "PENDING"
                            ? style.listStatusPending
                            : request.status === "APPROVED"
                              ? style.listStatusApproved
                              : style.listStatusRejected
                        }`}
                      >
                        {request.status.toLowerCase()}
                      </span>
                    </div>
                    <div className={style.listMeta}>
                      <span>Products: {request.productsCount}</span>
                      <span>Quantity: {request.totalQuantity}</span>
                      <span>{formatRelativeDate(request.createdAt)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={style.detailCol}>
          {selectedRequest ? (
            <div className={style.detailCard}>
              <div className={style.detailHeader}>
                <div className={style.detailUser}>
                  <div className={style.detailAvatar}>
                    {selectedRequest.user?.username ? (
                      selectedRequest.user.username[0].toUpperCase()
                    ) : (
                      <User size={18} />
                    )}
                  </div>
                  <div>
                    <p className={style.detailName}>
                      {selectedRequest.user?.username || "User"}
                    </p>
                    {selectedRequest.user?.email && (
                      <p className={style.detailEmail}>
                        {selectedRequest.user.email}
                      </p>
                    )}
                  </div>
                </div>
                <div className={style.detailStats}>
                  <div className={style.detailStat}>
                    <span className={style.detailStatLabel}>
                      Unique fragrances
                    </span>
                    <span className={style.detailStatValue}>
                      {selectedRequest.productsCount}
                    </span>
                  </div>
                  <div className={style.detailStat}>
                    <span className={style.detailStatLabel}>
                      Total quantity
                    </span>
                    <span className={style.detailStatValue}>
                      {selectedRequest.totalQuantity}
                    </span>
                  </div>
                </div>
              </div>

              <div className={style.detailBody}>
                <h3 className={style.sectionTitle}>Products</h3>
                <div className={style.products}>
                  {selectedRequest.productDetails.map((product, index) => (
                    <div key={index} className={style.productRow}>
                      <div className={style.productIndex}>{index + 1}</div>
                      <div className={style.productMeta}>
                        <p className={style.productName}>{product.name}</p>
                        <p className={style.productBrand}>{product.brand}</p>
                      </div>
                      <div className={style.productQty}>
                        {product.quantity} pcs
                      </div>
                    </div>
                  ))}
                </div>

                <div className={style.decisionBlock}>
                  <h3 className={style.sectionTitle}>Decision</h3>
                  <div className={style.decisionButtons}>
                    <button
                      type="button"
                      className={`${style.decisionBtn} ${
                        decision === "APPROVED"
                          ? style.decisionBtnActiveApproved
                          : ""
                      }`}
                      onClick={() => setDecision("APPROVED")}
                    >
                      <CheckCircle size={16} />
                      Approve
                    </button>
                    <button
                      type="button"
                      className={`${style.decisionBtn} ${
                        decision === "REJECTED"
                          ? style.decisionBtnActiveRejected
                          : ""
                      }`}
                      onClick={() => setDecision("REJECTED")}
                    >
                      <XCircle size={16} />
                      Reject
                    </button>
                  </div>

                  <label className={style.commentLabel}>
                    Admin comment (optional)
                    <textarea
                      className={style.commentInput}
                      rows={4}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Explain the decision or give recommendations to the user..."
                    />
                  </label>

                  <button
                    type="button"
                    className={style.submitBtn}
                    onClick={handleSubmitReview}
                    disabled={
                      !decision ||
                      decision === "PENDING" ||
                      reviewMutation.isPending
                    }
                  >
                    {reviewMutation.isPending
                      ? "Saving..."
                      : decision === "APPROVED"
                        ? "Approve request"
                        : decision === "REJECTED"
                          ? "Reject request"
                          : "Submit"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className={style.placeholder}>
              <div className={style.placeholderIcon}>
                <Package size={20} />
              </div>
              <h3 className={style.placeholderTitle}>Select a request</h3>
              <p className={style.placeholderDesc}>
                Choose a request from the list on the left to view details and
                approve or reject it.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
