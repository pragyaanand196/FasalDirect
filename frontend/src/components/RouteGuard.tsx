import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    function authCheck(url: string) {
      if (loading) {
        setAuthorized(false);
        return;
      }

      const path = url.split("?")[0];

      const isPublicPath = path === "/" || path.startsWith("/passport");
      const isAuthPath = path === "/login" || path === "/register";
      const isFarmerRoute = path === "/dashboard" || path.startsWith("/dashboard/");
      const isBuyerRoute = path === "/buyer" || path.startsWith("/buyer/");
      const isAdminRoute = path === "/admin" || path.startsWith("/admin/");

      // If already logged in and visiting login or register, redirect to role dashboard
      if (isAuthPath && user) {
        setAuthorized(false);
        if (user.role === "farmer") {
          router.replace("/dashboard");
        } else if (user.role === "buyer") {
          router.replace("/buyer");
        } else if (user.role === "admin") {
          router.replace("/admin");
        }
        return;
      }

      // If accessing protected routes
      if (isFarmerRoute || isBuyerRoute || isAdminRoute) {
        // Not authenticated -> redirect to /login
        if (!user) {
          setAuthorized(false);
          router.replace("/login");
          return;
        }

        // Authenticated but wrong role -> redirect to authorized dashboard
        if (isFarmerRoute && user.role !== "farmer") {
          setAuthorized(false);
          if (user.role === "buyer") router.replace("/buyer");
          else if (user.role === "admin") router.replace("/admin");
          return;
        }

        if (isBuyerRoute && user.role !== "buyer") {
          setAuthorized(false);
          if (user.role === "farmer") router.replace("/dashboard");
          else if (user.role === "admin") router.replace("/admin");
          return;
        }

        if (isAdminRoute && user.role !== "admin") {
          setAuthorized(false);
          if (user.role === "farmer") router.replace("/dashboard");
          else if (user.role === "buyer") router.replace("/buyer");
          return;
        }
      }

      setAuthorized(true);
    }

    authCheck(router.asPath);

    const hideContent = () => setAuthorized(false);
    router.events.on("routeChangeStart", hideContent);
    router.events.on("routeChangeComplete", authCheck);

    return () => {
      router.events.off("routeChangeStart", hideContent);
      router.events.off("routeChangeComplete", authCheck);
    };
  }, [user, loading, router.asPath]);

  // Loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-agri-200 border-t-agri-700 rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500">Verifying session...</p>
      </div>
    );
  }

  // Waiting for redirect if unauthorized
  if (!authorized) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-agri-200 border-t-agri-700 rounded-full animate-spin"></div>
        <p className="text-xs font-semibold text-slate-500">Redirecting...</p>
      </div>
    );
  }

  return <>{children}</>;
};

