import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/lib/authContext";
import { api } from "@/lib/api";
import { NotificationDrawer } from "./NotificationDrawer";
import {
  Sprout,
  Users,
  ShoppingBag,
  Wallet,
  Bell,
  LogOut,
  Menu,
  X,
  Shield,
  Layers,
  BarChart3,
  TrendingUp,
  FileCheck2,
  Globe
} from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.getUnreadNotifCount()
        .then((res) => setUnreadCount(res.unread_count))
        .catch(() => {});
    }
  }, [user, router.pathname]);

  const isActive = (path: string) => router.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-agri-600 to-agri-800 flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6 text-ochre-300" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-agri-950 flex items-center gap-1">
                  Fasal<span className="text-ochre-600">Direct</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                  Collective Farmer Platform
                </span>
              </div>
            </Link>

            {/* Navigation links based on role */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {!user ? (
                <>
                  <Link
                    href="/"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/") ? "bg-agri-50 text-agri-800 font-semibold" : "text-slate-600 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    How It Works
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-semibold text-agri-800 hover:bg-agri-50 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-bold text-white bg-agri-700 hover:bg-agri-800 rounded-lg shadow-sm transition-all"
                  >
                    Register Free
                  </Link>
                </>
              ) : user.role === "farmer" ? (
                <>
                  <Link
                    href="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/dashboard") ? "bg-agri-100/80 text-agri-900 font-bold" : "text-slate-700 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    Overview
                  </Link>
                  <Link
                    href="/dashboard/produce"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive("/dashboard/produce") ? "bg-agri-100/80 text-agri-900 font-bold" : "text-slate-700 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    <Layers className="w-4 h-4 text-agri-600" />
                    <span>My Produce</span>
                  </Link>
                  <Link
                    href="/dashboard/teams"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive("/dashboard/teams") ? "bg-agri-100/80 text-agri-900 font-bold" : "text-slate-700 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    <Users className="w-4 h-4 text-agri-600" />
                    <span>Find My Team</span>
                  </Link>
                  <Link
                    href="/dashboard/negotiations"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive("/dashboard/negotiations") ? "bg-agri-100/80 text-agri-900 font-bold" : "text-slate-700 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-agri-600" />
                    <span>Negotiations</span>
                  </Link>
                  <Link
                    href="/dashboard/wallet"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive("/dashboard/wallet") ? "bg-agri-100/80 text-agri-900 font-bold" : "text-slate-700 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    <Wallet className="w-4 h-4 text-agri-600" />
                    <span>Wallet</span>
                  </Link>
                  <Link
                    href="/dashboard/impact"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive("/dashboard/impact") ? "bg-agri-100/80 text-agri-900 font-bold" : "text-slate-700 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-agri-600" />
                    <span>Impact</span>
                  </Link>
                </>
              ) : user.role === "buyer" ? (
                <>
                  <Link
                    href="/buyer"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/buyer") ? "bg-agri-100/80 text-agri-900 font-bold" : "text-slate-700 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    Buyer Hub
                  </Link>
                  <Link
                    href="/buyer/requirements"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/buyer/requirements") ? "bg-agri-100/80 text-agri-900 font-bold" : "text-slate-700 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    Post Demand
                  </Link>
                  <Link
                    href="/buyer/lots"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/buyer/lots") ? "bg-agri-100/80 text-agri-900 font-bold" : "text-slate-700 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    Browse Teams
                  </Link>
                  <Link
                    href="/buyer/negotiations"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/buyer/negotiations") ? "bg-agri-100/80 text-agri-900 font-bold" : "text-slate-700 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    Negotiations
                  </Link>
                  <Link
                    href="/buyer/purchases"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/buyer/purchases") ? "bg-agri-100/80 text-agri-900 font-bold" : "text-slate-700 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    My Purchases
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/admin"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive("/admin") ? "bg-agri-100/80 text-agri-900 font-bold" : "text-slate-700 hover:text-agri-800 hover:bg-slate-50"
                    }`}
                  >
                    Admin Overview
                  </Link>
                </>
              )}
            </nav>

            {/* Right actions: Notifications & User Profile */}
            <div className="hidden md:flex items-center space-x-3">
              {user && (
                <>
                  <button
                    onClick={() => setNotifDrawerOpen(true)}
                    className="relative p-2 text-slate-600 hover:text-agri-800 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-ochre-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="h-6 w-px bg-slate-200"></div>

                  <div className="flex items-center space-x-2 pl-1">
                    <div className="flex flex-col text-right">
                      <span className="text-xs font-bold text-slate-800">{user.full_name}</span>
                      <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 self-end">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center space-x-2">
              {user && (
                <button
                  onClick={() => setNotifDrawerOpen(true)}
                  className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-ochre-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2 shadow-lg">
            {!user ? (
              <div className="flex flex-col space-y-2 pt-2">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
                >
                  How It Works
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-semibold text-agri-800 hover:bg-agri-50 rounded-lg"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 text-sm font-bold text-white bg-agri-700 text-center rounded-lg shadow-sm"
                >
                  Register Free
                </Link>
              </div>
            ) : user.role === "farmer" ? (
              <div className="flex flex-col space-y-1">
                <div className="px-3 py-2 bg-slate-50 rounded-lg mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{user.full_name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role} • {user.district || "India"}</p>
                  </div>
                  <button onClick={logout} className="text-xs font-semibold text-rose-600">Logout</button>
                </div>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Overview</Link>
                <Link href="/dashboard/produce" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">My Produce</Link>
                <Link href="/dashboard/teams" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Find My Team</Link>
                <Link href="/dashboard/negotiations" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Negotiations</Link>
                <Link href="/dashboard/wallet" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Wallet</Link>
                <Link href="/dashboard/impact" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Sustainability Impact</Link>
              </div>
            ) : user.role === "buyer" ? (
              <div className="flex flex-col space-y-1">
                <div className="px-3 py-2 bg-slate-50 rounded-lg mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{user.full_name}</p>
                    <p className="text-[10px] text-slate-500">{user.business_name || "Buyer"}</p>
                  </div>
                  <button onClick={logout} className="text-xs font-semibold text-rose-600">Logout</button>
                </div>
                <Link href="/buyer" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Buyer Hub</Link>
                <Link href="/buyer/requirements" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Post Demand</Link>
                <Link href="/buyer/lots" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Browse Teams</Link>
                <Link href="/buyer/negotiations" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Negotiations</Link>
                <Link href="/buyer/purchases" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Purchases</Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-1">
                <Link href="/admin" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg">Admin Overview</Link>
                <button onClick={logout} className="text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg">Logout</button>
              </div>
            )}
          </div>
        )}
      </header>

      <NotificationDrawer
        isOpen={notifDrawerOpen}
        onClose={() => setNotifDrawerOpen(false)}
      />
    </>
  );
};
