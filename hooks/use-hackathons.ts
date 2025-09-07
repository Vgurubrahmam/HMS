"use client";

import { useState, useEffect } from "react";
import { api, Hackathon, ApiResponse } from "@/lib/api";
import { useDebounce } from "use-debounce";
export function useHackathons(params?: {
  status?: string;
  difficulty?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [debouncedSearch]=useDebounce(params?.search,500)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 const [pagination, setPagination] = useState({
    page: params?.page || 1,
    limit: params?.limit || 10,
    total: 0,
    pages: 0,
  });
const instanceId = Math.random().toString(36).slice(2, 8);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const response=await api.getHackathons({
        ...params,search:debouncedSearch
      })
// console.log(`[useHackathons ${instanceId}] API Response:`, response)
      if (response.success && response.data) {
        const data = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.hackathons)
          ? response.data.hackathons
          : [];

        if (data.length > 0) {
          const normalizedData = data.map((h: Hackathon) => ({
            ...h,
            status: h.status || "Unknown",
            difficulty: h.difficulty || "Unknown",
            venue: h.venue || "TBD",
            registrationFee: h.registrationFee || 0,
            currentParticipants: h.currentParticipants || 0,
            maxParticipants: typeof h.maxParticipants === "number"
              ? h.maxParticipants
              : (typeof h.maxParticipants === "string" && !isNaN(Number(h.maxParticipants)))
                ? Number(h.maxParticipants)
                : undefined,
            categories: h.categories || [],
            prizes: h.prizes || [],
            registrationDeadline: h.registrationDeadline || "",
            organizer: h.organizer || { name: "University" },
            requirements: h.requirements || [],
          }));
          setHackathons(normalizedData);
          if (response.pagination) {
            setPagination(response.pagination);
          }
          setError(null);
        } else {
          setError(response.error||"No hackathons found in response data");
        }
      } else {
        setError(response.error || "Failed to fetch hackathons");
      }
    } catch (err: any) {
     
      setError(err.message || "An error occurred while fetching hackathons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [params?.status, params?.difficulty,debouncedSearch,  params?.page]);

  
  const createHackathon = async (data: any) => {
    try {
      const response = await api.createHackathon(data);
      if (response.success) {
        await fetchHackathons();
        return response;
      }
      return response;
    } catch (err) {
      return { success: false, error: "Failed to create hackathon" };
    }
  };

  const updateHackathon = async (id: string, data: any) => {
    try {
      const response = await api.updateHackathon(id, data);
      if (response.success) {
        await fetchHackathons();
        return response;
      }
      return response;
    } catch (err) {
      return { success: false, error: "Failed to update hackathon" };
    }
  };

  const deleteHackathon = async (id: string) => {
    try {
      const response = await api.deleteHackathon(id);
      if (response.success) {
        await fetchHackathons();
        return response;
      }
      return response;
    } catch (err) {
      return { success: false, error: "Failed to delete hackathon" };
    }
  };

  return {
    hackathons,
    loading,
    error,
    pagination,
    refetch: fetchHackathons,
    createHackathon,
    updateHackathon,
    deleteHackathon,
  };
}