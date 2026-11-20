"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Sparkles,
  Minus,
  Trash2,
  X,
  Check,
  Layers,
  Tag,
} from "lucide-react";
import type { DashboardProduct, StockStatus } from "./types";
import { StockStatusBadge } from "./StatusBadge";

interface ProductsTabProps {
  products: DashboardProduct[];
  showAddModal: boolean;
  onOpenAddModal: () => void;
  onCloseAddModal: () => void;
  onCreateProduct: (payload: {
    name: string;
    collection: string;
    category: string;
    price: number;
    stock: number;
    image: string;
    fabric: string;
    sizes: string[];
    description: string;
  }) => Promise<void>;
  onUpdateStock: (productId: number, newStock: number) => Promise<void>;
  onDeleteProduct: (productId: number) => Promise<void>;
}

const LOOKBOOK_GALLERY = [
  { label: "Velvet Abaya", url: "/images/garment-1.jpg" },
  { label: "Silk Organza Kaftan", url: "/images/garment-2.jpg" },
  { label: "Obsidian Draped Gown", url: "/images/garment-3.jpg" },
  { label: "Bronze Bisht Set", url: "/images/garment-4.jpg" },
  { label: "Crimson Jacquard Trench", url: "/images/garment-5.jpg" },
  { label: "Pearl Evening Cape", url: "/images/garment-6.jpg" },
  { label: "Dune Cashmere Coat", url: "/images/garment-7.jpg" },
  { label: "Rose-Gold Pleated Gown", url: "/images/garment-8.jpg" },
];

export function ProductsTab({
  products,
  showAddModal,
  onOpenAddModal,
  onCloseAddModal,
  onCreateProduct,
  onUpdateStock,
  onDeleteProduct,
}: ProductsTabProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState<"All" | StockStatus>("All");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Add New Product Form State
  const [name, setName] = useState("");
  const [collection, setCollection] = useState("Nocturne d'Or AW26");
  const [category, setCategory] = useState("Couture Abayas");
  const [price, setPrice] = useState("5200");
  const [stock, setStock] = useState("10");
  const [image, setImage] = useState("/images/garment-1.jpg");
  const [fabric, setFabric] = useState(
    "100% Mulberry Silk Velvet & Rose-Gold Zardozi"
  );
  const [description, setDescription] = useState("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([
    "S",
    "M",
    "L",
    "Custom",
  ]);
  const [submitting, setSubmitting] = useState(false);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category)));
    return ["All", ...unique];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== "All" && p.category !== categoryFilter) return false;
      if (stockFilter !== "All" && p.stockStatus !== stockFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSku = p.sku.toLowerCase().includes(q);
        const matchCollection = p.collection.toLowerCase().includes(q);
        const matchFabric = p.fabric.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCollection && !matchFabric) {
          return false;
        }
      }
      return true;
    });
  }, [products, categoryFilter, stockFilter, search]);

  const toggleSize = (sz: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sz) ? prev.filter((s) => s !== sz) : [...prev, sz]
    );
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onCreateProduct({
        name: name.trim(),
        collection: collection.trim() || "Nocturne d'Or AW26",
        category: category.trim() || "Couture Abayas",
        price: Number(price) || 4950,
        stock: Number(stock) || 0,
        image,
        fabric: fabric.trim() || "100% Pure Mulberry Silk",
        sizes: selectedSizes.length ? selectedSizes : ["S", "M", "L"],
        description:
          description.trim() ||
          "Hand-crafted in our Dubai Jumeirah 1 atelier from archival silk textiles.",
      });
      onCloseAddModal();
      setName("");
      setDescription("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjustStock = async (product: DashboardProduct, delta: number) => {
    const nextStock = Math.max(0, product.stock + delta);
    if (nextStock === product.stock) return;
    setUpdatingId(product.id);
    try {
      await onUpdateStock(product.id, nextStock);
    } finally {
      setUpdatingId(null);
    }
  };

  const totalVaultUnits = products.reduce((acc, p) => acc + p.stock, 0);
  const totalVaultValuation = products.reduce(
    (acc, p) => acc + p.price * p.stock,
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45 }}
      className="space-y-8"
    >
      {/* Editorial Header + Glowing Coral "Add New Product" CTA */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-4 border-b border-[#FAF5EF]/10">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#E87272] font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Haute Couture &amp; Ready-To-Wear Archive</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#FAF5EF] tracking-[-0.02em] leading-[1.12]">
            Product Management
          </h2>
          <p className="text-sm text-[#C4B5A6]/75 mt-1.5 max-w-xl">
            Curate the <span className="text-[#FAF5EF]">Sabr By Simran</span>{" "}
            editorial lookbook, monitor Jumeirah vault piece availability, and
            introduce seasonal creations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Vault Telemetry Summary */}
          <div className="hidden sm:flex items-center gap-5 px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-[#FAF5EF]/10 text-xs">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C4B5A6]/55 block">
                Vault Pieces
              </span>
              <strong className="font-serif text-base text-[#FAF5EF] tabular-nums">
                {totalVaultUnits} units
              </strong>
            </div>
            <div className="h-6 w-[1px] bg-[#FAF5EF]/10" />
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C4B5A6]/55 block">
                Archive Value
              </span>
              <strong className="font-serif text-base text-[#E87272] tabular-nums">
                AED {totalVaultValuation.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* PROMINENT "ADD NEW PRODUCT" BUTTON WITH GLOWING CORAL BORDER */}
          <button
            onClick={onOpenAddModal}
            className="group relative px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#4A0E17] via-[#340910] to-[#1A0A0C] text-sm font-medium text-[#FAF5EF] tracking-wide border border-[#E87272]/75 shadow-[0_0_25px_rgba(232,114,114,0.38)] hover:shadow-[0_0_38px_rgba(232,114,114,0.65)] hover:border-[#E87272] transition-all duration-300 flex items-center gap-2.5 cursor-pointer"
          >
            <span className="p-1 rounded-lg bg-[#E87272]/20 text-[#E87272] group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4" strokeWidth={2} />
            </span>
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* Lookbook Filter & Search Strip */}
      <div className="p-5 rounded-2xl luxury-glass flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? "bg-gradient-to-r from-[#E87272]/25 to-[#4A0E17]/70 text-[#FAF5EF] border border-[#E87272]/45 shadow-[0_0_15px_rgba(232,114,114,0.2)]"
                  : "bg-white/[0.03] text-[#C4B5A6]/70 hover:text-[#FAF5EF] border border-[#FAF5EF]/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right: Stock Filter + Search Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="inline-flex items-center p-1 rounded-xl bg-black/35 border border-[#FAF5EF]/10">
            {(["All", "In Stock", "Low Stock", "Sold Out"] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStockFilter(st)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                  stockFilter === st
                    ? "bg-[#4A0E17] text-[#FAF5EF] border border-[#E87272]/40"
                    : "text-[#C4B5A6]/65 hover:text-[#FAF5EF]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative min-w-[230px]">
            <Search
              className="w-3.5 h-3.5 text-[#C4B5A6]/60 absolute left-3.5 top-1/2 -translate-y-1/2"
              strokeWidth={1.5}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter lookbook by name or SKU..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/35 border border-[#FAF5EF]/10 focus:border-[#E87272]/50 text-xs text-[#FAF5EF] placeholder-[#C4B5A6]/45 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* PREMIUM EDITORIAL PRODUCT GRID */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-2xl p-16 luxury-glass text-center space-y-3">
          <p className="font-serif text-2xl text-[#FAF5EF]">
            No Couture Pieces Found
          </p>
          <p className="text-xs text-[#C4B5A6]/65">
            Try clearing your category or stock filter, or curate a new garment into
            the archive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-7">
          {filteredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
              className="group rounded-2xl luxury-glass overflow-hidden flex flex-col justify-between hover:border-[#E87272]/40 transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            >
              {/* Top Portrait Image Container with Luxury Hover Zoom */}
              <div>
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#120608]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
                  />

                  {/* Subtle dark editorial vignette overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0C] via-transparent to-black/30 opacity-85 group-hover:opacity-70 transition-opacity duration-500" />

                  {/* Top Left SKU & Collection Tag */}
                  <div className="absolute top-3.5 left-3.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-widest bg-[#1A0A0C]/75 backdrop-blur-md text-[#FAF5EF]/90 border border-[#FAF5EF]/15">
                      {product.sku}
                    </span>
                  </div>

                  {/* Top Right Floating Stock Status Badge */}
                  <div className="absolute top-3.5 right-3.5">
                    <StockStatusBadge status={product.stockStatus} />
                  </div>

                  {/* Hover Overlay Quick Stock Adjuster & Archive Controls */}
                  <div className="absolute inset-x-3.5 bottom-3.5 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-[#1A0A0C]/90 backdrop-blur-xl border border-[#FAF5EF]/15 opacity-95 sm:opacity-0 sm:translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAdjustStock(product, -1)}
                        disabled={updatingId === product.id || product.stock <= 0}
                        aria-label={`Decrease stock for ${product.name}`}
                        className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-[#E87272]/25 disabled:opacity-30 border border-[#FAF5EF]/10 flex items-center justify-center text-[#FAF5EF] transition-colors"
                      >
                        <Minus className="w-3 h-3" strokeWidth={1.75} />
                      </button>
                      <span className="px-2 text-xs font-medium text-[#FAF5EF] tabular-nums">
                        {product.stock} in vault
                      </span>
                      <button
                        onClick={() => handleAdjustStock(product, 1)}
                        disabled={updatingId === product.id}
                        aria-label={`Increase stock for ${product.name}`}
                        className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-[#6EE7B7]/25 border border-[#FAF5EF]/10 flex items-center justify-center text-[#FAF5EF] transition-colors"
                      >
                        <Plus className="w-3 h-3" strokeWidth={1.75} />
                      </button>
                    </div>

                    <button
                      onClick={() => onDeleteProduct(product.id)}
                      title="Remove from Lookbook"
                      aria-label={`Archive ${product.name}`}
                      className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-[#E87272]/25 text-[#C4B5A6] hover:text-[#E87272] transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>

                {/* Editorial Details Body */}
                <div className="p-5 space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-[#E87272] font-semibold">
                    <span className="truncate">{product.collection}</span>
                    <span className="text-[#C4B5A6]/60">{product.category}</span>
                  </div>

                  <h3 className="font-serif text-xl text-[#FAF5EF] group-hover:text-white tracking-[-0.01em] leading-snug">
                    {product.name}
                  </h3>

                  <p className="text-xs text-[#C4B5A6]/70 line-clamp-2 leading-relaxed">
                    {product.fabric}
                  </p>
                </div>
              </div>

              {/* Card Footer: Price & Available Sizes */}
              <div className="px-5 pb-5 pt-3 border-t border-[#FAF5EF]/10 flex items-end justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#C4B5A6]/55 block">
                    Atelier Price
                  </span>
                  <div className="font-serif text-xl text-[#FAF5EF] tabular-nums">
                    AED {product.price.toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-1">
                  {product.sizes.slice(0, 4).map((sz) => (
                    <span
                      key={sz}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-white/[0.04] text-[#C4B5A6]/85 border border-[#FAF5EF]/10"
                    >
                      {sz}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ADD NEW PRODUCT LUXURY GLASSMORPHIC MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseAddModal}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-2xl rounded-3xl bg-[#1A0A0C]/95 backdrop-blur-2xl border border-[#FAF5EF]/15 shadow-[0_30px_90px_rgba(0,0,0,0.9)] p-6 sm:p-8 pointer-events-auto max-h-[92vh] overflow-y-auto">
                <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#FAF5EF]/10">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.22em] text-[#E87272] font-semibold">
                      <Sparkles className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>Sabr By Simran • Atelier Archive</span>
                    </div>
                    <h3 className="font-serif text-2xl sm:text-3xl text-[#FAF5EF] mt-1">
                      Curate New Couture Piece
                    </h3>
                  </div>

                  <button
                    onClick={onCloseAddModal}
                    aria-label="Close modal"
                    className="p-2 rounded-full bg-white/[0.05] text-[#C4B5A6] hover:text-[#FAF5EF]"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                <form onSubmit={handleAddSubmit} className="space-y-5 mt-6">
                  {/* Garment Name & Collection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                        Garment Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Soraya Velvet & Zardozi Bisht"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                        Capsule Collection
                      </label>
                      <input
                        type="text"
                        value={collection}
                        onChange={(e) => setCollection(e.target.value)}
                        placeholder="Nocturne d'Or AW26"
                        className="w-full px-4 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Category, Price (AED), and Vault Stock */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      >
                        {[
                          "Couture Abayas",
                          "Evening Kaftans",
                          "Evening Gowns",
                          "Couture Outerwear",
                          "Three-Piece Ensembles",
                          "Bridal & Soirée",
                        ].map((c) => (
                          <option
                            key={c}
                            value={c}
                            className="bg-[#1A0A0C] text-[#FAF5EF]"
                          >
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                        Price (AED) *
                      </label>
                      <input
                        type="number"
                        required
                        min={500}
                        step={50}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] tabular-nums focus:border-[#E87272] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                        Initial Vault Stock *
                      </label>
                      <input
                        type="number"
                        required
                        min={0}
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] tabular-nums focus:border-[#E87272] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Fabric & Craftsmanship */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                      Textile &amp; Embroidery Composition
                    </label>
                    <input
                      type="text"
                      value={fabric}
                      onChange={(e) => setFabric(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                    />
                  </div>

                  {/* Curated Lookbook Photography Selector */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-2">
                      Select Editorial Lookbook Photography
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                      {LOOKBOOK_GALLERY.map((item) => {
                        const selected = image === item.url;
                        return (
                          <button
                            key={item.url}
                            type="button"
                            onClick={() => setImage(item.url)}
                            className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                              selected
                                ? "border-[#E87272] shadow-[0_0_15px_rgba(232,114,114,0.45)] scale-105"
                                : "border-transparent opacity-65 hover:opacity-100"
                            }`}
                          >
                            <img
                              src={item.url}
                              alt={item.label}
                              className="w-full h-full object-cover"
                            />
                            {selected && (
                              <span className="absolute inset-0 bg-[#E87272]/20 flex items-center justify-center">
                                <Check
                                  className="w-4 h-4 text-[#FAF5EF] drop-shadow"
                                  strokeWidth={2.5}
                                />
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Available Sizes */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-2">
                      Available Atelier Sizes
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {["XS", "S", "M", "L", "One Size", "Custom"].map((sz) => {
                        const active = selectedSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => toggleSize(sz)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                              active
                                ? "bg-[#E87272]/20 text-[#FAF5EF] border-[#E87272]/60"
                                : "bg-white/[0.03] text-[#C4B5A6]/60 border-[#FAF5EF]/10"
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                      Atelier Notes &amp; Provenance
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe hand-embroidery hours, drape silhouette, and lining details..."
                      className="w-full px-4 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-[#FAF5EF]/10 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onCloseAddModal}
                      className="px-4 py-2.5 rounded-xl bg-white/[0.05] text-xs text-[#C4B5A6] hover:text-[#FAF5EF]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#4A0E17] to-[#2B070D] border border-[#E87272]/70 text-xs font-medium text-[#FAF5EF] shadow-[0_0_24px_rgba(232,114,114,0.35)] hover:shadow-[0_0_32px_rgba(232,114,114,0.55)] transition-all"
                    >
                      {submitting ? "Archiving to Vault..." : "Publish to Lookbook"}
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
