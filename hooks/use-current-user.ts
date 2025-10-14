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
          // Handle different JWT formats that might be used
          const userId = decoded.id || decoded.userId || decoded.user?.id || decoded._id || "";
          const username = decoded.username || decoded.name || decoded.user?.username || "";
          const email = decoded.email || decoded.user?.email || "";
          const role = decoded.role || decoded.user?.role || "";
          
          
          
          const user: UserData = {
            id: userId,
            username: username,
            email: email,
            role: role,
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
