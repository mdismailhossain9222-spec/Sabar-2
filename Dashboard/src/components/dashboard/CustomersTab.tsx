"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  MapPin,
  Phone,
  Mail,
  Plus,
  Search,
  Sparkles,
  X,
  Ruler,
  ShoppingBag,
} from "lucide-react";
import type { DashboardCustomer, EmirateName } from "./types";

interface CustomersTabProps {
  customers: DashboardCustomer[];
  onCreateCustomer: (payload: {
    name: string;
    email: string;
    phone: string;
    emirate: string;
    address: string;
    vipTier: "Couture Privé" | "Gold Circle" | "Atelier Member";
    preferredSize: string;
    notes: string;
  }) => Promise<void>;
}

export function CustomersTab({
  customers,
  onCreateCustomer,
}: CustomersTabProps) {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+971 50 ");
  const [emirate, setEmirate] = useState<EmirateName>("Dubai");
  const [address, setAddress] = useState("");
  const [vipTier, setVipTier] = useState<
    "Couture Privé" | "Gold Circle" | "Atelier Member"
  >("Couture Privé");
  const [preferredSize, setPreferredSize] = useState("S (56\")");
  const [notes, setNotes] = useState("");

  const filtered = customers.filter((c) => {
    if (tierFilter !== "All" && c.vipTier !== tierFilter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.emirate.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    try {
      await onCreateCustomer({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        emirate,
        address: address.trim() || "Jumeirah 1, Dubai",
        vipTier,
        preferredSize,
        notes: notes.trim(),
      });
      setShowModal(false);
      setName("");
      setEmail("");
      setAddress("");
      setNotes("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-4 border-b border-[#FAF5EF]/10">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#E87272] font-semibold mb-2">
            <Crown className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Private Client Relations &amp; Bespoke Measurements</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#FAF5EF] tracking-[-0.02em] leading-[1.12]">
            Privé Clientèle Book
          </h2>
          <p className="text-sm text-[#C4B5A6]/75 mt-1.5 max-w-xl">
            Manage royal household accounts, trunk show invitees, and personal couture
            fitting profiles across the Emirates.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="self-start lg:self-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-[#4A0E17] to-[#2B070D] border border-[#E87272]/60 text-xs font-medium text-[#FAF5EF] shadow-[0_0_22px_rgba(232,114,114,0.3)] hover:shadow-[0_0_32px_rgba(232,114,114,0.5)] transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4 text-[#E87272]" strokeWidth={1.75} />
          <span>Register Private Client</span>
        </button>
      </div>

      {/* Filters */}
      <div className="p-5 rounded-2xl luxury-glass flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {["All", "Couture Privé", "Gold Circle", "Atelier Member"].map((t) => (
            <button
              key={t}
              onClick={() => setTierFilter(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                tierFilter === t
                  ? "bg-gradient-to-r from-[#E87272]/25 to-[#4A0E17] text-[#FAF5EF] border border-[#E87272]/45"
                  : "bg-white/[0.03] text-[#C4B5A6]/70 hover:text-[#FAF5EF] border border-[#FAF5EF]/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search
            className="w-3.5 h-3.5 text-[#C4B5A6]/60 absolute left-3.5 top-1/2 -translate-y-1/2"
            strokeWidth={1.5}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clientele by name or Emirate..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/35 border border-[#FAF5EF]/10 focus:border-[#E87272]/50 text-xs text-[#FAF5EF] placeholder-[#C4B5A6]/45 focus:outline-none"
          />
        </div>
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((client, idx) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            className="rounded-2xl p-6 luxury-glass hover:border-[#E87272]/35 transition-all flex flex-col justify-between space-y-5"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-[0.16em] font-semibold border ${
                      client.vipTier === "Couture Privé"
                        ? "bg-[#E87272]/15 text-[#E87272] border-[#E87272]/40"
                        : client.vipTier === "Gold Circle"
                        ? "bg-[#D4AF37]/15 text-[#FAF5EF] border-[#D4AF37]/40"
                        : "bg-white/[0.06] text-[#C4B5A6] border-[#FAF5EF]/15"
                    }`}
                  >
                    <Sparkles className="w-2.5 h-2.5" strokeWidth={1.5} />
                    {client.vipTier}
                  </span>
                  <h3 className="font-serif text-2xl text-[#FAF5EF] mt-2">
                    {client.name}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-widest text-[#C4B5A6]/55 block">
                    Lifetime Value
                  </span>
                  <span className="font-serif text-xl text-[#E87272] tabular-nums">
                    AED {client.totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#C4B5A6]/75 leading-relaxed bg-black/25 p-3 rounded-xl border border-[#FAF5EF]/5">
                {client.notes || "Private atelier fitting notes on file."}
              </p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-[#FAF5EF]/10 text-xs">
              <div className="flex items-center justify-between text-[#C4B5A6]/80">
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
                  {client.emirate}
                </span>
                <span className="flex items-center gap-1.5 tabular-nums">
                  <ShoppingBag className="w-3.5 h-3.5 text-[#D4AF37]" strokeWidth={1.5} />
                  {client.ordersCount} acquisitions
                </span>
              </div>

              <div className="flex items-center justify-between text-[#C4B5A6]/80">
                <span className="flex items-center gap-2 tabular-nums">
                  <Phone className="w-3.5 h-3.5 text-[#E87272]" strokeWidth={1.5} />
                  {client.phone}
                </span>
                <span className="flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#6EE7B7]" strokeWidth={1.5} />
                  Size: <strong className="text-[#FAF5EF]">{client.preferredSize}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 text-[#C4B5A6]/65 truncate pt-1">
                <Mail className="w-3.5 h-3.5 text-[#E87272] shrink-0" strokeWidth={1.5} />
                <span className="truncate">{client.email}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Register Private Client Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="w-full max-w-lg rounded-3xl bg-[#1A0A0C]/95 backdrop-blur-2xl border border-[#FAF5EF]/15 shadow-[0_30px_90px_rgba(0,0,0,0.9)] p-6 sm:p-8 pointer-events-auto">
                <div className="flex items-start justify-between pb-4 border-b border-[#FAF5EF]/10">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-[#E87272] font-semibold">
                      Sabr By Simran • VIP Registry
                    </span>
                    <h3 className="font-serif text-2xl text-[#FAF5EF] mt-1">
                      Register Private Client
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-full bg-white/[0.05] text-[#C4B5A6]"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 mt-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                        Client Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alia Al-Rostamani"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                        VIP Tier
                      </label>
                      <select
                        value={vipTier}
                        onChange={(e) =>
                          setVipTier(
                            e.target.value as
                              | "Couture Privé"
                              | "Gold Circle"
                              | "Atelier Member"
                          )
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      >
                        <option value="Couture Privé" className="bg-[#1A0A0C]">
                          Couture Privé
                        </option>
                        <option value="Gold Circle" className="bg-[#1A0A0C]">
                          Gold Circle
                        </option>
                        <option value="Atelier Member" className="bg-[#1A0A0C]">
                          Atelier Member
                        </option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="alia@rostamani-group.ae"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                        Phone
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none tabular-nums"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                        Emirate
                      </label>
                      <select
                        value={emirate}
                        onChange={(e) => setEmirate(e.target.value as EmirateName)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      >
                        {[
                          "Dubai",
                          "Abu Dhabi",
                          "Sharjah",
                          "Ras Al Khaimah",
                          "Ajman",
                          "Fujairah",
                        ].map((em) => (
                          <option key={em} value={em} className="bg-[#1A0A0C]">
                            {em}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                        Bespoke Measurement Profile
                      </label>
                      <input
                        type="text"
                        value={preferredSize}
                        onChange={(e) => setPreferredSize(e.target.value)}
                        placeholder='S (56" length)'
                        className="w-full px-3.5 py-2.5 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/80 mb-1.5">
                      Stylist &amp; Fitting Preferences
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Preferred fabrics, sleeve cut, or private trunk show requests..."
                      className="w-full px-3.5 py-2 rounded-xl bg-black/45 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                    />
                  </div>

                  <div className="pt-3 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-xl bg-white/[0.05] text-xs text-[#C4B5A6]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4A0E17] to-[#2B070D] border border-[#E87272]/60 text-xs font-medium text-[#FAF5EF] shadow-[0_0_20px_rgba(232,114,114,0.3)]"
                    >
                      {submitting ? "Saving..." : "Enroll in Privé Book"}
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
