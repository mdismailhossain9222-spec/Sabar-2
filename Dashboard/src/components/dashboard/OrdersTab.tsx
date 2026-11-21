"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Plus,
  X,
  Sparkles,
  Radio,
} from "lucide-react";
import type {
  DashboardOrder,
  DashboardProduct,
  EmirateName,
  OrderStatus,
} from "./types";
import { OrderStatusBadge } from "./StatusBadge";

interface OrdersTabProps {
  orders: DashboardOrder[];
  products: DashboardProduct[];
  onSelectOrder: (order: DashboardOrder) => void;
  onCreateOrder: (payload: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    emirate: EmirateName;
    status: OrderStatus;
    productId: number;
    size: string;
    notes: string;
  }) => Promise<void>;
}

const EMIRATES: ("All" | EmirateName)[] = [
  "All",
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ras Al Khaimah",
  "Ajman",
  "Fujairah",
];

const STATUSES: ("All" | OrderStatus)[] = [
  "All",
  "Pending",
  "Shipped",
  "Delivered",
];

const DATE_RANGES = [
  { id: "all", label: "All Dates" },
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "90d", label: "This Quarter" },
] as const;

export function OrdersTab({
  orders,
  products,
  onSelectOrder,
  onCreateOrder,
}: OrdersTabProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | OrderStatus>("All");
  const [emirateFilter, setEmirateFilter] = useState<"All" | EmirateName>("All");
  const [dateRangeFilter, setDateRangeFilter] = useState<"all" | "7d" | "30d" | "90d">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // New Bespoke Order Modal State
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("+971 50 ");
  const [shippingAddress, setShippingAddress] = useState("");
  const [selectedEmirate, setSelectedEmirate] = useState<EmirateName>("Dubai");
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("Pending");
  const [selectedProductId, setSelectedProductId] = useState<number>(
    products[0]?.id ?? 1
  );
  const [selectedSize, setSelectedSize] = useState("M");
  const [orderNotes, setOrderNotes] = useState("");

  // Reference anchor date (latest order date in dataset or current date)
  const referenceNow = useMemo(() => {
    if (!orders.length) return new Date("2026-03-29T23:59:59.000Z").getTime();
    const maxTime = Math.max(...orders.map((o) => new Date(o.orderDate).getTime()));
    return maxTime;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "All" && order.status !== statusFilter) {
        return false;
      }
      if (emirateFilter !== "All" && order.emirate !== emirateFilter) {
        return false;
      }
      if (dateRangeFilter !== "all") {
        const orderTime = new Date(order.orderDate).getTime();
        const diffDays = (referenceNow - orderTime) / (1000 * 60 * 60 * 24);
        if (dateRangeFilter === "7d" && diffDays > 7) return false;
        if (dateRangeFilter === "30d" && diffDays > 30) return false;
        if (dateRangeFilter === "90d" && diffDays > 90) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesId = order.orderNumber.toLowerCase().includes(q);
        const matchesCustomer = order.customerName.toLowerCase().includes(q);
        const matchesEmail = order.customerEmail.toLowerCase().includes(q);
        const matchesEmirate = order.emirate.toLowerCase().includes(q);
        const matchesItem = order.items.some((i) =>
          i.name.toLowerCase().includes(q)
        );
        if (
          !matchesId &&
          !matchesCustomer &&
          !matchesEmail &&
          !matchesEmirate &&
          !matchesItem
        ) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, emirateFilter, dateRangeFilter, search, referenceNow]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = filteredOrders.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setEmirateFilter("All");
    setDateRangeFilter("all");
    setCurrentPage(1);
  };

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;
    setSubmittingOrder(true);
    try {
      await onCreateOrder({
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim() || "client@prive.ae",
        customerPhone: customerPhone.trim() || "+971 50 800 1000",
        shippingAddress:
          shippingAddress.trim() || "Al Wasl Road, Jumeirah 1, Dubai",
        emirate: selectedEmirate,
        status: selectedStatus,
        productId: selectedProductId,
        size: selectedSize,
        notes: orderNotes.trim(),
      });
      setShowNewOrderModal(false);
      setCustomerName("");
      setCustomerEmail("");
      setShippingAddress("");
      setOrderNotes("");
    } finally {
      setSubmittingOrder(false);
    }
  };

  const pendingCount = orders.filter((o) => o.status === "Pending").length;
  const shippedCount = orders.filter((o) => o.status === "Shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45 }}
      className="space-y-7"
    >
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-3 border-b border-[#FAF5EF]/10">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#E87272] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>White-Glove Dispatch &amp; Fulfilment</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#FAF5EF] tracking-[-0.02em] leading-[1.12]">
            Order Management
          </h2>
          <div className="flex items-center gap-3 mt-2">
            {/* Live Tracking Indicator */}
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#6EE7B7]/15 border border-[#6EE7B7]/30 text-[#6EE7B7] text-[10px] font-semibold uppercase tracking-[0.18em]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-[#6EE7B7] animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#6EE7B7]" />
              </span>
              Live Tracking
            </span>
          </div>
          <p className="text-sm text-[#C4B5A6]/75 mt-1.5">
            Inspect client acquisitions, coordinate chauffeur deliveries across the
            Emirates, and manage bespoke fittings.
          </p>
        </div>

        {/* Status Quick Summary Pills + Record Bespoke Order */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-[#FAF5EF]/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#E87272]" />
            <span className="text-[#C4B5A6]/75">Pending:</span>
            <strong className="text-[#FAF5EF] tabular-nums">{pendingCount}</strong>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-[#FAF5EF]/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37]" />
            <span className="text-[#C4B5A6]/75">Shipped:</span>
            <strong className="text-[#FAF5EF] tabular-nums">{shippedCount}</strong>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/[0.03] border border-[#FAF5EF]/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#6EE7B7]" />
            <span className="text-[#C4B5A6]/75">Delivered:</span>
            <strong className="text-[#FAF5EF] tabular-nums">{deliveredCount}</strong>
          </div>

          <button
            onClick={() => setShowNewOrderModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4A0E17] to-[#2B070D] border border-[#E87272]/50 text-xs font-medium text-[#FAF5EF] shadow-[0_0_20px_rgba(232,114,114,0.25)] hover:shadow-[0_0_28px_rgba(232,114,114,0.45)] transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.75} />
            <span>New Bespoke Order</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-5 rounded-2xl luxury-glass">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 items-center">
          {/* Search Input */}
          <div className="lg:col-span-4 relative">
            <Search
              className="w-4 h-4 text-[#C4B5A6]/60 absolute left-3.5 top-1/2 -translate-y-1/2"
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search Order ID, Client Name, or Garment..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/35 border border-[#FAF5EF]/10 focus:border-[#E87272]/50 text-xs text-[#FAF5EF] placeholder-[#C4B5A6]/45 focus:outline-none transition-colors"
            />
          </div>

          {/* Order Status Dropdown */}
          <div className="lg:col-span-3 flex flex-col">
            <label
              htmlFor="filter-order-status"
              className="sr-only"
            >
              Order Status
            </label>
            <div className="relative flex items-center">
              <Filter
                className="w-3.5 h-3.5 text-[#E87272] absolute left-3.5 pointer-events-none"
                strokeWidth={1.5}
              />
              <select
                id="filter-order-status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as "All" | OrderStatus);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/35 border border-[#FAF5EF]/10 focus:border-[#E87272]/50 text-xs text-[#FAF5EF] focus:outline-none appearance-none cursor-pointer"
              >
                {STATUSES.map((st) => (
                  <option key={st} value={st} className="bg-[#1A0A0C] text-[#FAF5EF]">
                    {st === "All" ? "Status: All Statuses" : `Status: ${st}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range Dropdown */}
          <div className="lg:col-span-2 flex flex-col">
            <label htmlFor="filter-date-range" className="sr-only">
              Date Range
            </label>
            <div className="relative flex items-center">
              <Calendar
                className="w-3.5 h-3.5 text-[#E87272] absolute left-3.5 pointer-events-none"
                strokeWidth={1.5}
              />
              <select
                id="filter-date-range"
                value={dateRangeFilter}
                onChange={(e) => {
                  setDateRangeFilter(
                    e.target.value as "all" | "7d" | "30d" | "90d"
                  );
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/35 border border-[#FAF5EF]/10 focus:border-[#E87272]/50 text-xs text-[#FAF5EF] focus:outline-none appearance-none cursor-pointer"
              >
                {DATE_RANGES.map((dr) => (
                  <option
                    key={dr.id}
                    value={dr.id}
                    className="bg-[#1A0A0C] text-[#FAF5EF]"
                  >
                    {dr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Emirate Dropdown */}
          <div className="lg:col-span-2 flex flex-col">
            <label htmlFor="filter-emirate" className="sr-only">
              Emirate
            </label>
            <div className="relative flex items-center">
              <MapPin
                className="w-3.5 h-3.5 text-[#E87272] absolute left-3.5 pointer-events-none"
                strokeWidth={1.5}
              />
              <select
                id="filter-emirate"
                value={emirateFilter}
                onChange={(e) => {
                  setEmirateFilter(e.target.value as "All" | EmirateName);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-black/35 border border-[#FAF5EF]/10 focus:border-[#E87272]/50 text-xs text-[#FAF5EF] focus:outline-none appearance-none cursor-pointer"
              >
                {EMIRATES.map((em) => (
                  <option key={em} value={em} className="bg-[#1A0A0C] text-[#FAF5EF]">
                    {em === "All" ? "All Emirates" : em}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Button */}
          <div className="lg:col-span-1 flex justify-end">
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="w-full lg:w-auto px-3 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[#FAF5EF]/10 text-xs text-[#C4B5A6] hover:text-[#FAF5EF] flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span className="lg:hidden">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Custom Luxury Grid/Flex Order List (No standard HTML table) */}
      <div className="rounded-2xl p-5 sm:p-7 luxury-glass space-y-3">
        {/* Column Headers */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-3 rounded-xl bg-black/30 border border-[#FAF5EF]/5 text-[11px] uppercase tracking-[0.18em] text-[#C4B5A6]/60 font-semibold">
          <div className="col-span-2">Order ID</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-1">Emirate</div>
          <div className="col-span-1">Total</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1 text-right">Action</div>
        </div>

        {paginatedOrders.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <p className="font-serif text-xl text-[#FAF5EF]">
              No Atelier Orders Match Your Selection
            </p>
            <p className="text-xs text-[#C4B5A6]/65 max-w-md mx-auto">
              Adjust your Emirate, Status, or Date Range filters to view matching client
              acquisitions.
            </p>
            <button
              onClick={resetFilters}
              className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-[#E87272]/20 border border-[#E87272]/40 text-xs text-[#FAF5EF] transition-all"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {paginatedOrders.map((order, index) => {
              const formattedDate = new Date(order.orderDate).toLocaleDateString(
                "en-AE",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              );
              const primaryItem = order.items?.[0];

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.35 }}
                  onClick={() => onSelectOrder(order)}
                  className="group grid grid-cols-1 lg:grid-cols-12 items-center gap-4 px-5 py-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.06] border border-[#FAF5EF]/[0.06] hover:border-[#E87272]/35 transition-all duration-300 cursor-pointer"
                >
                  {/* Order ID */}
                  <div className="lg:col-span-2 flex items-center justify-between lg:justify-start">
                    <span className="font-mono text-xs font-semibold text-[#FAF5EF] tracking-wider px-2.5 py-1 rounded-lg bg-white/[0.04] border border-[#FAF5EF]/10 group-hover:border-[#E87272]/40 tabular-nums">
                      #{order.orderNumber}
                    </span>
                    <span className="lg:hidden">
                      <OrderStatusBadge status={order.status} />
                    </span>
                  </div>

                  {/* Date */}
                  <div className="lg:col-span-2 text-xs text-[#C4B5A6]/75 tabular-nums">
                    {formattedDate}
                  </div>

                  {/* Customer */}
                  <div className="lg:col-span-3 flex items-center gap-3 min-w-0">
                    {primaryItem?.image && (
                      <img
                        src={primaryItem.image}
                        alt={primaryItem.name}
                        className="w-9 h-11 rounded-lg object-cover border border-[#FAF5EF]/15 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#FAF5EF] truncate">
                        {order.customerName}
                      </div>
                      <div className="text-[11px] text-[#C4B5A6]/60 truncate">
                        {order.customerEmail}
                      </div>
                    </div>
                  </div>

                  {/* Emirate */}
                  <div className="lg:col-span-1 flex items-center gap-1.5 text-xs text-[#FAF5EF]/90">
                    <MapPin
                      className="w-3.5 h-3.5 text-[#E87272] shrink-0"
                      strokeWidth={1.5}
                    />
                    <span className="truncate">{order.emirate}</span>
                  </div>

                  {/* Total */}
                  <div className="lg:col-span-1 font-serif text-base text-[#FAF5EF] tabular-nums">
                    AED {order.totalAmount.toLocaleString()}
                  </div>

                  {/* Status Badge */}
                  <div className="hidden lg:flex lg:col-span-2">
                    <OrderStatusBadge status={order.status} />
                  </div>

                  {/* Action */}
                  <div className="lg:col-span-1 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(order);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] group-hover:bg-[#E87272]/20 border border-[#FAF5EF]/10 group-hover:border-[#E87272]/45 text-xs font-medium text-[#FAF5EF] transition-all whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
                      <span>View Details</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Elegant Pagination Bar */}
        <div className="pt-5 mt-4 border-t border-[#FAF5EF]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#C4B5A6]/70 tabular-nums">
            Showing{" "}
            <strong className="text-[#FAF5EF]">
              {filteredOrders.length === 0 ? 0 : (safePage - 1) * pageSize + 1}
            </strong>{" "}
            to{" "}
            <strong className="text-[#FAF5EF]">
              {Math.min(safePage * pageSize, filteredOrders.length)}
            </strong>{" "}
            of <strong className="text-[#FAF5EF]">{filteredOrders.length}</strong>{" "}
            atelier orders
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-35 border border-[#FAF5EF]/10 text-[#FAF5EF] transition-all"
              aria-label="Previous Page"
            >
              <ChevronLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-9 h-9 rounded-xl text-xs font-medium tabular-nums transition-all ${
                  safePage === pageNum
                    ? "bg-gradient-to-br from-[#E87272]/25 to-[#4A0E17] text-[#FAF5EF] border border-[#E87272]/50 shadow-[0_0_14px_rgba(232,114,114,0.25)]"
                    : "bg-white/[0.03] text-[#C4B5A6]/70 hover:text-[#FAF5EF] border border-[#FAF5EF]/10"
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] disabled:opacity-35 border border-[#FAF5EF]/10 text-[#FAF5EF] transition-all"
              aria-label="Next Page"
            >
              <ChevronRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* New Bespoke Order Modal */}
      <AnimatePresence>
        {showNewOrderModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewOrderModal(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-lg rounded-3xl bg-[#1A0A0C]/95 backdrop-blur-2xl border border-[#FAF5EF]/15 shadow-[0_30px_80px_rgba(0,0,0,0.9)] p-6 sm:p-8 pointer-events-auto max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#FAF5EF]/10">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-[#E87272] font-semibold">
                      Private Client Acquisition
                    </span>
                    <h3 className="font-serif text-2xl text-[#FAF5EF] mt-0.5">
                      Record Bespoke Order
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowNewOrderModal(false)}
                    className="p-2 rounded-full bg-white/[0.05] text-[#C4B5A6] hover:text-[#FAF5EF]"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                <form onSubmit={handleCreateOrderSubmit} className="space-y-4 mt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                        Client Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="e.g. Sheikha Al-Qassimi"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                        Emirate *
                      </label>
                      <select
                        value={selectedEmirate}
                        onChange={(e) =>
                          setSelectedEmirate(e.target.value as EmirateName)
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      >
                        {EMIRATES.filter((e) => e !== "All").map((em) => (
                          <option
                            key={em}
                            value={em}
                            className="bg-[#1A0A0C] text-[#FAF5EF]"
                          >
                            {em}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                        Client Email
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="client@palace-office.ae"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                        Concierge Phone
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none tabular-nums"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                      Residence Delivery Address
                    </label>
                    <input
                      type="text"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Villa 12, Palm Jumeirah Frond G, Dubai"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                        Couture Piece
                      </label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      >
                        {products.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                            className="bg-[#1A0A0C] text-[#FAF5EF]"
                          >
                            {p.name} — AED {p.price.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                        Size
                      </label>
                      <select
                        value={selectedSize}
                        onChange={(e) => setSelectedSize(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      >
                        {["XS", "S", "M", "L", "Custom"].map((sz) => (
                          <option
                            key={sz}
                            value={sz}
                            className="bg-[#1A0A0C] text-[#FAF5EF]"
                          >
                            {sz}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                      Tailoring &amp; Delivery Notes
                    </label>
                    <textarea
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Custom length, gift calligraphy, or evening chauffeur request..."
                      className="w-full px-3.5 py-2 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                    />
                  </div>

                  <div className="pt-3 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowNewOrderModal(false)}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-xs text-[#C4B5A6] hover:text-[#FAF5EF]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingOrder}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A0E17] to-[#2B070D] border border-[#E87272]/60 text-xs font-medium text-[#FAF5EF] shadow-[0_0_20px_rgba(232,114,114,0.3)]"
                    >
                      {submittingOrder ? "Recording..." : "Confirm Acquisition"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
