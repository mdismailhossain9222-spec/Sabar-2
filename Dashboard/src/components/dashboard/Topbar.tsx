"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Bell,
  Menu,
  Sparkles,
  CheckCheck,
  Clock,
  ShoppingBag,
  ChevronRight,
  ShieldCheck,
  X,
} from "lucide-react";
import type { DashboardOrder, DashboardProduct, NavTab } from "./types";

interface TopbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  orders: DashboardOrder[];
  products: DashboardProduct[];
  onSelectOrder: (order: DashboardOrder) => void;
  onSelectTab: (tab: NavTab) => void;
  onOpenMobileMenu: () => void;
  creativeDirector: string;
}

interface AtelierAlert {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
  type: "order" | "stock" | "vip";
}

const INITIAL_ALERTS: AtelierAlert[] = [
  {
    id: "1",
    title: "Centurion Bespoke Order • SBS-9482",
    detail: "Sheikha Al-Maktoum requested 58\" custom hem on Noor Al-Layl Velvet Abaya.",
    time: "12m ago",
    unread: true,
    type: "order",
  },
  {
    id: "2",
    title: "Low Atelier Stock Alert",
    detail: "Hayat Rose-Gold Pleated Gown has only 2 pieces remaining in Jumeirah Vault.",
    time: "48m ago",
    unread: true,
    type: "stock",
  },
  {
    id: "3",
    title: "White-Glove Chauffeur Dispatched",
    detail: "Order SBS-9477 en route to Sector E, Emirates Hills, Dubai.",
    time: "2h ago",
    unread: false,
    type: "vip",
  },
];

export function Topbar({
  searchQuery,
  onSearchChange,
  orders,
  products,
  onSelectOrder,
  onSelectTab,
  onOpenMobileMenu,
  creativeDirector,
}: TopbarProps) {
  const [alerts, setAlerts] = useState<AtelierAlert[]>(INITIAL_ALERTS);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.filter((a) => a.unread).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, unread: false })));
  };

  const trimmed = searchQuery.trim().toLowerCase();
  const matchedOrders = trimmed
    ? orders
        .filter(
          (o) =>
            o.orderNumber.toLowerCase().includes(trimmed) ||
            o.customerName.toLowerCase().includes(trimmed) ||
            o.emirate.toLowerCase().includes(trimmed)
        )
        .slice(0, 3)
    : [];

  const matchedProducts = trimmed
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(trimmed) ||
            p.sku.toLowerCase().includes(trimmed) ||
            p.collection.toLowerCase().includes(trimmed)
        )
        .slice(0, 3)
    : [];

  return (
    <header className="sticky top-0 z-20 h-20 px-4 sm:px-8 lg:px-10 bg-[#1A0A0C]/75 backdrop-blur-2xl border-b border-[#FAF5EF]/10 flex items-center justify-between gap-4">
      {/* Left: Mobile Menu Button + Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
          className="lg:hidden p-2.5 rounded-xl bg-white/[0.04] border border-[#FAF5EF]/10 text-[#FAF5EF] hover:bg-white/[0.08] transition-colors"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>

        {/* Minimalist Glass Search Bar */}
        <div className="relative flex-1">
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-full bg-white/[0.04] border transition-all duration-300 ${
              searchFocused
                ? "border-[#E87272]/60 bg-white/[0.07] shadow-[0_0_25px_rgba(232,114,114,0.18)]"
                : "border-[#FAF5EF]/10 hover:border-[#FAF5EF]/20"
            }`}
          >
            <Search
              className={`w-4 h-4 transition-colors ${
                searchFocused ? "text-[#E87272]" : "text-[#C4B5A6]/60"
              }`}
              strokeWidth={1.5}
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 180)}
              placeholder="Search orders, clientele, Emirates, or couture SKUs..."
              className="w-full bg-transparent text-sm text-[#FAF5EF] placeholder-[#C4B5A6]/45 focus:outline-none"
            />
            {searchQuery ? (
              <button
                onClick={() => onSearchChange("")}
                className="text-[#C4B5A6]/60 hover:text-[#FAF5EF] transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-[#C4B5A6]/50 bg-white/[0.04] rounded-md border border-[#FAF5EF]/10">
                ⌘K
              </kbd>
            )}
          </div>

          {/* Instant Search Results Popover */}
          <AnimatePresence>
            {searchFocused && trimmed.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="absolute left-0 right-0 mt-2 rounded-2xl bg-[#1A0A0C]/95 backdrop-blur-2xl border border-[#FAF5EF]/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden z-50 p-3 space-y-3"
              >
                {matchedOrders.length === 0 && matchedProducts.length === 0 ? (
                  <div className="py-6 text-center text-xs text-[#C4B5A6]/60">
                    No matching orders or garments for &ldquo;{searchQuery}&rdquo;
                  </div>
                ) : (
                  <>
                    {matchedOrders.length > 0 && (
                      <div>
                        <div className="px-2.5 pb-1.5 text-[10px] uppercase tracking-[0.2em] text-[#C4B5A6]/50 font-semibold">
                          Atelier Orders
                        </div>
                        <div className="space-y-1">
                          {matchedOrders.map((order) => (
                            <button
                              key={order.id}
                              onMouseDown={() => {
                                onSelectOrder(order);
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.06] text-left transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <ShoppingBag
                                  className="w-3.5 h-3.5 text-[#E87272]"
                                  strokeWidth={1.5}
                                />
                                <div>
                                  <div className="text-xs font-medium text-[#FAF5EF]">
                                    {order.orderNumber} • {order.customerName}
                                  </div>
                                  <div className="text-[11px] text-[#C4B5A6]/60">
                                    {order.emirate} • {order.status}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-serif tabular-nums text-[#FAF5EF]">
                                AED {order.totalAmount.toLocaleString()}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {matchedProducts.length > 0 && (
                      <div>
                        <div className="px-2.5 pb-1.5 text-[10px] uppercase tracking-[0.2em] text-[#C4B5A6]/50 font-semibold">
                          Couture Lookbook
                        </div>
                        <div className="space-y-1">
                          {matchedProducts.map((product) => (
                            <button
                              key={product.id}
                              onMouseDown={() => {
                                onSelectTab("products");
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/[0.06] text-left transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="w-7 h-9 rounded object-cover border border-[#FAF5EF]/10"
                                />
                                <div>
                                  <div className="text-xs font-medium text-[#FAF5EF]">
                                    {product.name}
                                  </div>
                                  <div className="text-[11px] text-[#C4B5A6]/60">
                                    {product.sku} • {product.stockStatus}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs font-serif tabular-nums text-[#E87272]">
                                AED {product.price.toLocaleString()}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right: Season Pill, Notification Bell & User Profile Avatar */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Live Atelier Status Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-[#FAF5EF]/10 text-xs text-[#C4B5A6]/80">
          <Sparkles className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
          <span className="tracking-wide">Ramadan &amp; Eid Privé Trunk Show</span>
          <span className="text-[#E87272] font-medium tabular-nums">Live</span>
        </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications((prev) => !prev)}
            aria-label="Atelier Notifications"
            className="relative p-2.5 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-[#FAF5EF]/10 text-[#FAF5EF] transition-all duration-300"
          >
            <Bell className="w-4 h-4" strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E87272] ring-4 ring-[#1A0A0C]" />
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#1A0A0C]/95 backdrop-blur-2xl border border-[#FAF5EF]/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden z-50"
              >
                <div className="px-5 py-4 border-b border-[#FAF5EF]/10 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-base text-[#FAF5EF]">
                      Atelier Concierge Alerts
                    </h3>
                    <p className="text-[11px] text-[#C4B5A6]/60">
                      Real-time dispatch &amp; vault telemetry
                    </p>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="inline-flex items-center gap-1 text-[11px] text-[#E87272] hover:underline"
                    >
                      <CheckCheck className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Mark read
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#FAF5EF]/5 max-h-80 overflow-y-auto">
                  {alerts.map((alert) => (
                    <div
                      key={alert.id}
                      onClick={() => {
                        setAlerts((prev) =>
                          prev.map((a) =>
                            a.id === alert.id ? { ...a, unread: false } : a
                          )
                        );
                        if (alert.type === "order") onSelectTab("orders");
                        if (alert.type === "stock") onSelectTab("products");
                        setShowNotifications(false);
                      }}
                      className={`px-5 py-3.5 hover:bg-white/[0.04] transition-colors cursor-pointer ${
                        alert.unread ? "bg-[#4A0E17]/20" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-[#FAF5EF] flex items-center gap-2">
                          {alert.unread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#E87272]" />
                          )}
                          {alert.title}
                        </span>
                        <span className="text-[10px] text-[#C4B5A6]/50 flex items-center gap-1 shrink-0">
                          <Clock className="w-2.5 h-2.5" strokeWidth={1.5} />
                          {alert.time}
                        </span>
                      </div>
                      <p className="text-xs text-[#C4B5A6]/75 mt-1 leading-relaxed">
                        {alert.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="h-7 w-[1px] bg-[#FAF5EF]/10 hidden sm:block" />

        {/* Premium User Profile Avatar */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-3 p-1 pr-2.5 rounded-full bg-white/[0.03] hover:bg-white/[0.07] border border-[#FAF5EF]/10 transition-all duration-300"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#E87272]/50 shadow-[0_0_15px_rgba(232,114,114,0.25)]">
              <img
                src="/images/avatar-simran.jpg"
                alt={creativeDirector}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-[#FAF5EF] leading-tight">
                {creativeDirector}
              </div>
              <div className="text-[10px] uppercase tracking-[0.16em] text-[#E87272]">
                Creative Director
              </div>
            </div>
          </button>

          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#1A0A0C]/95 backdrop-blur-2xl border border-[#FAF5EF]/15 shadow-[0_25px_60px_rgba(0,0,0,0.85)] p-4 z-50"
              >
                <div className="flex items-center gap-3 pb-3 mb-3 border-b border-[#FAF5EF]/10">
                  <img
                    src="/images/avatar-simran.jpg"
                    alt={creativeDirector}
                    className="w-11 h-11 rounded-full object-cover border border-[#E87272]/50"
                  />
                  <div>
                    <div className="font-serif text-sm text-[#FAF5EF]">
                      {creativeDirector}
                    </div>
                    <div className="text-[11px] text-[#C4B5A6]/65">
                      Founder &amp; Directrice
                    </div>
                    <div className="inline-flex items-center gap-1 text-[10px] text-[#6EE7B7] mt-0.5">
                      <ShieldCheck className="w-3 h-3" strokeWidth={1.5} />
                      Maison Keyholder
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      onSelectTab("settings");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#C4B5A6] hover:text-[#FAF5EF] hover:bg-white/[0.05] transition-colors"
                  >
                    <span>Maison Configuration</span>
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => {
                      onSelectTab("customers");
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-[#C4B5A6] hover:text-[#FAF5EF] hover:bg-white/[0.05] transition-colors"
                  >
                    <span>Couture Privé Clientèle</span>
                    <ChevronRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
