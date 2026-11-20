"use client";

import React from "react";
import type { OrderStatus, StockStatus } from "./types";

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  if (status === "Pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-[#E87272]/15 text-[#E87272] border border-[#E87272]/35 shadow-[0_0_15px_rgba(232,114,114,0.12)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E87272] animate-pulse" />
        Pending
      </span>
    );
  }

  if (status === "Shipped") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-[#D4AF37]/15 text-[#FAF5EF] border border-[#D4AF37]/45 shadow-[0_0_15px_rgba(212,175,55,0.12)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
        Shipped
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide bg-[#6EE7B7]/15 text-[#6EE7B7] border border-[#6EE7B7]/35 shadow-[0_0_15px_rgba(110,231,183,0.12)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]" />
      Delivered
    </span>
  );
}

export function StockStatusBadge({ status }: { status: StockStatus }) {
  if (status === "In Stock") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase bg-[#1A0A0C]/80 backdrop-blur-md text-[#6EE7B7] border border-[#6EE7B7]/35">
        <span className="w-1.5 h-1.5 rounded-full bg-[#6EE7B7]" />
        In Stock
      </span>
    );
  }

  if (status === "Low Stock") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase bg-[#1A0A0C]/85 backdrop-blur-md text-[#E87272] border border-[#E87272]/45 shadow-[0_0_14px_rgba(232,114,114,0.25)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[#E87272] animate-pulse" />
        Low Stock
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase bg-[#1A0A0C]/90 backdrop-blur-md text-[#C4B5A6]/75 border border-[#FAF5EF]/15">
      <span className="w-1.5 h-1.5 rounded-full bg-[#C4B5A6]/60" />
      Sold Out
    </span>
  );
}

export function MiniSparkline({
  points,
  color = "#E87272",
  id,
}: {
  points: number[];
  color?: string;
  id: string;
}) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 96;
  const height = 34;

  const coords = points.map((val, idx) => {
    const x = (idx / (points.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 8) - 4;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  const linePath = `M ${coords.join(" L ")}`;
  const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${id})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
