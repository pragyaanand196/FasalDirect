import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { api } from "./api";

export interface User {
  id: number;
  phone: string;
  email?: string;
  role: "farmer" | "buyer" | "admin";
  full_name: string;
  village?: string;
  district?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  preferred_language?: string;
  business_name?: string;
  buyer_type?: string;
  business_address?: string;
  gst_or_license?: string;
  kyc_verified: boolean;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (phone: string, pass: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem("fasaldirect_token");
      if (storedToken) {
        setToken(storedToken);
        const userData = await api.getMe();
        setUser(userData);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
      localStorage.removeItem("fasaldirect_token");
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (phone: string, pass: string) => {
    const res = await api.login({ phone, password: pass });
    localStorage.setItem("fasaldirect_token", res.access_token);
    setToken(res.access_token);
    const userData = await api.getMe();
    setUser(userData);

    // Redirect to role dashboard
    if (userData.role === "farmer") {
      router.push("/dashboard");
    } else if (userData.role === "buyer") {
      router.push("/buyer");
    } else if (userData.role === "admin") {
      router.push("/admin");
    }
  };

  const logout = () => {
    localStorage.removeItem("fasaldirect_token");
    setUser(null);
    setToken(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
