"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

interface UserData {
  id: string;
  username: string;
  email: string;
  role: string;
}

export function useCurrentUser() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const getCurrentUser = useCallback(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUserData(null);
        return;
      }

      const decoded: any = jwtDecode(token);
      if (decoded) {
        // Handle different JWT formats that might be used
        const user: UserData = {
          id: decoded.id || decoded.userId || decoded.user?.id || decoded._id || "",
          username: decoded.username || decoded.name || decoded.user?.username || "",
          email: decoded.email || decoded.user?.email || "",
          role: decoded.role || decoded.user?.role || "",
        };
        setUserData(user);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Failed to decode token:", error);
      setUserData(null);
      // Remove invalid token
      localStorage.removeItem("token");
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    getCurrentUser();
    setLoading(false);

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'token') {
        getCurrentUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [mounted, getCurrentUser]);

  // Memoize the return value to prevent unnecessary re-renders
  return useMemo(() => ({
    userData,
    loading: loading || !mounted
  }), [userData, loading, mounted]);
}
