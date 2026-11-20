"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sliders, Check, Shield, Truck, Sparkles } from "lucide-react";
import type { AtelierSettingsData } from "./types";

interface SettingsTabProps {
  settings: AtelierSettingsData;
  onSaveSettings: (updated: AtelierSettingsData) => Promise<void>;
}

export function SettingsTab({ settings, onSaveSettings }: SettingsTabProps) {
  const [formState, setFormState] = useState<AtelierSettingsData>(settings);
  const [saving, setSaving] = useState(false);
  const [savedToast, setSavedToast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveSettings(formState);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.45 }}
      className="space-y-8 max-w-5xl"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-[#FAF5EF]/10">
        <div>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-[#E87272] font-semibold mb-2">
            <Sliders className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>Maison Governance &amp; Logistics</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] text-[#FAF5EF] tracking-[-0.02em] leading-[1.12]">
            Atelier Settings
          </h2>
          <p className="text-sm text-[#C4B5A6]/75 mt-1.5">
            Configure Jumeirah flagship parameters, UAE white-glove chauffeur
            thresholds, and concierge automation.
          </p>
        </div>

        {savedToast && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6EE7B7]/15 border border-[#6EE7B7]/40 text-xs text-[#6EE7B7]">
            <Check className="w-4 h-4" strokeWidth={2} />
            <span>Maison Settings Synced to Database</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Maison Identity */}
          <div className="rounded-2xl p-6 sm:p-7 luxury-glass space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#E87272] font-semibold">
              <Sparkles className="w-4 h-4" strokeWidth={1.5} />
              <span>Maison Identity</span>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                Maison Name
              </label>
              <input
                type="text"
                value={formState.maisonName}
                onChange={(e) =>
                  setFormState({ ...formState, maisonName: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-sm text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                Creative Director
              </label>
              <input
                type="text"
                value={formState.creativeDirector}
                onChange={(e) =>
                  setFormState({ ...formState, creativeDirector: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-sm text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                Flagship Atelier Address
              </label>
              <input
                type="text"
                value={formState.atelierLocation}
                onChange={(e) =>
                  setFormState({ ...formState, atelierLocation: e.target.value })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-sm text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                  Privé Concierge Email
                </label>
                <input
                  type="email"
                  value={formState.conciergeEmail}
                  onChange={(e) =>
                    setFormState({ ...formState, conciergeEmail: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] focus:border-[#E87272] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                  Direct Atelier Line
                </label>
                <input
                  type="text"
                  value={formState.conciergePhone}
                  onChange={(e) =>
                    setFormState({ ...formState, conciergePhone: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-xs text-[#FAF5EF] tabular-nums focus:border-[#E87272] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* UAE White-Glove Logistics & Vault Thresholds */}
          <div className="rounded-2xl p-6 sm:p-7 luxury-glass space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#E87272] font-semibold">
              <Truck className="w-4 h-4" strokeWidth={1.5} />
              <span>Emirate Dispatch &amp; Vault Thresholds</span>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                Complimentary Chauffeur Threshold (AED)
              </label>
              <input
                type="number"
                value={formState.complimentaryChauffeurThreshold}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    complimentaryChauffeurThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-sm text-[#FAF5EF] tabular-nums focus:border-[#E87272] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                Couture Privé Auto-Enrollment Spend (AED)
              </label>
              <input
                type="number"
                value={formState.vipAutoUpgradeThreshold}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    vipAutoUpgradeThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-sm text-[#FAF5EF] tabular-nums focus:border-[#E87272] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-[#C4B5A6]/75 mb-1.5">
                Low Stock Alert Threshold (Units)
              </label>
              <input
                type="number"
                value={formState.lowStockThreshold}
                onChange={(e) =>
                  setFormState({
                    ...formState,
                    lowStockThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-[#FAF5EF]/15 text-sm text-[#FAF5EF] tabular-nums focus:border-[#E87272] focus:outline-none"
              />
            </div>

            <div className="pt-2 space-y-3">
              <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-[#FAF5EF]/10 cursor-pointer">
                <span className="text-xs text-[#FAF5EF]">
                  Enable WhatsApp Privé Stylist Concierge
                </span>
                <input
                  type="checkbox"
                  checked={formState.enableWhatsAppConcierge}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      enableWhatsAppConcierge: e.target.checked,
                    })
                  }
                  className="accent-[#E87272] w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-[#FAF5EF]/10 cursor-pointer">
                <span className="text-xs text-[#FAF5EF]">
                  Accept Bespoke Abaya &amp; Gown Length Tailoring
                </span>
                <input
                  type="checkbox"
                  checked={formState.enableBespokeMeasurements}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      enableBespokeMeasurements: e.target.checked,
                    })
                  }
                  className="accent-[#E87272] w-4 h-4"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-5 rounded-2xl luxury-glass">
          <div className="flex items-center gap-3 text-xs text-[#C4B5A6]/80">
            <Shield className="w-4 h-4 text-[#E87272]" strokeWidth={1.5} />
            <span>
              All changes are encrypted and persisted to the Sabr By Simran PostgreSQL
              vault.
            </span>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#4A0E17] to-[#2B070D] border border-[#E87272]/60 text-xs font-medium text-[#FAF5EF] shadow-[0_0_22px_rgba(232,114,114,0.3)] hover:shadow-[0_0_32px_rgba(232,114,114,0.5)] transition-all"
          >
            {saving ? "Synchronizing..." : "Save Maison Configuration"}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
