"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { OrdersTab } from "@/components/dashboard/OrdersTab";
import { ProductsTab } from "@/components/dashboard/ProductsTab";
import { CustomersTab } from "@/components/dashboard/CustomersTab";
import { SettingsTab } from "@/components/dashboard/SettingsTab";
import { OrderDrawer } from "@/components/dashboard/OrderDrawer";
import type {
  AtelierSettingsData,
  DashboardCustomer,
  DashboardOrder,
  DashboardProduct,
  EmirateName,
  NavTab,
  OrderStatus,
} from "@/components/dashboard/types";
import {
  INITIAL_PRODUCTS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  REVENUE_CHART_DATA,
  EMIRATE_DISTRIBUTION_BASE,
} from "@/lib/seed-data";

export default function SabrAdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<NavTab>("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Core Data State (pre-hydrated with seed data, then synced with PostgreSQL)
  const [products, setProducts] = useState<DashboardProduct[]>(INITIAL_PRODUCTS);
  const [orders, setOrders] = useState<DashboardOrder[]>(INITIAL_ORDERS);
  const [customers, setCustomers] =
    useState<DashboardCustomer[]>(INITIAL_CUSTOMERS);
  const [settings, setSettings] = useState<AtelierSettingsData>({
    id: 1,
    maisonName: "Sabr By Simran",
    creativeDirector: "Simran Kaur",
    atelierLocation: "Villa 14, Al Wasl Road, Jumeirah 1, Dubai, UAE",
    conciergeEmail: "prive@sabrbysimran.ae",
    conciergePhone: "+971 4 589 2400",
    currency: "AED",
    complimentaryChauffeurThreshold: 3000,
    lowStockThreshold: 5,
    vipAutoUpgradeThreshold: 15000,
    enableWhatsAppConcierge: true,
    enableBespokeMeasurements: true,
  });

  // Slide-over Order Details Drawer State
  const [selectedOrder, setSelectedOrder] = useState<DashboardOrder | null>(null);

  // Add New Product Modal State
  const [showNewProductModal, setShowNewProductModal] = useState(false);

  // Luxury Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  }, []);

  // Fetch live data from PostgreSQL API on mount
  useEffect(() => {
    let active = true;
    async function loadDashboard() {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        if (Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
        if (Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders(data.orders);
        }
        if (Array.isArray(data.customers) && data.customers.length > 0) {
          setCustomers(data.customers);
        }
        if (data.settings) {
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Failed to sync initial dashboard state:", err);
      }
    }
    loadDashboard();
    return () => {
      active = false;
    };
  }, []);

  // Update Order Status / Notes
  const handleUpdateOrder = async (
    orderId: number,
    updates: { status?: OrderStatus; notes?: string; courierService?: string }
  ) => {
    // Optimistic update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o))
    );
    setSelectedOrder((prev) =>
      prev && prev.id === orderId ? { ...prev, ...updates } : prev
    );

    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: orderId, ...updates }),
      });
      if (res.ok) {
        const { order } = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === orderId ? order : o)));
        setSelectedOrder((prev) =>
          prev && prev.id === orderId ? order : prev
        );
        if (updates.status) {
          triggerToast(
            `Order #${order.orderNumber} marked as ${updates.status}`
          );
        } else {
          triggerToast(`Dossier updated for Order #${order.orderNumber}`);
        }
      }
    } catch (err) {
      console.error("Failed to update order:", err);
    }
  };

  // Create New Bespoke Order
  const handleCreateOrder = async (payload: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingAddress: string;
    emirate: EmirateName;
    status: OrderStatus;
    productId: number;
    size: string;
    notes: string;
  }) => {
    const chosenProduct =
      products.find((p) => p.id === payload.productId) || products[0];
    const items = [
      {
        productId: chosenProduct.id,
        name: chosenProduct.name,
        sku: chosenProduct.sku,
        size: payload.size,
        quantity: 1,
        price: chosenProduct.price,
        image: chosenProduct.image,
        fabric: chosenProduct.fabric,
      },
    ];

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: payload.customerName,
          customerEmail: payload.customerEmail,
          customerPhone: payload.customerPhone,
          shippingAddress: payload.shippingAddress,
          emirate: payload.emirate,
          totalAmount: chosenProduct.price,
          status: payload.status,
          notes: payload.notes,
          items,
        }),
      });
      if (res.ok) {
        const { order } = await res.json();
        setOrders((prev) => [order, ...prev]);
        triggerToast(`Recorded Bespoke Order #${order.orderNumber}`);
      }
    } catch (err) {
      console.error("Failed to create order:", err);
    }
  };

  // Create New Product
  const handleCreateProduct = async (payload: {
    name: string;
    collection: string;
    category: string;
    price: number;
    stock: number;
    image: string;
    fabric: string;
    sizes: string[];
    description: string;
  }) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const { product } = await res.json();
        setProducts((prev) => [product, ...prev]);
        triggerToast(`"${product.name}" curated into Lookbook`);
      }
    } catch (err) {
      console.error("Failed to create product:", err);
    }
  };

  // Update Product Stock
  const handleUpdateStock = async (productId: number, newStock: number) => {
    const newStatus =
      newStock <= 0 ? "Sold Out" : newStock <= 5 ? "Low Stock" : "In Stock";

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stock: newStock, stockStatus: newStatus }
          : p
      )
    );

    try {
      const res = await fetch("/api/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, stock: newStock }),
      });
      if (res.ok) {
        const { product } = await res.json();
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? product : p))
        );
        triggerToast(`Vault stock updated for ${product.name}`);
      }
    } catch (err) {
      console.error("Failed to update stock:", err);
    }
  };

  // Delete / Archive Product
  const handleDeleteProduct = async (productId: number) => {
    const target = products.find((p) => p.id === productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));

    try {
      await fetch(`/api/products?id=${productId}`, { method: "DELETE" });
      if (target) {
        triggerToast(`Archived "${target.name}" from active lookbook`);
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  // Create Customer
  const handleCreateCustomer = async (payload: {
    name: string;
    email: string;
    phone: string;
    emirate: string;
    address: string;
    vipTier: "Couture Privé" | "Gold Circle" | "Atelier Member";
    preferredSize: string;
    notes: string;
  }) => {
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const { customer } = await res.json();
        setCustomers((prev) => [customer, ...prev]);
        triggerToast(`Enrolled ${customer.name} in Privé Clientèle Book`);
      }
    } catch (err) {
      console.error("Failed to create customer:", err);
    }
  };

  // Save Atelier Settings
  const handleSaveSettings = async (updated: AtelierSettingsData) => {
    setSettings(updated);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        triggerToast("Maison configuration saved to vault");
      }
    } catch (err) {
      console.error("Failed to update settings:", err);
    }
  };

  const pendingOrdersCount = orders.filter((o) => o.status === "Pending").length;
  const lowStockCount = products.filter(
    (p) => p.stockStatus === "Low Stock" || p.stockStatus === "Sold Out"
  ).length;

  return (
    <div className="min-h-screen flex bg-[#1A0A0C] text-[#FAF5EF] relative">
      {/* Left Fixed Glass Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        pendingOrdersCount={pendingOrdersCount}
        lowStockCount={lowStockCount}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenNewProductModal={() => setShowNewProductModal(true)}
      />

      {/* Right Main Content Column */}
      <div className="flex-1 lg:pl-[280px] flex flex-col min-h-screen min-w-0">
        {/* Topbar */}
        <Topbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          orders={orders}
          products={products}
          onSelectOrder={(order) => setSelectedOrder(order)}
          onSelectTab={(tab) => setActiveTab(tab)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          creativeDirector={settings.creativeDirector}
        />

        {/* Main Workspace Canvas */}
        <main className="flex-1 px-4 sm:px-8 lg:px-10 py-8 max-w-[1600px] w-full mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <OverviewTab
                key="overview"
                orders={orders}
                revenueChartData={REVENUE_CHART_DATA}
                emirateBase={EMIRATE_DISTRIBUTION_BASE}
                onSelectOrder={(order) => setSelectedOrder(order)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenNewProductModal={() => {
                  setActiveTab("products");
                  setShowNewProductModal(true);
                }}
              />
            )}

            {activeTab === "orders" && (
              <OrdersTab
                key="orders"
                orders={orders}
                products={products}
                onSelectOrder={(order) => setSelectedOrder(order)}
                onCreateOrder={handleCreateOrder}
              />
            )}

            {activeTab === "products" && (
              <ProductsTab
                key="products"
                products={products}
                showAddModal={showNewProductModal}
                onOpenAddModal={() => setShowNewProductModal(true)}
                onCloseAddModal={() => setShowNewProductModal(false)}
                onCreateProduct={handleCreateProduct}
                onUpdateStock={handleUpdateStock}
                onDeleteProduct={handleDeleteProduct}
              />
            )}

            {activeTab === "customers" && (
              <CustomersTab
                key="customers"
                customers={customers}
                onCreateCustomer={handleCreateCustomer}
              />
            )}

            {activeTab === "settings" && (
              <SettingsTab
                key="settings"
                settings={settings}
                onSaveSettings={handleSaveSettings}
              />
            )}
          </AnimatePresence>
        </main>

        {/* Subtle Luxury Editorial Footer */}
        <footer className="px-4 sm:px-8 lg:px-10 py-6 border-t border-[#FAF5EF]/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#C4B5A6]/50">
          <div className="flex items-center gap-2">
            <span className="font-serif text-[#FAF5EF]/80">Sabr By Simran</span>
            <span>•</span>
            <span>Jumeirah 1 Flagship Atelier, Dubai, United Arab Emirates</span>
          </div>
          <div className="tabular-nums">
            © 2026 Sabr By Simran Haute Couture LLC. All Rights Reserved.
          </div>
        </footer>
      </div>

      {/* Order Details Slide-Over Drawer */}
      <OrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateOrder={handleUpdateOrder}
      />

      {/* Luxury Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-[#1A0A0C]/95 backdrop-blur-2xl border border-[#E87272]/50 shadow-[0_20px_50px_rgba(0,0,0,0.85)] text-xs text-[#FAF5EF]"
          >
            <CheckCircle2 className="w-4 h-4 text-[#E87272] shrink-0" strokeWidth={1.75} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
