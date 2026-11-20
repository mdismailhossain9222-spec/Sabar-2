import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import CheckoutPage from "./pages/CheckoutPage";
import { Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Routes>
      <CartDrawerWrapper />
    </CartProvider>
  );
}