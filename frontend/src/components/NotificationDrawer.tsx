import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Check, CheckCheck, X, AlertCircle, ShoppingBag, Users, Wallet } from "lucide-react";
import { api } from "@/lib/api";

interface Notification {
  id: number;
  title: string;
  message: string;
  category: string;
  link?: string;
  read: boolean;
  created_at: string;
}

export const NotificationDrawer: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifs = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifs();
    }
  }, [isOpen]);

  const handleMarkRead = async (id: number) => {
    try {
      await api.markNotifRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotifsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const getIcon = (cat: string) => {
    switch (cat) {
      case "payment":
        return <Wallet className="w-4 h-4 text-emerald-600" />;
      case "sale":
        return <ShoppingBag className="w-4 h-4 text-ochre-600" />;
      case "join_request":
      case "approval":
      case "team_status":
        return <Users className="w-4 h-4 text-agri-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform ease-in-out duration-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-agri-700" />
            <h2 className="text-base font-bold text-slate-800">Notifications & Alerts</h2>
          </div>
          <div className="flex items-center space-x-2">
            {notifications.some((n) => !n.read) && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-agri-700 hover:text-agri-800 font-medium flex items-center gap-1 px-2 py-1 bg-agri-50 rounded"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center">
              <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-600">No notifications yet</p>
              <p className="text-xs text-slate-400 mt-1">Updates on team joins, buyer offers, and payouts will appear here in real-time.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border text-sm transition-all ${
                  n.read
                    ? "bg-white border-slate-200 text-slate-600"
                    : "bg-agri-50/50 border-agri-200 text-slate-800 font-medium shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                      {getIcon(n.category)}
                    </span>
                    <span className="font-semibold text-slate-900 text-xs sm:text-sm">{n.title}</span>
                  </div>
                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="text-xs text-slate-400 hover:text-agri-700 p-1"
                      title="Mark as read"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{n.message}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  {n.link && (
                    <Link
                      href={n.link}
                      onClick={onClose}
                      className="text-agri-700 hover:underline font-semibold"
                    >
                      View Details →
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
