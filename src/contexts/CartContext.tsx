import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  cartLineKey,
  type CurrencyCode,
  type Product,
  PRODUCTS,
} from "@/data/shop";

export type CartItem = {
  productId: string;
  size: string;
  quantity: number;
};

type CartContextValue = {
  cart: CartItem[];
  currency: CurrencyCode;
  addToCart: (product: Product, size: string) => void;
  removeFromCart: (lineKey: string) => void;
  changeQuantity: (lineKey: string, delta: number) => void;
  clearCart: () => void;
  setCurrency: (code: CurrencyCode) => void;
  cartItems: Array<{
    product: Product;
    quantity: number;
    size: string;
    lineKey: string;
  }>;
  cartCount: number;
  cartSubtotalAed: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const CART_STORAGE_KEY = "sabr-cart-v1";

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Ignore parse errors, start fresh
  }
  return [];
}

function saveCartToStorage(cart: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Ignore storage errors (quota exceeded, private mode, etc.)
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromStorage());
  const [currency, setCurrencyState] = useState<CurrencyCode>("AED");
  const [hydrated, setHydrated] = useState(false);

  // Persist cart changes to localStorage
  useEffect(() => {
    if (hydrated) {
      saveCartToStorage(cart);
    }
  }, [cart, hydrated]);

  // Mark as hydrated after first render (client-side only)
  useEffect(() => {
    setHydrated(true);
  }, []);

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code);
  }, []);

  const addToCart = useCallback((product: Product, size: string) => {
    setCart((previous) => {
      const existing = previous.find(
        (line) => line.productId === product.id && line.size === size
      );
      if (existing) {
        return previous.map((line) =>
          line.productId === product.id && line.size === size
            ? { ...line, quantity: line.quantity + 1 }
            : line
        );
      }
      return [...previous, { productId: product.id, size, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((lineKey: string) => {
    setCart((previous) =>
      previous.filter(
        (line) => cartLineKey(line.productId, line.size) !== lineKey
      )
    );
  }, []);

  const changeQuantity = useCallback((lineKey: string, delta: number) => {
    setCart((previous) =>
      previous.map((line) =>
        cartLineKey(line.productId, line.size) === lineKey
          ? { ...line, quantity: Math.max(1, line.quantity + delta) }
          : line
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartItems = useMemo(
    () =>
      cart.flatMap((line) => {
        const product = PRODUCTS.find((item) => item.id === line.productId);
        return product
          ? [
              {
                product,
                quantity: line.quantity,
                size: line.size,
                lineKey: cartLineKey(line.productId, line.size),
              },
            ]
          : [];
      }),
    [cart]
  );

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartSubtotalAed = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const value = useMemo(
    () => ({
      cart,
      currency,
      addToCart,
      removeFromCart,
      changeQuantity,
      clearCart,
      setCurrency,
      cartItems,
      cartCount,
      cartSubtotalAed,
    }),
    [cart, currency, addToCart, removeFromCart, changeQuantity, clearCart, cartItems, cartCount, cartSubtotalAed]
  );

  // Don't render children until hydrated to avoid SSR mismatch
  if (!hydrated) {
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}