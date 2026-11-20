"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  ShoppingBag,
  Sparkles,
  Users,
  Sliders,
  X,
  Compass,
  Crown,
  ArrowUpRight,
} from "lucide-react";
import type { NavTab } from "./types";

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingOrdersCount: number;
  lowStockCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenNewProductModal: () => void;
}

const NAV_ITEMS: {
  id: NavTab;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}[] = [
  {
    id: "overview",
    label: "Overview",
    subtitle: "Maison Intelligence",
    icon: LayoutGrid,
  },
  {
    id: "orders",
    label: "Orders",
    subtitle: "Atelier Dispatch",
    icon: ShoppingBag,
  },
  {
    id: "products",
    label: "Products",
    subtitle: "Couture Lookbook",
    icon: Sparkles,
  },
  {
    id: "customers",
    label: "Customers",
    subtitle: "Privé Clientèle",
    icon: Users,
  },
  {
    id: "settings",
    label: "Settings",
    subtitle: "Maison Config",
    icon: Sliders,
  },
];

export function Sidebar({
  activeTab,
  onSelectTab,
  pendingOrdersCount,
  lowStockCount,
  mobileOpen,
  onCloseMobile,
  onOpenNewProductModal,
}: SidebarProps) {
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full justify-between select-none">
      {/* Top Brand Masthead */}
      <div>
        <div className="px-7 pt-8 pb-7 border-b border-[#FAF5EF]/10 relative">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                onSelectTab("overview");
                onCloseMobile();
              }}
              className="text-left group focus:outline-none"
            >
              <div className="flex items-center gap-2.5 mb-1.5">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-[#E87272]/30 to-[#4A0E17] border border-[#E87272]/40">
                  <Crown className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
                </span>
                <span className="text-[10px] uppercase tracking-[0.28em] text-[#E87272] font-medium">
                  Maison Privée
                </span>
              </div>
              <h1 className="font-serif text-2xl tracking-[-0.02em] text-[#FAF5EF] group-hover:text-white transition-colors">
                Sabr By Simran
              </h1>
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#C4B5A6]/60 mt-1">
                Atelier Archive • Dubai
              </p>
            </button>

            <button
              onClick={onCloseMobile}
              aria-label="Close navigation menu"
              className="lg:hidden p-2 rounded-lg text-[#C4B5A6] hover:text-[#FAF5EF] hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="px-4 py-6">
          <div className="px-3 mb-3 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#C4B5A6]/50 font-semibold">
              Editorial Suite
            </span>
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#E87272]/80 font-mono">
              AW26
            </span>
          </div>

          <nav className="space-y-1.5" aria-label="Main Navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full group relative flex items-center justify-between px-4 py-3.5 rounded-xl text-left transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-[#E87272]/18 via-[#4A0E17]/40 to-transparent text-[#FAF5EF] border-l-2 border-[#E87272] shadow-[0_8px_25px_rgba(0,0,0,0.35)]"
                      : "text-[#C4B5A6]/75 hover:text-[#FAF5EF] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`p-2 rounded-lg transition-colors duration-300 ${
                        isActive
                          ? "bg-[#E87272]/20 text-[#E87272] shadow-[0_0_15px_rgba(232,114,114,0.25)]"
                          : "bg-white/[0.03] text-[#C4B5A6]/70 group-hover:text-[#FAF5EF] group-hover:bg-white/[0.06]"
                      }`}
                    >
                      <Icon className="w-4 h-4" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div
                        className={`text-sm tracking-[0.02em] ${
                          isActive ? "font-semibold text-[#FAF5EF]" : "font-medium"
                        }`}
                      >
                        {item.label}
                      </div>
                      <div className="text-[11px] text-[#C4B5A6]/50 tracking-wide">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Badges */}
                  <div className="flex items-center gap-2">
                    {item.id === "orders" && pendingOrdersCount > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-medium tabular-nums rounded-full bg-[#E87272]/20 text-[#E87272] border border-[#E87272]/35">
                        {pendingOrdersCount}
                      </span>
                    )}
                    {item.id === "products" && lowStockCount > 0 && (
                      <span className="px-2 py-0.5 text-[10px] font-medium tabular-nums rounded-full bg-[#D4AF37]/15 text-[#FAF5EF]/90 border border-[#D4AF37]/30">
                        {lowStockCount} low
                      </span>
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="activeNavDot"
                        className="w-1.5 h-1.5 rounded-full bg-[#E87272] shadow-[0_0_10px_#E87272]"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Atelier Concierge Card */}
      <div className="p-4 space-y-3 border-t border-[#FAF5EF]/10">
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4A0E17]/60 via-[#1A0A0C]/80 to-[#1A0A0C] border border-[#FAF5EF]/10 relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-[#E87272]/10 blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[#E87272] font-semibold">
              <Compass className="w-3.5 h-3.5" strokeWidth={1.5} />
              Nocturne d&apos;Or
            </span>
            <span className="w-2 h-2 rounded-full bg-[#6EE7B7] animate-pulse" />
          </div>
          <p className="font-serif text-sm text-[#FAF5EF] leading-snug mb-1">
            Jumeirah 1 Private Atelier
          </p>
          <p className="text-xs text-[#C4B5A6]/70 leading-relaxed mb-3.5">
            Chauffeur dispatch active across all 7 Emirates.
          </p>
          <button
            onClick={() => {
              onSelectTab("products");
              onOpenNewProductModal();
              onCloseMobile();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-white/[0.06] hover:bg-[#E87272]/20 border border-[#E87272]/40 text-xs font-medium text-[#FAF5EF] flex items-center justify-center gap-1.5 transition-all duration-300 shadow-[0_0_18px_rgba(232,114,114,0.18)]"
          >
            <span>Curate New Piece</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-2 flex items-center justify-between text-[11px] text-[#C4B5A6]/45">
          <span>SUPABASE • SYNCED</span>
          <span className="tabular-nums">v2.6 LUXE</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:w-[280px] lg:flex-col lg:fixed lg:inset-y-0 z-30 bg-[#1A0A0C]/85 backdrop-blur-2xl border-r border-[#FAF5EF]/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)]">
        {renderSidebarContent()}
      </aside>

      {/* Mobile & Tablet Slide-Over Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="fixed inset-y-0 left-0 z-50 w-[285px] bg-[#1A0A0C]/95 backdrop-blur-2xl border-r border-[#FAF5EF]/15 lg:hidden"
            >
              {renderSidebarContent()}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
