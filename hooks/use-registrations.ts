"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "@/hooks/use-toast"; // Adjust based on your toast library
import { api } from "@/lib/api"; // Adjust path to api.ts

interface Registration {
  _id: string; // Use string for MongoDB ObjectId
  user: string; // User ID as string
  hackathon: string; // Hackathon ID as string
  paymentStatus: string;
  createdAt?: string; // Optional fields for timestamps
  updatedAt?: string;
  [key: string]: any; // Allow additional fields
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface UseRegistrationsParams {
  user?: string; // Use string for user ID
  hackathon?: string; // Use string for hackathon ID
  paymentStatus?: string;
  page?: number;
  limit?: number;
}

interface CreateRegistrationData {
  user: string; // Required fields for registration
  hackathon: string;
  paymentStatus?: string;
  [key: string]: any; // Allow additional fields
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: Pagination;
}

interface UseRegistrationsResult {
  registrations: Registration[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  refetch: () => Promise<void>;
  createRegistration: (data: CreateRegistrationData) => Promise<ApiResponse>;
}

export function useRegistrations(params?: UseRegistrationsParams): UseRegistrationsResult {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: params?.page || 1,
    limit: params?.limit || 10,
    total: 0,
    pages: 0,
  });

 const fetchRegistrations = async (): Promise<void> => {
  try {
    setLoading(true);
    // console.log("Fetching registrations with params:", params);
    const response = await api.getRegistrations(params); // Line 26

    if (response.success) {
      // console.log("Fetch registrations response:", response);
      setRegistrations(Array.isArray(response.data) ? response.data : []);
      if (response.pagination) {
        setPagination(response.pagination);
        // console.log("Pagination updated:", response.pagination);
      }
      setError(null);
    } else {
      // console.error("Fetch registrations failed:", response.error);
      setError(response.error || "Failed to fetch registrations");
      toast({
        title: "Error",
        description: response.error || "Failed to fetch registrations",
        variant: "destructive",
      });
    }
  } catch (err: any) {
    // console.error("Fetch registrations error:", err);
    const errorText = err.message || "An error occurred while fetching registrations";
    setError(errorText);
    toast({
      title: "Error",
      description: errorText,
      variant: "destructive",
    });
  } finally {
    setLoading(false);
    // console.log("Fetch registrations completed");
  }
};

  // Memoize params to prevent unnecessary fetches due to object reference changes
  const paramsKey = useMemo(
    () =>
      JSON.stringify({
        user: params?.user,
        hackathon: params?.hackathon,
        paymentStatus: params?.paymentStatus,
        page: params?.page,
        limit: params?.limit,
      }),
    [params?.user, params?.hackathon, params?.paymentStatus, params?.page, params?.limit]
  );

  useEffect(() => {
    if (paramsKey && params?.user) {
      fetchRegistrations(); // Line 45
    }
  }, [paramsKey]);

  const createRegistration = async (data: CreateRegistrationData): Promise<ApiResponse> => {
    try {
      console.log("Creating registration with data:", data);
      const response: ApiResponse = await api.createRegistration(data);
      console.log("Create registration response:", response);
      if (response.success) {
        await fetchRegistrations(); // Refresh the list
        toast({
          title: "Success",
          description: "Registration created successfully",
        });
        return response;
      } else {
        // console.error("Create registration failed:", response.error);
        // Handle duplicate registration case more gracefully
        const isDuplicate = response.error?.includes("already registered");
        toast({
          title: isDuplicate ? "Already Registered" : "Error",
          description: response.error || "Failed to create registration",
          variant: isDuplicate ? "default" : "destructive",
        });
        return response;
      }
    } catch (err: any) {
      console.error("Create registration error:", err);
      const errorText = err.message || "Failed to create registration";
      toast({
        title: "Error",
        description: errorText,
        variant: "destructive",
      });
      return { success: false, error: errorText };
    }
  };

  return {
    registrations,
    loading,
    error,
    pagination,
    refetch: fetchRegistrations,
    createRegistration,
  };
}