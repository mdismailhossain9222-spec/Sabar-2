"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Phone,
  Mail,
  MapPin,
  Truck,
  CreditCard,
  FileText,
  Check,
  Sparkles,
  Calendar,
  ShoppingBag,
} from "lucide-react";
import type { DashboardOrder, OrderStatus } from "./types";
import { OrderStatusBadge } from "./StatusBadge";

interface OrderDrawerProps {
  order: DashboardOrder | null;
  onClose: () => void;
  onUpdateOrder: (
    orderId: number,
    updates: { status?: OrderStatus; notes?: string; courierService?: string }
  ) => Promise<void>;
}

const STATUS_OPTIONS: OrderStatus[] = ["Pending", "Shipped", "Delivered"];

export function OrderDrawer({ order, onClose, onUpdateOrder }: OrderDrawerProps) {
  const [notes, setNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSavedToast, setNotesSavedToast] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<OrderStatus | null>(null);

  useEffect(() => {
    if (order) {
      setNotes(order.notes || "");
      setNotesSavedToast(false);
    }
  }, [order]);

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order || order.status === newStatus) return;
    setUpdatingStatus(newStatus);
    try {
      await onUpdateOrder(order.id, { status: newStatus });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!order) return;
    setSavingNotes(true);
    try {
      await onUpdateOrder(order.id, { notes });
      setNotesSavedToast(true);
      setTimeout(() => setNotesSavedToast(false), 2500);
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <AnimatePresence>
      {order && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm"
          />

          {/* Slide-Over Side Drawer */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            aria-label="Order Details Dossier"
            className="fixed inset-y-0 right-0 z-50 w-full max-w-[540px] bg-[#1A0A0C]/95 backdrop-blur-2xl border-l border-[#FAF5EF]/15 shadow-[-30px_0_80px_rgba(0,0,0,0.85)] flex flex-col justify-between overflow-hidden"
          >
            {/* Top Drawer Header */}
            <div className="px-7 py-6 border-b border-[#FAF5EF]/10 bg-gradient-to-r from-[#4A0E17]/45 via-[#1A0A0C] to-[#1A0A0C] flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="font-mono text-xs font-semibold tracking-wider px-2.5 py-1 rounded-md bg-white/[0.06] border border-[#FAF5EF]/15 text-[#FAF5EF] tabular-nums">
                    #{order.orderNumber}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <h2 className="font-serif text-2xl text-[#FAF5EF] tracking-[-0.01em]">
                  Client Acquisition Dossier
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#C4B5A6]/65 mt-1 tabular-nums">
                  <Calendar className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
                  <span>
                    Ordered{" "}
                    {new Date(order.orderDate).toLocaleDateString("en-AE", {
                      weekday: "short",
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close Order Details"
                className="p-2.5 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-[#FAF5EF]/10 text-[#C4B5A6] hover:text-[#FAF5EF] transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto px-7 py-6 space-y-6">
              {/* Interactive Dispatch Status Switcher */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-[#FAF5EF]/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#E87272] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Atelier Dispatch Stage
                  </span>
                  <span className="text-[11px] text-[#C4B5A6]/60">
                    Click to update status
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {STATUS_OPTIONS.map((st) => {
                    const active = order.status === st;
                    return (
                      <button
                        key={st}
                        disabled={updatingStatus !== null}
                        onClick={() => handleStatusChange(st)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-center gap-1.5 ${
                          active
                            ? st === "Pending"
                              ? "bg-[#E87272]/20 text-[#E87272] border-[#E87272]/50 shadow-[0_0_15px_rgba(232,114,114,0.2)]"
                              : st === "Shipped"
                              ? "bg-[#D4AF37]/20 text-[#FAF5EF] border-[#D4AF37]/50 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                              : "bg-[#6EE7B7]/20 text-[#6EE7B7] border-[#6EE7B7]/50 shadow-[0_0_15px_rgba(110,231,183,0.2)]"
                            : "bg-white/[0.02] text-[#C4B5A6]/70 border-[#FAF5EF]/10 hover:bg-white/[0.06] hover:text-[#FAF5EF]"
                        }`}
                      >
                        {active && <Check className="w-3.5 h-3.5" strokeWidth={2} />}
                        <span>{updatingStatus === st ? "Saving..." : st}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Client Contact & Delivery Residence */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-[#FAF5EF]/10 space-y-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-[#C4B5A6]/60 font-semibold">
                  Private Client &amp; Destination
                </div>

                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-serif text-xl text-[#FAF5EF]">
                      {order.customerName}
                    </div>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.16em] bg-[#4A0E17] text-[#E87272] border border-[#E87272]/30">
                      {order.emirate} • Privé Client
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#FAF5EF]/10 text-xs">
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="w-4 h-4 text-[#E87272] shrink-0 mt-0.5"
                      strokeWidth={1.5}
                    />
                    <div>
                      <div className="text-[#C4B5A6]/55 text-[11px] uppercase tracking-wider">
                        Residence Delivery Address
                      </div>
                      <div className="text-[#FAF5EF] mt-0.5 leading-relaxed">
                        {order.shippingAddress}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/25 border border-[#FAF5EF]/5">
                      <Phone className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
                      <span className="text-[#FAF5EF] tabular-nums">
                        {order.customerPhone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/25 border border-[#FAF5EF]/5 truncate">
                      <Mail className="w-3.5 h-3.5 text-[#E87272] shrink-0" strokeWidth={1.5} />
                      <span className="text-[#FAF5EF] truncate">{order.customerEmail}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/25 border border-[#FAF5EF]/5">
                      <Truck className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" strokeWidth={1.5} />
                      <span className="text-[#C4B5A6]/90 truncate text-[11px]">
                        {order.courierService}
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/25 border border-[#FAF5EF]/5">
                      <CreditCard
                        className="w-3.5 h-3.5 text-[#6EE7B7] shrink-0"
                        strokeWidth={1.5}
                      />
                      <span className="text-[#C4B5A6]/90 truncate text-[11px] tabular-nums">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ordered Couture Garments */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#C4B5A6]/60 font-semibold flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
                    Ordered Couture Pieces ({order.items.length})
                  </span>
                  <span className="text-xs text-[#C4B5A6]/60 tabular-nums">
                    Complimentary Garment Bag Included
                  </span>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, i) => (
                    <div
                      key={`${item.sku}-${i}`}
                      className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/[0.03] border border-[#FAF5EF]/10 hover:border-[#FAF5EF]/20 transition-all"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-20 rounded-xl object-cover border border-[#FAF5EF]/15 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-[#E87272]">
                          {item.sku}
                        </div>
                        <div className="font-serif text-base text-[#FAF5EF] truncate">
                          {item.name}
                        </div>
                        {item.fabric && (
                          <div className="text-[11px] text-[#C4B5A6]/65 truncate mt-0.5">
                            {item.fabric}
                          </div>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-[#C4B5A6]/80">
                          <span className="px-2 py-0.5 rounded bg-white/[0.05] border border-[#FAF5EF]/10">
                            Size: <strong className="text-[#FAF5EF]">{item.size}</strong>
                          </span>
                          <span className="tabular-nums">
                            Qty: <strong className="text-[#FAF5EF]">{item.quantity}</strong>
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-serif text-base text-[#FAF5EF] tabular-nums">
                          AED {(item.price * item.quantity).toLocaleString()}
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-[#C4B5A6]/55 tabular-nums">
                            AED {item.price.toLocaleString()} each
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tailoring & Concierge Notes */}
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-[#FAF5EF]/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="atelier-order-notes"
                    className="text-[11px] uppercase tracking-[0.2em] text-[#C4B5A6]/60 font-semibold flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
                    Bespoke Tailoring &amp; Chauffeur Notes
                  </label>
                  {notesSavedToast && (
                    <span className="text-[11px] text-[#6EE7B7] flex items-center gap-1">
                      <Check className="w-3 h-3" strokeWidth={2} />
                      Saved to Dossier
                    </span>
                  )}
                </div>

                <textarea
                  id="atelier-order-notes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter custom hem measurements, monogram instructions, or white-glove delivery preferences..."
                  className="w-full rounded-xl bg-black/35 border border-[#FAF5EF]/10 focus:border-[#E87272]/50 p-3 text-xs text-[#FAF5EF] placeholder-[#C4B5A6]/40 focus:outline-none leading-relaxed"
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="px-4 py-1.5 rounded-lg bg-white/[0.06] hover:bg-[#E87272]/20 border border-[#FAF5EF]/15 hover:border-[#E87272]/40 text-xs font-medium text-[#FAF5EF] transition-all"
                  >
                    {savingNotes ? "Updating..." : "Save Dossier Note"}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Summary Footer */}
            <div className="px-7 py-5 border-t border-[#FAF5EF]/10 bg-[#1A0A0C] flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-[#C4B5A6]/60">
                  Total Settlement (Inc. 5% UAE VAT)
                </div>
                <div className="font-serif text-2xl text-[#FAF5EF] tabular-nums">
                  AED {order.totalAmount.toLocaleString()}
                </div>
              </div>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A0E17] to-[#2D080E] border border-[#E87272]/50 text-xs font-medium text-[#FAF5EF] hover:shadow-[0_0_20px_rgba(232,114,114,0.3)] transition-all"
              >
                Done Reviewing
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
