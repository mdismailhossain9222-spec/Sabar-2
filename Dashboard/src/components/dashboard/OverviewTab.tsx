"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  ArrowUpRight,
  Eye,
  Sparkles,
  MapPin,
  Clock,
  Layers,
  Plus,
} from "lucide-react";
import type {
  DashboardOrder,
  EmirateDistributionItem,
  NavTab,
  RevenuePoint,
} from "./types";
import { OrderStatusBadge, MiniSparkline } from "./StatusBadge";

interface OverviewTabProps {
  orders: DashboardOrder[];
  revenueChartData: Record<"7D" | "30D" | "90D" | "12M", RevenuePoint[]>;
  emirateBase: EmirateDistributionItem[];
  onSelectOrder: (order: DashboardOrder) => void;
  onNavigateTab: (tab: NavTab) => void;
  onOpenNewProductModal: () => void;
}

interface CustomTooltipPayloadItem {
  value: number;
  payload: RevenuePoint;
}

function RevenueTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: CustomTooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-2xl bg-[#1A0A0C]/95 backdrop-blur-2xl border border-[#FAF5EF]/15 px-4 py-3.5 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      <div className="text-[10px] uppercase tracking-[0.2em] text-[#E87272] font-semibold mb-1">
        {label} • Atelier Telemetry
      </div>
      <div className="font-serif text-xl text-[#FAF5EF] tabular-nums">
        AED {point.revenue.toLocaleString()}
      </div>
      <div className="mt-2 pt-2 border-t border-[#FAF5EF]/10 flex items-center justify-between gap-5 text-xs text-[#C4B5A6]/80">
        <span>
          Orders: <strong className="text-[#FAF5EF] tabular-nums">{point.orders}</strong>
        </span>
        <span>
          AOV:{" "}
          <strong className="text-[#FAF5EF] tabular-nums">
            AED {point.aov.toLocaleString()}
          </strong>
        </span>
      </div>
    </div>
  );
}

interface EmirateTooltipPayloadItem {
  payload: EmirateDistributionItem;
}

function EmirateTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: EmirateTooltipPayloadItem[];
}) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-2xl bg-[#1A0A0C]/95 backdrop-blur-2xl border border-[#FAF5EF]/15 px-4 py-3 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      <div className="flex items-center gap-2 mb-1">
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: item.color }}
        />
        <span className="text-xs font-semibold text-[#FAF5EF] uppercase tracking-wider">
          {item.emirate}
        </span>
      </div>
      <div className="font-serif text-lg text-[#FAF5EF] tabular-nums">
        {item.orders} Orders{" "}
        <span className="text-xs font-sans text-[#E87272]">({item.share}%)</span>
      </div>
      <div className="text-xs text-[#C4B5A6]/70 tabular-nums mt-0.5">
        Volume: AED {item.revenue.toLocaleString()}
      </div>
    </div>
  );
}

export function OverviewTab({
  orders,
  revenueChartData,
  emirateBase,
  onSelectOrder,
  onNavigateTab,
  onOpenNewProductModal,
}: OverviewTabProps) {
  const [timeframe, setTimeframe] = useState<"7D" | "30D" | "90D" | "12M">("30D");
  const [emirateChartMode, setEmirateChartMode] = useState<"bar" | "donut">("bar");

  // Compute dynamic KPI totals combining historical Maison archive + live orders
  const liveOrdersRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalRevenue = 499920 + liveOrdersRevenue;
  const totalOrdersCount = 330 + orders.length;
  const avgOrderValue = Math.round(totalRevenue / Math.max(1, totalOrdersCount));
  const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;

  const latestFiveOrders = orders.slice(0, 5);
  const currentChartData = revenueChartData[timeframe] || revenueChartData["30D"];

  const kpiCards = [
    {
      id: "revenue",
      label: "Total Revenue",
      value: `AED ${totalRevenue.toLocaleString()}`,
      trend: "+18.4% this week",
      subtitle: "Nocturne d'Or AW26 & Privé Trunk",
      sparkline: [42, 48, 45, 59, 64, 78, 92],
    },
    {
      id: "orders",
      label: "Total Orders",
      value: totalOrdersCount.toLocaleString(),
      trend: "+12.6% this week",
      subtitle: "Across all 7 UAE Emirates",
      sparkline: [18, 22, 20, 26, 29, 33, 38],
    },
    {
      id: "aov",
      label: "Avg Order Value (AOV)",
      value: `AED ${avgOrderValue.toLocaleString()}`,
      trend: "+6.2% this week",
      subtitle: "Driven by Bespoke Velvet & Pearls",
      sparkline: [4900, 5050, 5120, 5280, 5240, 5410, avgOrderValue],
    },
    {
      id: "pending",
      label: "Pending Orders",
      value: String(pendingOrdersCount).padStart(2, "0"),
      trend: "+2 VIP dispatches today",
      subtitle: "Awaiting White-Glove Chauffeur",
      sparkline: [9, 7, 8, 6, 5, 4, pendingOrdersCount],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-8"
    >
      {/* Editorial Masthead Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-[#FAF5EF]/10">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#E87272] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Maison Executive Intelligence</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#FAF5EF] tracking-[-0.02em] leading-[1.12]">
            Atelier Overview
          </h2>
          <p className="text-sm text-[#C4B5A6]/75 mt-1.5 max-w-xl">
            Live commercial telemetry, Emirate dispatch performance, and haute couture
            client acquisitions for{" "}
            <span className="text-[#FAF5EF] font-medium">Sabr By Simran</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab("orders")}
            className="px-4 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[#FAF5EF]/10 text-xs font-medium text-[#FAF5EF] tracking-wide transition-all flex items-center gap-2"
          >
            <span>Manage Dispatch</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
          </button>

          <button
            onClick={onOpenNewProductModal}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A0E17] to-[#2B070D] hover:from-[#5e121e] hover:to-[#3d0a12] text-xs font-medium text-[#FAF5EF] tracking-wide border border-[#E87272]/60 shadow-[0_0_22px_rgba(232,114,114,0.28)] hover:shadow-[0_0_30px_rgba(232,114,114,0.45)] transition-all flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.75} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* BENTO GRID LAYOUT */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        {/* ROW 1: 4 LUXURY KPI STATS CARDS */}
        {kpiCards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.4 }}
            onClick={() => {
              if (card.id === "pending" || card.id === "orders") {
                onNavigateTab("orders");
              }
            }}
            className={`lg:col-span-3 group relative rounded-2xl p-6 luxury-glass hover:border-[#E87272]/35 transition-all duration-500 overflow-hidden ${
              card.id === "pending" || card.id === "orders" ? "cursor-pointer" : ""
            }`}
          >
            {/* Subtle radial burgundy/coral glow on hover */}
            <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-[#E87272]/8 group-hover:bg-[#E87272]/15 blur-2xl transition-all duration-500 pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[#C4B5A6]/75 font-semibold">
                {card.label}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E87272]/12 text-[#E87272] border border-[#E87272]/25 tabular-nums">
                <TrendingUp className="w-3 h-3" strokeWidth={1.5} />
                {card.trend}
              </span>
            </div>

            <div className="flex items-end justify-between gap-3 mt-2">
              <div>
                <div className="font-serif text-3xl xl:text-[34px] text-[#FAF5EF] tracking-[-0.02em] leading-none tabular-nums">
                  {card.value}
                </div>
                <p className="text-xs text-[#C4B5A6]/60 mt-2.5">{card.subtitle}</p>
              </div>
              <div className="shrink-0">
                <MiniSparkline points={card.sparkline} id={card.id} color="#E87272" />
              </div>
            </div>
          </motion.div>
        ))}

        {/* ROW 2 LEFT: REVENUE OVERVIEW AREA CHART (8 COLUMNS) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="md:col-span-2 lg:col-span-8 rounded-2xl p-6 sm:p-8 luxury-glass flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#E87272] font-semibold mb-1">
                <span>Financial Trajectory</span>
              </div>
              <h3 className="font-serif text-2xl text-[#FAF5EF] tracking-[-0.01em]">
                Revenue Overview
              </h3>
              <p className="text-xs text-[#C4B5A6]/65 mt-0.5">
                Haute couture &amp; ready-to-wear gross merchandise value (AED)
              </p>
            </div>

            {/* Timeframe Selector */}
            <div className="inline-flex items-center p-1 rounded-xl bg-black/35 border border-[#FAF5EF]/10 self-start sm:self-auto">
              {(["7D", "30D", "90D", "12M"] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium tabular-nums transition-all ${
                    timeframe === tf
                      ? "bg-[#4A0E17] text-[#FAF5EF] border border-[#E87272]/40 shadow-[0_0_12px_rgba(232,114,114,0.2)]"
                      : "text-[#C4B5A6]/65 hover:text-[#FAF5EF]"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Recharts Smooth Area Chart */}
          <div className="h-[310px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={currentChartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="sabrBurgundyGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E87272" stopOpacity={0.45} />
                    <stop offset="45%" stopColor="#4A0E17" stopOpacity={0.65} />
                    <stop offset="100%" stopColor="#1A0A0C" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="rgba(250, 245, 239, 0.08)"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(196, 181, 166, 0.65)", fontSize: 11 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "rgba(196, 181, 166, 0.65)", fontSize: 11 }}
                  tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                  width={44}
                />
                <Tooltip
                  content={<RevenueTooltip />}
                  cursor={{
                    stroke: "rgba(232, 114, 114, 0.35)",
                    strokeWidth: 1,
                    strokeDasharray: "4 4",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#E87272"
                  strokeWidth={2.4}
                  fillOpacity={1}
                  fill="url(#sabrBurgundyGradient)"
                  activeDot={{
                    r: 5,
                    fill: "#E87272",
                    stroke: "#FAF5EF",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Bottom Summary Strip */}
          <div className="mt-5 pt-4 border-t border-[#FAF5EF]/10 grid grid-cols-3 gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#C4B5A6]/55 block">
                Peak Atelier Day
              </span>
              <span className="font-serif text-base text-[#FAF5EF] tabular-nums">
                AED 114,200
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#C4B5A6]/55 block">
                Bespoke Ratio
              </span>
              <span className="font-serif text-base text-[#E87272] tabular-nums">
                64.8% Couture
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.18em] text-[#C4B5A6]/55 block">
                Return Rate
              </span>
              <span className="font-serif text-base text-[#6EE7B7] tabular-nums">
                0.8% Ultra-Low
              </span>
            </div>
          </div>
        </motion.div>

        {/* ROW 2 RIGHT: ORDERS BY EMIRATE (4 COLUMNS) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32, duration: 0.45 }}
          className="md:col-span-2 lg:col-span-4 rounded-2xl p-6 sm:p-7 luxury-glass flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#E87272] font-semibold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" strokeWidth={1.5} />
                Regional Demand
              </span>

              {/* Toggle Bar vs Donut */}
              <div className="inline-flex items-center p-0.5 rounded-lg bg-black/35 border border-[#FAF5EF]/10">
                <button
                  onClick={() => setEmirateChartMode("bar")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    emirateChartMode === "bar"
                      ? "bg-[#4A0E17] text-[#FAF5EF] border border-[#E87272]/35"
                      : "text-[#C4B5A6]/60 hover:text-[#FAF5EF]"
                  }`}
                >
                  Bars
                </button>
                <button
                  onClick={() => setEmirateChartMode("donut")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    emirateChartMode === "donut"
                      ? "bg-[#4A0E17] text-[#FAF5EF] border border-[#E87272]/35"
                      : "text-[#C4B5A6]/60 hover:text-[#FAF5EF]"
                  }`}
                >
                  Donut
                </button>
              </div>
            </div>

            <h3 className="font-serif text-2xl text-[#FAF5EF] tracking-[-0.01em]">
              Orders by Emirate
            </h3>
            <p className="text-xs text-[#C4B5A6]/65 mt-0.5">
              Distribution across United Arab Emirates
            </p>
          </div>

          {/* Chart Container */}
          <div className="h-[220px] w-full my-3">
            {emirateChartMode === "bar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={emirateBase}
                  layout="vertical"
                  margin={{ top: 4, right: 14, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="rgba(250, 245, 239, 0.08)"
                  />
                  <XAxis
                    type="number"
                    hide
                  />
                  <YAxis
                    type="category"
                    dataKey="emirate"
                    axisLine={false}
                    tickLine={false}
                    width={96}
                    tick={{ fill: "#FAF5EF", fontSize: 11 }}
                  />
                  <Tooltip
                    content={<EmirateTooltip />}
                    cursor={{ fill: "rgba(250, 245, 239, 0.04)" }}
                  />
                  <Bar dataKey="orders" radius={[0, 6, 6, 0]} barSize={16}>
                    {emirateBase.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emirateBase}
                    dataKey="orders"
                    nameKey="emirate"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={84}
                    paddingAngle={3}
                    stroke="rgba(26,10,12,0.9)"
                    strokeWidth={2}
                  >
                    {emirateBase.map((entry, idx) => (
                      <Cell key={`donut-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<EmirateTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Custom Legend List */}
          <div className="space-y-2 pt-3 border-t border-[#FAF5EF]/10">
            {emirateBase.slice(0, 4).map((item) => (
              <div
                key={item.emirate}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[#FAF5EF]/90 font-medium">{item.emirate}</span>
                </div>
                <div className="flex items-center gap-3 tabular-nums">
                  <span className="text-[#C4B5A6]/70">{item.orders} orders</span>
                  <span className="text-[#FAF5EF] font-semibold w-11 text-right">
                    {item.share}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ROW 3: RECENT ORDERS TABLE (FULL 12 COLUMNS BENTO CARD) */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.45 }}
          className="md:col-span-2 lg:col-span-12 rounded-2xl p-6 sm:p-8 luxury-glass"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#E87272] font-semibold mb-1">
                <Clock className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>Live Atelier Acquisitions</span>
              </div>
              <h3 className="font-serif text-2xl text-[#FAF5EF] tracking-[-0.01em]">
                Recent Orders
              </h3>
              <p className="text-xs text-[#C4B5A6]/65 mt-0.5">
                Latest 5 bespoke &amp; ready-to-wear client orders — select any row to open
                the concierge dossier
              </p>
            </div>

            <button
              onClick={() => onNavigateTab("orders")}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-[#FAF5EF]/10 text-xs font-medium text-[#FAF5EF] flex items-center gap-2 transition-all"
            >
              <span>View Full Order Registry</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
            </button>
          </div>

          {/* Borderless Custom Grid/Flex Layout (No standard HTML table) */}
          <div className="space-y-2.5">
            {/* Desktop Column Header Row */}
            <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-5 py-2.5 text-[11px] uppercase tracking-[0.18em] text-[#C4B5A6]/55 font-semibold">
              <div className="col-span-2">Order ID</div>
              <div className="col-span-3">Client &amp; Piece</div>
              <div className="col-span-2">Emirate</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-1">Total</div>
              <div className="col-span-1">Status</div>
              <div className="col-span-1 text-right">Dossier</div>
            </div>

            {latestFiveOrders.map((order, idx) => {
              const firstItem = order.items?.[0];
              const extraCount = (order.items?.length || 1) - 1;
              const formattedDate = new Date(order.orderDate).toLocaleDateString(
                "en-AE",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              );

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.06 }}
                  onClick={() => onSelectOrder(order)}
                  className="group grid grid-cols-1 lg:grid-cols-12 items-center gap-4 px-5 py-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.06] border border-[#FAF5EF]/[0.06] hover:border-[#E87272]/30 transition-all duration-300 cursor-pointer"
                >
                  {/* Order ID */}
                  <div className="lg:col-span-2 flex items-center justify-between lg:justify-start gap-2">
                    <span className="font-mono text-xs font-semibold text-[#FAF5EF] tracking-wider px-2.5 py-1 rounded-lg bg-white/[0.04] border border-[#FAF5EF]/10 group-hover:border-[#E87272]/40 transition-colors tabular-nums">
                      #{order.orderNumber}
                    </span>
                    <span className="lg:hidden">
                      <OrderStatusBadge status={order.status} />
                    </span>
                  </div>

                  {/* Customer & Garment Thumbnail */}
                  <div className="lg:col-span-3 flex items-center gap-3.5">
                    {firstItem?.image ? (
                      <img
                        src={firstItem.image}
                        alt={firstItem.name}
                        className="w-10 h-12 rounded-lg object-cover border border-[#FAF5EF]/15 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-12 rounded-lg bg-[#4A0E17]/50 border border-[#FAF5EF]/10 flex items-center justify-center shrink-0">
                        <Layers className="w-4 h-4 text-[#E87272]" strokeWidth={1.5} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-[#FAF5EF] truncate group-hover:text-white">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-[#C4B5A6]/65 truncate">
                        {firstItem ? firstItem.name : "Bespoke Couture Piece"}
                        {extraCount > 0 ? ` +${extraCount} more` : ""}
                      </div>
                    </div>
                  </div>

                  {/* Emirate */}
                  <div className="lg:col-span-2 flex items-center gap-2 text-xs text-[#FAF5EF]/85">
                    <MapPin className="w-3.5 h-3.5 text-[#E87272] shrink-0" strokeWidth={1.5} />
                    <span>{order.emirate}</span>
                  </div>

                  {/* Date */}
                  <div className="lg:col-span-2 text-xs text-[#C4B5A6]/70 tabular-nums">
                    {formattedDate}
                  </div>

                  {/* Total Amount */}
                  <div className="lg:col-span-1 font-serif text-base text-[#FAF5EF] tabular-nums">
                    AED {order.totalAmount.toLocaleString()}
                  </div>

                  {/* Status Badge */}
                  <div className="hidden lg:flex lg:col-span-1">
                    <OrderStatusBadge status={order.status} />
                  </div>

                  {/* Action */}
                  <div className="lg:col-span-1 flex justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOrder(order);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] group-hover:bg-[#E87272]/20 border border-[#FAF5EF]/10 group-hover:border-[#E87272]/40 text-xs font-medium text-[#FAF5EF] transition-all"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
                      <span className=" lg:sr-only xl:not-sr-only">Details</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
