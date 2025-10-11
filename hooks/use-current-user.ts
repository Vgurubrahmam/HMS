"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    const getCurrentUser = () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setUserData(null);
          setLoading(false);
          return;
        }

        const decoded: any = jwtDecode(token);
        if (decoded) {
          const user: UserData = {
            id: decoded.id || decoded.userId || "",
            username: decoded.username || "",
            email: decoded.email || "",
            role: decoded.role || "",
          };
          setUserData(user);
        } else {
          setUserData(null);
        }
      } catch (error) {
        console.error("Failed to decode token:", error);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  return { userData, loading };
}
