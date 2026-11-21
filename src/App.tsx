import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import CheckoutPage from "./pages/CheckoutPage";
import { Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * /admin route — redirects to the Admin Dashboard URL.
 * In dev: http://localhost:3000
 * In prod: VITE_DASHBOARD_URL env var (set via Cloudflare Worker env or .env)
 */
function AdminRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const dashboardUrl =
      (import.meta.env.VITE_DASHBOARD_URL as string) ||
      `${window.location.origin}/admin`;
    window.location.href = dashboardUrl;
  }, [navigate]);

  return null;
}

function CartDrawerWrapper() {
  const { currency, changeQuantity, removeFromCart } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const navigate = useNavigate();

  const closeCart = () => setCartOpen(false);
  const proceedToCheckout = () => {
    setCartOpen(false);
    navigate("/checkout");
  };

  return (
    <CartDrawer
      open={cartOpen}
      onClose={closeCart}
      currency={currency}
      onQuantityChange={changeQuantity}
      onRemove={removeFromCart}
      onCheckout={proceedToCheckout}
    />
  );
}

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminRedirect />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
      <CartDrawerWrapper />
    </CartProvider>
  );
}