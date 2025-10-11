"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/use-toast";

interface Payment {
  _id: string;
  user: string | { _id: string; username: string; email: string };
  hackathon: string | { _id: string; title: string; registrationFee: number };
  registration: string | { _id: string; paymentStatus: string };
  amount: number;
  status: "Pending" | "Completed" | "Failed" | "Refunded";
  paymentMethod: "PayPal" | "Credit Card" | "Debit Card" | "Bank Transfer";
  transactionId?: string;
  paymentDate?: string;
  dueDate: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UsePaymentsParams {
  user?: string;
  hackathon?: string;
  status?: string;
  page?: number;
  limit?: number;
}

interface CreatePaymentData {
  user: string;
  hackathon: string;
  registration: string;
  amount: number;
  paymentMethod: string;
  dueDate?: string;
  description?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: Pagination;
}

interface UsePaymentsResult {
  payments: Payment[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  refetch: () => Promise<void>;
  createPayment: (data: CreatePaymentData) => Promise<ApiResponse>;
  updatePayment: (id: string, data: Partial<Payment>) => Promise<ApiResponse>;
}

export function usePayments(params?: UsePaymentsParams): UsePaymentsResult {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: params?.page || 1,
    limit: params?.limit || 10,
    total: 0,
    pages: 0,
  });

  const fetchPayments = async (): Promise<void> => {
    try {
      setLoading(true);
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined) {
            searchParams.append(key, value.toString());
          }
        });
      }

      const response = await fetch(`/api/payments?${searchParams}`);
      const data = await response.json();

      if (data.success) {
        setPayments(Array.isArray(data.data) ? data.data : []);
        if (data.pagination) {
          setPagination(data.pagination);
        }
        setError(null);
      } else {
        setError(data.error || "Failed to fetch payments");
        toast({
          title: "Error",
          description: data.error || "Failed to fetch payments",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      const errorText = err.message || "An error occurred while fetching payments";
      setError(errorText);
      toast({
        title: "Error",
        description: errorText,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Memoize params to prevent unnecessary fetches
  const paramsKey = useMemo(
    () =>
      JSON.stringify({
        user: params?.user,
        hackathon: params?.hackathon,
        status: params?.status,
        page: params?.page,
        limit: params?.limit,
      }),
    [params?.user, params?.hackathon, params?.status, params?.page, params?.limit]
  );

  useEffect(() => {
    if (paramsKey && params?.user) {
      fetchPayments();
    }
  }, [paramsKey]);

  const createPayment = async (data: CreatePaymentData): Promise<ApiResponse> => {
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        await fetchPayments(); // Refresh the list
        toast({
          title: "Success",
          description: "Payment created successfully",
        });
        return result;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create payment",
          variant: "destructive",
        });
        return result;
      }
    } catch (err: any) {
      const errorText = err.message || "Failed to create payment";
      toast({
        title: "Error",
        description: errorText,
        variant: "destructive",
      });
      return { success: false, error: errorText };
    }
  };

  const updatePayment = async (id: string, data: Partial<Payment>): Promise<ApiResponse> => {
    try {
      const response = await fetch(`/api/payments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        await fetchPayments(); // Refresh the list
        toast({
          title: "Success",
          description: "Payment updated successfully",
        });
        return result;
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update payment",
          variant: "destructive",
        });
        return result;
      }
    } catch (err: any) {
      const errorText = err.message || "Failed to update payment";
      toast({
        title: "Error",
        description: errorText,
        variant: "destructive",
      });
      return { success: false, error: errorText };
    }
  };

  return {
    payments,
    loading,
    error,
    pagination,
    refetch: fetchPayments,
    createPayment,
    updatePayment,
  };
}
