import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { CartDrawer, type DrawerItem } from "@/components/CartDrawer";
import { Reveal } from "@/components/Reveal";
import { SplitText } from "@/components/SplitText";
import { FlamingoMark, Wordmark } from "@/components/Brand";
import {
  DaisyBloom,
  DaisyPattern,
  DaisyStem,
  SparkleOrnament,
} from "@/components/Decor";
import {
  AppleGlyph,
  ArrowUpRight,
  BagIcon,
  CheckIcon,
  ChevronDown,
  CloseIcon,
  DaisyIcon,
  GlobeIcon,
  GoogleGlyph,
  HeartIcon,
  InstagramIcon,
  LeafIcon,
  LockIcon,
  MailIcon,
  MapPinIcon,
  MenuIcon,
  MinusIcon,
  PinterestIcon,
  PlusIcon,
  RulerIcon,
  SearchIcon,
  ShieldIcon,
  SparkleIcon,
  TikTokIcon,
  TruckIcon,
  WhatsAppIcon,
  WhatsAppLogo,
} from "@/components/Icons";
import {
  CURRENCIES,
  PRODUCTS,
  cartLineKey,
  formatMoney,
  type CartLine,
  type CurrencyCode,
  type Product,
} from "@/data/shop";

type PaymentMethod = "apple" | "google" | "card" | "cod";
type ToastMessage = { id: number; message: string; action?: "bag" };

type PaymentOption = {
  id: PaymentMethod;
  label: string;
  detail: string;
  icon: ReactNode;
};

type CustomerDetails = {
  fullName: string;
  phone: string;
  address: string;
};

type CheckoutErrors = Partial<Record<keyof CustomerDetails | "payment", string>>;

type PlacedOrder = {
  reference: string;
  totalAed: number;
  payment: PaymentMethod;
  customerName: string;
};

/** Shared field styling for the one-page checkout. */
const CHECKOUT_INPUT_CLASSES = (hasError = false) =>
  `w-full rounded-xl border bg-white/40 px-4 py-3 text-sm text-darkText transition-all placeholder:text-darkText/50 focus:outline-none focus:ring-2 focus:ring-[#E87272] ${
    hasError ? "border-[#E87272] ring-1 ring-[#E87272]/25" : "border-white/60"
  }`;

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "apple", label: "Apple Pay", detail: "Instant · Face ID", icon: <AppleGlyph className="h-4 w-3.5" /> },
  { id: "google", label: "Google Pay", detail: "Instant · Wallet", icon: <GoogleGlyph className="h-4 w-4" /> },
  {
    id: "card",
    label: "Visa / Mastercard",
    detail: "Credit & debit",
    icon: (
      <span className="flex items-center" aria-hidden="true">
        <span className="h-3 w-3 rounded-full bg-mainPink" />
        <span className="-ml-1 h-3 w-3 rounded-full bg-daisyGreen/90" />
      </span>
    ),
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    detail: "Across the UAE",
    icon: <TruckIcon className="h-4 w-4" />,
  },
];

const NAV_LINKS = [
  { label: "Collection", href: "#collection" },
  { label: "Story", href: "#story" },
  { label: "Contact", href: "#contact" },
];

const MARQUEE_NOTES = [
  "Daisy Dreams — The SS26 Edit",
  "Hand-finished in Dubai",
  "Complimentary delivery across the UAE",
  "Limited runs, considered pieces",
  "Sabar by Simran",
];

const PRESS = ["Vogue Arabia", "Harper's Bazaar", "MOJEH", "Emirates Woman"];

const PRODUCT_MATS = ["bg-daisyYellow", "bg-daisyGreen", "bg-daisyYellow", "bg-daisyGreen"];

const FOOTER_COLUMNS = [
  {
    title: "Customer Care",
    links: [
      { label: "Contact the atelier", href: "mailto:hello@sabarbysimran.ae" },
      {
        label: "Book a private fitting",
        href: "mailto:hello@sabarbysimran.ae?subject=Private%20fitting",
      },
      { label: "Care guide", href: "#story" },
    ],
  },
  {
    title: "Store Policies",
    links: [
      { label: "Shipping & delivery", href: "#checkout" },
      { label: "Returns & exchanges", href: "#checkout" },
      { label: "Privacy & terms", href: "#contact" },
    ],
  },
  {
    title: "Order Tracking",
    links: [
      {
        label: "Track your order",
        href: "mailto:hello@sabarbysimran.ae?subject=Order%20tracking",
      },
      { label: "Start a return", href: "mailto:hello@sabarbysimran.ae?subject=Return" },
      { label: "Payment security", href: "#checkout" },
    ],
  },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "Pinterest", href: "https://pinterest.com", icon: PinterestIcon },
  { label: "TikTok", href: "https://tiktok.com", icon: TikTokIcon },
  { label: "WhatsApp", href: "https://wa.me/", icon: WhatsAppIcon },
];

export default function Home() {
  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [currency, setCurrency] = useState<CurrencyCode>("AED");
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>("apple");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: "",
    phone: "",
    address: "",
  });
  const [checkoutErrors, setCheckoutErrors] = useState<CheckoutErrors>({});
  const [checkoutQuantity, setCheckoutQuantity] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState<PlacedOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const productModalCloseRef = useRef<HTMLButtonElement>(null);
  const productModalRef = useRef<HTMLElement>(null);

  const navReady = !preloaderVisible;

  const notify = useCallback((message: string, action?: "bag") => {
    setToast({ id: Date.now(), message, action });
  }, []);

  const closeCart = useCallback(() => setCartOpen(false), []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
      if (window.scrollY > 12) setPreloaderVisible(false);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const introTimer = window.setTimeout(() => setPreloaderVisible(false), 700);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.clearTimeout(introTimer);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const dismissTimer = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(dismissTimer);
  }, [toast]);

  useEffect(() => {
    if (!cartOpen && !menuOpen && !selectedProduct) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [cartOpen, menuOpen, selectedProduct]);

  useEffect(() => {
    if (!selectedProduct) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Always open the sheet at the product image, not at a previous scroll offset.
    productModalRef.current?.scrollTo({ top: 0 });
    const focusTimer = window.setTimeout(() => productModalCloseRef.current?.focus(), 60);
    return () => {
      window.clearTimeout(focusTimer);
      previouslyFocused?.focus?.();
    };
  }, [selectedProduct]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCartOpen(false);
        setMenuOpen(false);
        setSelectedProduct(null);
        setSelectedSize(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const cartItems = useMemo<DrawerItem[]>(
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

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(PRODUCTS.map((product) => product.category)))],
    []
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(
    () =>
      PRODUCTS.filter((product) => {
        const matchesCategory =
          activeCategory === "All" || product.category === activeCategory;
        if (!matchesCategory) return false;
        if (!normalizedQuery) return true;
        const haystack = [
          product.name,
          product.category,
          product.colour,
          product.note,
          product.description,
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedQuery);
      }),
    [activeCategory, normalizedQuery]
  );

  const hasActiveFilters = normalizedQuery.length > 0 || activeCategory !== "All";

  /**
   * Checkout shows the live shopping bag. When the bag is empty we present a
   * featured piece (The Black Swan) so the one-page checkout can be previewed
   * and ordered directly.
   */
  const isFeaturedCheckout = cartItems.length === 0;
  const checkoutItems: DrawerItem[] = isFeaturedCheckout
    ? [
        {
          product: PRODUCTS[0],
          quantity: checkoutQuantity,
          size: "M",
          lineKey: cartLineKey(PRODUCTS[0].id, "M"),
        },
      ]
    : cartItems;
  const checkoutSubtotalAed = checkoutItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );
  const checkoutPieceCount = checkoutItems.reduce(
    (total, item) => total + item.quantity,
    0
  );
  const checkoutTotalLabel = formatMoney(checkoutSubtotalAed, currency);
  const selectedPayment = PAYMENT_OPTIONS.find((option) => option.id === paymentMethod);

  const openProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize(null);
  };

  const closeProduct = () => {
    setSelectedProduct(null);
    setSelectedSize(null);
  };

  const addToCart = (product: Product, size: string) => {
    // TODO: Integrate the Stripe Checkout Session / Apple Pay API here.
    // Replace this local bag flow with a secure server call when the
    // one-page checkout endpoint is ready.
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
    notify(`${product.name} · Size ${size} added to your edit.`, "bag");
    // Scroll cue is intentionally avoided so the shopper can keep browsing.
  };

  const changeQuantity = (lineKey: string, delta: number) => {
    setCart((previous) =>
      previous.map((line) =>
        cartLineKey(line.productId, line.size) === lineKey
          ? { ...line, quantity: Math.max(1, line.quantity + delta) }
          : line
      )
    );
  };

  const removeFromCart = (lineKey: string) => {
    const line = cart.find(
      (cartLine) => cartLineKey(cartLine.productId, cartLine.size) === lineKey
    );
    const product = PRODUCTS.find((item) => item.id === line?.productId);
    setCart((previous) =>
      previous.filter((cartLine) => cartLineKey(cartLine.productId, cartLine.size) !== lineKey)
    );
    if (product) {
      notify(`${product.name}${line ? ` · Size ${line.size}` : ""} removed from your edit.`);
    }
  };

  const proceedToCheckout = () => {
    // TODO: Swap this hand-off for Stripe Checkout / Tap Payments once the
    // production payment keys and order API are connected.
    setCartOpen(false);
    setToast(null);
    document.getElementById("checkout")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const toggleSaved = (product: Product) => {
    const isSaved = saved.has(product.id);
    setSaved((previous) => {
      const next = new Set(previous);
      if (isSaved) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
    notify(
      isSaved
        ? `${product.name} removed from your wishlist.`
        : `${product.name} saved to your wishlist.`
    );
  };

  const handleCurrency = (code: CurrencyCode) => {
    setCurrency(code);
    notify(`Prices now shown in ${code}.`);
  };

  const updateCustomerField = (field: keyof CustomerDetails, value: string) => {
    setCustomer((previous) => ({ ...previous, [field]: value }));
    setCheckoutErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const choosePaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setCheckoutErrors((previous) => {
      if (!previous.payment) return previous;
      const next = { ...previous };
      delete next.payment;
      return next;
    });
  };

  const adjustCheckoutQuantity = (lineKey: string, delta: number) => {
    if (isFeaturedCheckout) {
      setCheckoutQuantity((quantity) => Math.max(1, quantity + delta));
      return;
    }
    changeQuantity(lineKey, delta);
  };

  const resetCheckout = () => {
    setOrderPlaced(null);
    setCustomer({ fullName: "", phone: "", address: "" });
    setCheckoutErrors({});
    setCheckoutQuantity(1);
    setPaymentMethod("apple");
  };

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: CheckoutErrors = {};

    if (customer.fullName.trim().length < 2) {
      nextErrors.fullName = "Please enter your full name.";
    }
    if (customer.phone.replace(/\D/g, "").length < 7) {
      nextErrors.phone = "Enter a valid phone number, e.g. +971 50 123 4567.";
    }
    if (customer.address.trim().length < 8) {
      nextErrors.address = "Please add a complete delivery address.";
    }
    if (!paymentMethod) {
      nextErrors.payment = "Choose a payment method to continue.";
    }

    setCheckoutErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      notify("Please complete the highlighted checkout details.");
      const firstInvalid = (["fullName", "phone", "address"] as const).find(
        (field) => nextErrors[field]
      );
      const fieldIds: Record<"fullName" | "phone" | "address", string> = {
        fullName: "checkout-full-name",
        phone: "checkout-phone",
        address: "checkout-address",
      };
      if (firstInvalid) {
        window.setTimeout(() => document.getElementById(fieldIds[firstInvalid])?.focus(), 40);
      }
      return;
    }

    if (!paymentMethod) return;

    // TODO: Stripe / Tap Payments integration. Create a secure Checkout
    // Session on the server using the form details above, then redirect the
    // customer to the hosted payment page before confirming the order.
    setOrderPlaced({
      reference: `SBR-${String(Date.now()).slice(-6)}`,
      totalAed: checkoutSubtotalAed,
      payment: paymentMethod,
      customerName: customer.fullName.trim().split(/\s+/)[0],
    });
    setCart([]);
    setCheckoutQuantity(1);
    setCheckoutErrors({});
    notify("Order placed — welcome to the Sabar edit.");
  };

  return (
    <div id="home" className="relative min-h-screen overflow-x-hidden bg-basePink text-darkText">
      <a
        href="#main-content"
        className="sr-only z-[130] rounded-full bg-daisyYellow px-5 py-3 text-xs font-bold text-darkText focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {/* PRELOADER — replace the blank <video /> below with your intro film. */}
      <div
        role="status"
        aria-live="polite"
        aria-hidden={!preloaderVisible}
        aria-label="Welcome to Sabar by Simran"
        className={`fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden bg-mainPink transition-opacity duration-500 ease-out ${
          preloaderVisible ? "opacity-100" : "pointer-events-none invisible opacity-0"
        }`}
      >
        {/* Blank intro video slot, ready for your pre-shot film */}
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-0"
          muted
          playsInline
          loop
          preload="none"
          aria-hidden="true"
        />
        <DaisyPattern
          id="preloader-daisies"
          opacity={0.35}
          petal="#FBF8CE"
          center="#F4C3D1"
          stem="#4A3B42"
        />
        <DaisyStem className="absolute -left-4 bottom-8 hidden h-56 w-36 rotate-12 animate-float opacity-40 sm:block" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-darkText/20 bg-lightPink/45 text-darkText shadow-liquid">
            <FlamingoMark className="h-11 w-11" />
          </span>
          <p className="mt-5 font-serif text-5xl italic tracking-[-0.05em] text-darkText">Sabar</p>
          <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.5em] text-darkText/60">
            by Simran
          </p>
          <span className="mt-8 flex h-1.5 w-32 overflow-hidden rounded-full bg-darkText/15">
            <span className="block h-full w-1/2 animate-pulse rounded-full bg-daisyYellow" />
          </span>
          <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-darkText/50">
            A new era of elegance
          </p>
        </div>
        <p className="absolute bottom-7 left-0 right-0 text-center text-[8px] font-semibold uppercase tracking-[0.34em] text-darkText/45">
          Dubai · United Arab Emirates
        </p>
      </div>

      <div className="page-grain" aria-hidden="true" />

      {/* FLOATING NAVBAR */}
      <header
        className={`fixed inset-x-0 z-50 px-3 transition-all duration-500 sm:px-5 ${
          scrolled ? "top-2.5" : "top-3.5 sm:top-5"
        }`}
      >
        <nav
          aria-label="Primary navigation"
          className={`liquid-glass-nav relative z-50 mx-auto flex max-w-[1240px] items-center justify-between gap-3 rounded-full px-3 py-2.5 transition-shadow duration-500 sm:px-5 lg:px-6 ${
            scrolled ? "shadow-[0_16px_42px_-20px_rgba(74,59,66,0.45)]" : ""
          }`}
        >
          <span className={`shrink-0 md:hidden ${navReady ? "animate-fade-down" : "opacity-0"}`}>
            <Wordmark size="sm" ariaLabel="Sabar by Simran — return to top" />
          </span>
          <span
            style={navReady ? { animationDelay: "80ms" } : undefined}
            className={`hidden shrink-0 md:block ${navReady ? "animate-fade-down" : "opacity-0"}`}
          >
            <Wordmark size="md" ariaLabel="Sabar by Simran — return to top" />
          </span>

          <div className="hidden flex-1 items-center justify-center gap-8 md:flex lg:gap-11">
            {NAV_LINKS.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                style={navReady ? { animationDelay: `${140 + index * 90}ms` } : undefined}
                className={`link-underline eyebrow flex items-center gap-2 text-[9px] text-darkText/75 transition-colors duration-300 hover:text-darkText ${
                  navReady ? "animate-fade-down" : "opacity-0"
                }`}
              >
                <span className="h-1 w-1 rounded-full bg-darkText/50" aria-hidden="true" />
                {link.label}
              </a>
            ))}
          </div>

          <div
            style={navReady ? { animationDelay: "220ms" } : undefined}
            className={`flex shrink-0 items-center gap-1.5 sm:gap-2 ${
              navReady ? "animate-fade-down" : "opacity-0"
            }`}
          >
            <div className="relative flex items-center gap-1 rounded-full border border-darkText/12 bg-lightPink/35 px-2 py-1.5 text-darkText transition hover:border-darkText/25 hover:bg-lightPink/55 sm:gap-1.5 sm:px-2.5">
              <GlobeIcon className="hidden h-3.5 w-3.5 text-darkText/50 sm:block" />
              <label htmlFor="currency-select" className="sr-only">
                Select currency
              </label>
              <select
                id="currency-select"
                value={currency}
                onChange={(event) => handleCurrency(event.target.value as CurrencyCode)}
                aria-label="Select currency"
                className="w-[42px] cursor-pointer appearance-none bg-transparent pr-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-darkText/75 outline-none sm:w-[46px] sm:text-[10px]"
              >
                {Object.values(CURRENCIES).map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none h-3 w-3 text-darkText/50"
                aria-hidden="true"
              />
            </div>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Open shopping bag${
                cartCount > 0
                  ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}`
                  : ", empty"
              }`}
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-darkText/12 bg-lightPink/35 text-darkText/75 transition hover:border-darkText/25 hover:bg-lightPink/60 hover:text-darkText sm:h-10 sm:w-10"
            >
              <BagIcon className="h-4 w-4" />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="animate-cart-pop absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E87272] px-1 text-[8px] font-bold leading-none text-white shadow-[0_0_0_2px_rgba(252,228,236,0.9)]"
                >
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-darkText/12 bg-lightPink/35 text-darkText/75 transition hover:border-darkText/25 hover:bg-lightPink/60 hover:text-darkText md:hidden"
            >
              {menuOpen ? <CloseIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="md:hidden">
            <button
              type="button"
              aria-label="Dismiss navigation menu"
              tabIndex={-1}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 z-40 h-full w-full cursor-default bg-darkText/15 backdrop-blur-[2px]"
            />
            <div
              id="mobile-menu"
              className="animate-menu-in fixed inset-x-3 top-[4.85rem] z-50 overflow-hidden rounded-[1.75rem] border border-white/50 bg-basePink/95 p-5 shadow-[0_24px_70px_-24px_rgba(74,59,66,0.5)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-darkText/10 pb-3">
                <p className="eyebrow flex items-center gap-2 text-darkText/55">
                  <DaisyIcon className="h-3.5 w-3.5" /> The house of Sabar
                </p>
                <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-darkText/40">
                  Dubai · SS26
                </span>
              </div>
              <nav aria-label="Mobile navigation" className="mt-1">
                {NAV_LINKS.map((link, index) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-label={`${link.label} section`}
                    style={{ animationDelay: `${90 + index * 80}ms` }}
                    className="group flex animate-fade-down items-center justify-between border-b border-darkText/10 py-3.5"
                  >
                    <span className="flex items-baseline gap-3">
                      <span
                        aria-hidden="true"
                        className="text-[8px] font-bold tracking-[0.18em] text-darkText/45"
                      >
                        0{index + 1}
                      </span>
                      <span className="font-serif text-2xl italic text-darkText">{link.label}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-darkText/40 transition group-hover:text-darkText" />
                  </a>
                ))}
              </nav>
              <a
                href="#collection"
                onClick={() => setMenuOpen(false)}
                className="liquid-btn btn-shine mt-4 w-full py-3.5 transition-all duration-300 hover:scale-105 hover:bg-[#F09DBB] hover:text-darkText active:scale-95"
                aria-label="Explore the SS26 collection"
              >
                Explore the collection <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-darkText/45">
                <TruckIcon className="h-3.5 w-3.5" /> Complimentary UAE delivery
              </p>
            </div>
          </div>
        )}
      </header>

      <main id="main-content">
        {/* HERO — full-bleed landscape campaign film */}
        <section
          aria-labelledby="hero-heading"
          className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-mainPink"
        >
          {/* Empty landscape video slot — add src="/videos/sabar-hero.mp4" when ready */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_35%,#F4C3D1_0%,#F09DBB_45%,#B76A86_100%)]"
          />
          <video
            className="absolute inset-0 z-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            aria-hidden="true"
          />

          {/* Readability overlay: pink-tinted cinematic grade plus a soft dark vignette */}
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-[#F09DBB]/40 mix-blend-multiply"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 z-10 bg-[linear-gradient(180deg,rgba(38,24,30,0.55)_0%,rgba(38,24,30,0.24)_34%,rgba(38,24,30,0.2)_58%,rgba(38,24,30,0.5)_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-10 opacity-30 [background:radial-gradient(circle_at_50%_45%,transparent_25%,rgba(38,24,30,0.55)_100%)]"
          />

          {/* Editorial framing marks */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-5 top-20 z-20 flex items-center justify-between gap-4 border-t border-white/25 pt-3 sm:inset-x-8 sm:top-24 lg:inset-x-12"
          >
            <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-white/75 sm:text-[8px]">
              Sabar by Simran
            </p>
            <p className="hidden text-[7px] font-bold uppercase tracking-[0.3em] text-white/65 sm:block sm:text-[8px]">
              The Desert Bloom · SS26
            </p>
            <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-white/75 sm:text-[8px]">
              Dubai · UAE
            </p>
          </div>

          <div className="relative z-20 mx-auto flex w-full max-w-[1120px] flex-col items-center px-6 pb-24 pt-40 text-center sm:pb-28 sm:pt-44">
            <Reveal delay={0} variant="fade" start={navReady}>
              <span className="liquid-glass-light inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[8px] font-bold uppercase tracking-[0.22em] text-white/90">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-daisyYellow opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-daisyYellow" />
                </span>
                SS26 — Daisy Dreams
                <span className="h-2.5 w-px bg-white/35" aria-hidden="true" />
                <span className="font-medium tracking-[0.18em] text-white/65">Campaign Film</span>
              </span>
            </Reveal>

            <Reveal delay={100} variant="fade" start={navReady} className="mt-7 w-full sm:mt-8">
              <h1
                id="hero-heading"
                aria-label="Redefining Elegance."
                className="editorial-heading text-[clamp(3.4rem,9vw,8rem)] leading-[0.94] text-white drop-shadow-[0_4px_26px_rgba(38,24,30,0.45)]"
              >
                <span aria-hidden="true" className="block whitespace-nowrap">
                  <SplitText text="Redefining" delay={160} stagger={90} />
                </span>
                <span aria-hidden="true" className="relative inline-block whitespace-nowrap">
                  <SplitText
                    text="Elegance"
                    accent="."
                    accentClassName="text-daisyYellow"
                    delay={280}
                    stagger={90}
                  />
                </span>
              </h1>
            </Reveal>

            <Reveal delay={260} variant="fade" start={navReady}>
              <p className="mx-auto mt-6 max-w-[32rem] text-[13px] font-normal leading-[1.85] text-white/90 drop-shadow-[0_2px_10px_rgba(38,24,30,0.4)] sm:mt-7 sm:text-[15px]">
                Premium clothing crafted for the modern UAE lifestyle.
              </p>
              <p className="mt-3 text-[8px] font-bold uppercase tracking-[0.24em] text-white/65 sm:text-[9px]">
                Hand-finished in Dubai · Made in small numbers
              </p>
            </Reveal>

            <Reveal delay={380} variant="fade" start={navReady}>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-10 sm:flex-row sm:gap-4">
                <a
                  href="#collection"
                  aria-label="Explore the Sabar by Simran SS26 collection"
                  className="liquid-glass-light group inline-flex w-full items-center justify-center gap-3 rounded-full px-6 py-4 text-[9px] font-bold uppercase tracking-[0.18em] text-darkText transition-all duration-300 hover:scale-105 hover:bg-white/45 hover:shadow-[0_16px_40px_-16px_rgba(38,24,30,0.55)] active:scale-95 sm:w-auto"
                >
                  Explore Collection
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/40 transition-all duration-300 group-hover:rotate-45 group-hover:bg-white/60">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </a>
                <a
                  href="#story"
                  aria-label="Read the Sabar by Simran brand story"
                  className="liquid-glass-light group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-[9px] font-bold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95 sm:w-auto"
                >
                  <span className="link-underline">Our Story</span>
                  <span
                    aria-hidden="true"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  >
                    →
                  </span>
                </a>
              </div>
            </Reveal>

            <Reveal delay={500} variant="fade" start={navReady}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/20 pt-5 sm:mt-11">
                {[
                  { icon: TruckIcon, text: "Complimentary delivery in the UAE" },
                  { icon: LeafIcon, text: "Considered, small-batch craft" },
                ].map(({ icon: FeatureIcon, text }) => (
                  <p
                    key={text}
                    className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-white/70 drop-shadow-[0_1px_6px_rgba(38,24,30,0.4)] sm:text-[9px]"
                  >
                    <FeatureIcon className="h-3.5 w-3.5 text-white/80" />
                    {text}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>

          <a
            href="#collection"
            aria-label="Scroll down to discover the collection"
            className="group absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-[7px] font-bold uppercase tracking-[0.26em] text-white/65 transition-colors duration-300 hover:text-white sm:bottom-8 sm:text-[8px]"
          >
            Scroll to discover
            <span className="flex h-8 w-px justify-center overflow-hidden bg-white/30">
              <span className="block h-1/2 w-full animate-float bg-white/80" />
            </span>
          </a>
        </section>

        {/* RUNNING EDITORIAL NOTES */}
        <section
          aria-label="Brand notes"
          className="relative overflow-hidden border-y border-darkText/15 bg-daisyYellow py-3.5"
        >
          <div className="flex w-max animate-marquee">
            {[0, 1].map((group) => (
              <div
                key={group}
                className="flex shrink-0 items-center gap-7 pr-7 sm:gap-10 sm:pr-10"
                aria-hidden={group === 1 ? "true" : undefined}
              >
                {MARQUEE_NOTES.map((note) => (
                  <span key={`${group}-${note}`} className="flex shrink-0 items-center gap-7 sm:gap-10">
                    <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-darkText/65 sm:text-[10px]">
                      {note}
                    </span>
                    <DaisyIcon className="h-3.5 w-3.5 text-darkText/70" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* PRESS */}
        <section aria-label="Selected press" className="border-b border-darkText/10 bg-basePink py-6">
          <Reveal
            variant="fade"
            className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8 lg:px-10"
          >
            <p className="eyebrow flex items-center gap-2.5 text-[8px] text-darkText/45">
              <span className="hairline" aria-hidden="true" /> As seen in
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 sm:gap-x-10">
              {PRESS.map((publication) => (
                <span
                  key={publication}
                  className="press-logo inline-block text-[10px] text-darkText/50 transition-all duration-300 hover:-translate-y-0.5 hover:text-darkText sm:text-[11px]"
                >
                  {publication}
                </span>
              ))}
            </div>
          </Reveal>
        </section>

        {/* THE COLLECTION */}
        <section
          id="collection"
          aria-labelledby="collection-heading"
          className="relative scroll-mt-24 overflow-hidden bg-lightPink py-20 sm:py-24 lg:py-28"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <DaisyPattern
              id="collection-daisies"
              opacity={0.15}
              petal="#F09DBB"
              center="#FBF8CE"
              stem="#9EB79B"
            />
            <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-mainPink/30 blur-3xl" />
            <div className="absolute -left-28 bottom-10 h-80 w-80 rounded-full bg-daisyYellow/50 blur-3xl" />
            <DaisyBloom
              className="animate-spin-slow absolute -right-10 top-24 h-40 w-40 rotate-12 text-darkText/10"
              petal="#F09DBB"
              center="#FBF8CE"
            />
            <DaisyIcon className="animate-float absolute bottom-24 left-[6%] hidden h-8 w-8 -rotate-12 text-darkText/20 lg:block [animation-delay:2s]" />
            <span className="absolute left-4 top-10 font-serif text-7xl italic leading-none text-darkText/10 sm:left-10 sm:text-9xl">
              02
            </span>
          </div>

          <div className="relative mx-auto max-w-[1340px] px-5 sm:px-8 lg:px-10">
            <Reveal variant="fade" className="flex flex-col items-center text-center" threshold={0.25}>
              <p className="eyebrow flex items-center gap-3 text-[8px] text-darkText/50">
                <span className="hairline text-darkText" aria-hidden="true" /> The SS26 Edit
                <span className="hairline text-darkText" aria-hidden="true" />
              </p>
              <SplitText
                as="h2"
                id="collection-heading"
                text="The Collection"
                delay={80}
                stagger={110}
                className="editorial-heading mt-5 text-[clamp(3rem,6.4vw,5.5rem)] leading-[0.95] text-darkText"
              />
              <Reveal delay={180} variant="fade">
                <p className="mx-auto mt-4 max-w-[30rem] text-xs font-normal leading-[1.8] text-darkText/65 sm:text-[13px]">
                  Four considered silhouettes, cut for the woman who understands that true elegance is
                  never loud. Each piece is produced in a limited run.
                </p>
              </Reveal>
            </Reveal>

            <Reveal delay={140} variant="fade" className="mt-10">
              <div className="liquid-glass-light rounded-[1.6rem] p-2.5 shadow-[0_18px_45px_-30px_rgba(74,59,66,0.55)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3 rounded-full border border-white/60 bg-white/30 px-4 py-3 transition-all duration-300 focus-within:border-[#E87272]/60 focus-within:bg-white/45 focus-within:shadow-[0_0_0_4px_rgba(232,114,114,0.1)] sm:px-5 sm:py-3.5">
                    <SearchIcon className="h-4 w-4 shrink-0 text-darkText/60" />
                    <label htmlFor="collection-search" className="sr-only">
                      Search the collection
                    </label>
                    <input
                      id="collection-search"
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search the collection — name, fabric or mood"
                      autoComplete="off"
                      aria-label="Search the collection by name"
                      className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-darkText outline-none placeholder:text-darkText/45 [&::-webkit-search-cancel-button]:hidden"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear collection search"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-darkText/10 text-darkText/55 transition-all duration-300 hover:bg-darkText hover:text-daisyYellow"
                      >
                        <CloseIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 sm:px-2">
                    <p
                      className="text-[8px] font-bold uppercase tracking-[0.15em] text-darkText/50"
                      aria-live="polite"
                    >
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1 ? "piece" : "pieces"}
                      {hasActiveFilters ? " found" : " available"}
                    </p>
                    <span className="hidden h-7 w-px bg-darkText/15 sm:block" aria-hidden="true" />
                    <span className="hidden text-[8px] font-bold uppercase tracking-[0.15em] text-darkText/40 sm:block">
                      SS26
                    </span>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2.5 border-t border-white/45 px-1 pb-0.5 pt-2.5">
                  <div
                    role="group"
                    aria-label="Filter the collection by category"
                    className="flex flex-wrap items-center gap-1.5 sm:gap-2"
                  >
                    {categories.map((category) => {
                      const isActive = activeCategory === category;
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setActiveCategory(category)}
                          aria-pressed={isActive}
                          aria-label={`Show ${category === "All" ? "all pieces" : `${category} pieces`}`}
                          className={`rounded-full border px-3.5 py-2 text-[8px] font-bold uppercase tracking-[0.13em] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.03] sm:px-4 ${
                            isActive
                              ? "border-[#E87272] bg-[#E87272] text-white shadow-[0_8px_22px_-10px_rgba(232,114,114,0.85)]"
                              : "border-white/60 bg-white/25 text-darkText/60 hover:border-darkText/25 hover:bg-white/45 hover:text-darkText"
                          }`}
                        >
                          {category}
                        </button>
                      );
                    })}
                  </div>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setActiveCategory("All");
                      }}
                      aria-label="Clear all collection filters"
                      className="group flex items-center gap-1 rounded-full px-2 py-1.5 text-[8px] font-bold uppercase tracking-[0.13em] text-darkText/50 transition hover:text-darkText"
                    >
                      Reset
                      <CloseIcon className="h-2.5 w-2.5 transition-transform duration-300 group-hover:rotate-90" />
                    </button>
                  )}
                </div>
              </div>
            </Reveal>

            {filteredProducts.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-8 xl:grid-cols-4">
                {filteredProducts.map((product, index) => {
                  const isSaved = saved.has(product.id);
                  const price = formatMoney(product.price, currency);
                  return (
                    <Reveal key={product.id} delay={index * 90} className="h-full">
                      <article className="group liquid-card flex h-full flex-col rounded-3xl p-3 transition-all duration-300 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(232,114,114,0.2)]">
                        <div
                          className={`relative aspect-[3/4] overflow-hidden rounded-[1.15rem] border border-darkText/10 ${PRODUCT_MATS[index % PRODUCT_MATS.length]}`}
                        >
                          <div className="absolute inset-2 overflow-hidden rounded-[0.9rem] bg-lightPink">
                            <img
                              src={product.image}
                              alt={product.imageAlt}
                              loading="lazy"
                              decoding="async"
                              className="h-full w-full object-cover transition-all duration-[900ms] ease-out group-hover:scale-[1.055]"
                            />
                            <div
                              aria-hidden="true"
                              className="absolute inset-0 bg-linear-to-t from-darkText/35 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                            />
                          </div>

                          <span className="liquid-glass-light absolute left-3 top-3 z-10 rounded-full px-2.5 py-1.5 text-[7px] font-bold uppercase tracking-[0.16em] text-darkText/75">
                            Nº {String(index + 1).padStart(2, "0")}
                          </span>

                          <button
                            type="button"
                            onClick={() => toggleSaved(product)}
                            aria-pressed={isSaved}
                            aria-label={
                              isSaved
                                ? `Remove ${product.name} from your wishlist`
                                : `Save ${product.name} to your wishlist`
                            }
                            className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-all duration-300 hover:scale-110 ${
                              isSaved
                                ? "border-darkText bg-darkText text-daisyYellow"
                                : "border-white/60 bg-lightPink/55 text-darkText/65 hover:bg-daisyYellow hover:text-darkText"
                            }`}
                          >
                            <HeartIcon filled={isSaved} className="h-3.5 w-3.5" />
                          </button>

                          {product.badge && (
                            <span className="absolute bottom-3 left-3 z-10 rounded-full bg-daisyGreen px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.16em] text-darkText shadow-sm">
                              {product.badge}
                            </span>
                          )}

                          <span
                            aria-hidden="true"
                            className="liquid-glass-light absolute bottom-3 right-3 z-10 flex translate-y-2 items-center gap-1 rounded-full px-2.5 py-1.5 text-[7px] font-bold uppercase tracking-[0.14em] text-darkText/80 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                          >
                            View <ArrowUpRight className="h-2.5 w-2.5" />
                          </span>
                        </div>

                        <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="eyebrow text-[7px] text-darkText/50">{product.category}</p>
                            <span className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-darkText/45">
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-lightPink ring-1 ring-darkText/20"
                                aria-hidden="true"
                              />
                              {product.colour}
                            </span>
                          </div>
                          <SplitText
                            as="h3"
                            text={product.name}
                            delay={220}
                            stagger={45}
                            className="mt-2 font-serif text-[1.35rem] italic leading-tight text-darkText sm:text-[1.45rem]"
                          />
                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <p
                              key={`${product.id}-${currency}`}
                              className="animate-fade-in text-[12px] font-bold tracking-[0.02em] text-darkText/80"
                            >
                              {price}
                            </p>
                            <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-darkText/35">
                              {product.sizes.join(" · ")}
                            </p>
                          </div>
                          <p className="mt-2 line-clamp-2 min-h-[2.6em] text-[10px] font-normal leading-[1.65] text-darkText/55">
                            {product.note}
                          </p>
                          <button
                            type="button"
                            onClick={() => openProduct(product)}
                            aria-label={`Open ${product.name} to choose a size and order`}
                            className="liquid-btn btn-shine group/btn mt-auto w-full justify-between px-4 py-3.5 pt-3.5 text-[9px] transition-all duration-300 hover:scale-105 hover:bg-[#F09DBB] hover:text-darkText active:scale-95"
                          >
                            Order Now
                            <ArrowUpRight className="h-3.5 w-3.5 transition-all duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" />
                          </button>
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            ) : (
              <div className="animate-fade-up liquid-glass-light mt-10 rounded-[1.8rem] px-6 py-12 text-center sm:px-10">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-lightPink/55 text-darkText">
                  <SearchIcon className="h-6 w-6" />
                </span>
                <p className="eyebrow mt-4 text-darkText/45">No pieces found</p>
                <h3 className="editorial-heading mt-2 text-[2rem] leading-tight text-darkText">
                  Try a different search.
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-[11px] leading-[1.75] text-darkText/55">
                  We couldn’t find a match for “{searchQuery || activeCategory}”. Explore the full
                  edit, or search by a fabric or silhouette.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="liquid-btn mt-5 px-6 py-3.5 transition-all duration-300 hover:scale-105 hover:bg-[#F09DBB] hover:text-darkText active:scale-95"
                  aria-label="Show all pieces in the collection"
                >
                  View all pieces
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

            <Reveal
              delay={120}
              variant="fade"
              className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-darkText/15 pt-6 sm:flex-row"
            >
              <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-darkText/50">
                <LeafIcon className="h-4 w-4 text-darkText/70" aria-hidden="true" />
                Limited runs · Considered fabrics · Made to be kept
              </p>
              <a
                href="mailto:hello@sabarbysimran.ae?subject=Private%20appointment"
                aria-label="Request a private appointment with the Sabar atelier"
                className="group inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-darkText/70 hover:text-darkText"
              >
                <span className="link-underline">Request a private appointment</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Reveal>
          </div>
        </section>

        {/* BRAND STORY */}
        <section
          id="story"
          aria-labelledby="story-heading"
          className="relative scroll-mt-24 overflow-hidden bg-daisyYellow py-20 sm:py-24 lg:py-32"
        >
          <DaisyPattern
            id="story-daisies"
            opacity={0.28}
            petal="#F09DBB"
            center="#FBF8CE"
            stem="#9EB79B"
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute -right-24 top-24 h-96 w-96 rounded-full bg-lightPink/35 blur-3xl" />
            <div className="absolute -left-20 bottom-0 h-80 w-80 rounded-full bg-mainPink/20 blur-3xl" />
            <DaisyBloom
              className="animate-spin-slow absolute -left-12 bottom-24 h-36 w-36 -rotate-12 text-darkText/15"
              petal="#F4C3D1"
              center="#FBF8CE"
            />
            <DaisyIcon className="animate-float absolute right-[8%] top-16 hidden h-9 w-9 rotate-12 text-darkText/20 lg:block" />
          </div>

          <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
            <div className="grid gap-14 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-16 xl:gap-24">
              <div>
                <Reveal threshold={0.2} variant="fade">
                  <p className="eyebrow flex items-center gap-3 text-[8px] text-darkText/50">
                    <span className="hairline text-darkText" aria-hidden="true" /> 03 — Our Story
                  </p>
                  <SplitText
                    as="h2"
                    id="story-heading"
                    text="Crafted for the bold."
                    delay={80}
                    stagger={80}
                    className="editorial-heading mt-5 max-w-[12ch] text-[clamp(3rem,5.6vw,5.2rem)] leading-[1.02] text-darkText"
                  />
                  <p className="mt-4 font-serif text-lg italic text-darkText/75">Sabar means patience.</p>
                </Reveal>

                <Reveal delay={140}>
                  <div className="mt-6 max-w-[33rem] space-y-4 text-[12px] font-normal leading-[1.8] text-darkText/70 sm:text-[13px]">
                    <p>
                      Sabar began with a simple thought: that patience is the truest form of luxury.
                      Every piece is cut, draped and finished in our Dubai atelier — made slowly, in small
                      numbers, for the woman who knows exactly who she is.
                    </p>
                    <p>
                      Rooted in the colours of the Gulf and inspired by the ease of the modern wardrobe,
                      our silhouettes move from morning light to midnight without ever asking for
                      attention.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={240}>
                <ul className="mt-7 grid max-w-[33rem] gap-4 sm:grid-cols-3">
                  {[
                    { icon: MapPinIcon, title: "Made in the UAE", text: "Atelier crafted" },
                    { icon: LeafIcon, title: "Small batch", text: "Under 50 pieces" },
                    { icon: SparkleIcon, title: "Considered", text: "Designed to last" },
                  ].map(({ icon: StoryIcon, title, text }) => (
                    <li key={title} className="flex items-start gap-2.5">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-darkText/15 bg-mainPink/30 text-darkText">
                        <StoryIcon className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-darkText/75">
                          {title}
                        </p>
                        <p className="mt-0.5 text-[9px] text-darkText/50">{text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                </Reveal>

                <Reveal delay={330}>
                <div className="mt-8 flex flex-col items-start gap-5 border-t border-darkText/20 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full border border-darkText/15 bg-lightPink/60 text-darkText">
                      <FlamingoMark className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-serif text-2xl italic leading-none text-darkText">Simran</p>
                      <p className="mt-1.5 text-[7px] font-bold uppercase tracking-[0.2em] text-darkText/50">
                        Founder & Creative Director
                      </p>
                    </div>
                  </div>
                  <a
                    href="#collection"
                    className="liquid-btn btn-shine group/discover px-5 py-3 transition-all duration-300 hover:scale-105 hover:bg-[#F09DBB] hover:text-darkText active:scale-95"
                    aria-label="Discover the Sabar collection"
                  >
                    Discover the edit{" "}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-all duration-300 group-hover/discover:-translate-y-0.5 group-hover/discover:translate-x-0.5" />
                  </a>
                </div>
                </Reveal>
              </div>

              <Reveal delay={160} variant="right" className="mx-auto w-full max-w-[500px]">
              <figure className="relative mx-auto w-full max-w-[500px]">
                <DaisyStem
                  className="animate-float absolute -left-10 -top-12 hidden h-44 w-28 -rotate-12 drop-shadow-sm sm:block lg:-left-14"
                  petal="#FBF8CE"
                  center="#F09DBB"
                  stem="#4A3B42"
                />

                <div className="liquid-glass-light relative rounded-[2.1rem] p-2.5 shadow-[0_28px_65px_-34px_rgba(74,59,66,0.4)] sm:rounded-[2.4rem] sm:p-3">
                  <div className="relative aspect-square overflow-hidden rounded-[1.65rem] bg-lightPink sm:rounded-[1.9rem]">
                    <img
                      src="/images/story.jpg"
                      alt="Hands draping blush silk in the Sabar by Simran atelier, surrounded by daisies and tailoring tools"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-all duration-[1400ms] ease-out hover:scale-[1.035]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-linear-to-t from-darkText/65 via-darkText/5 to-transparent"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-mainPink/15 mix-blend-multiply"
                    />
                    <span className="liquid-glass-light absolute left-3 top-3 rounded-full px-3 py-1.5 text-[7px] font-bold uppercase tracking-[0.18em] text-darkText/75 sm:left-4 sm:top-4">
                      The Atelier · Dubai
                    </span>

                    <figcaption className="liquid-glass-light absolute inset-x-3 bottom-3 rounded-[1.2rem] px-4 py-3.5 sm:inset-x-4 sm:bottom-4 sm:px-5">
                      <DaisyIcon className="mb-2 h-4 w-4 animate-float text-darkText" />
                      <p className="font-serif text-lg italic leading-snug text-darkText sm:text-xl">
                        “Elegance is not seen. It is felt.”
                      </p>
                      <p className="mt-2 text-[7px] font-bold uppercase tracking-[0.2em] text-darkText/55">
                        Simran · Founder
                      </p>
                    </figcaption>
                  </div>
                </div>

                <div className="absolute -left-9 top-1/2 hidden h-24 w-24 -translate-y-1/2 rounded-full border border-white/60 bg-daisyGreen shadow-liquid backdrop-blur-md sm:flex lg:-left-12 lg:h-28 lg:w-28">
                  <span className="flex h-full w-full flex-col items-center justify-center text-center text-darkText">
                    <DaisyIcon className="h-5 w-5 animate-spin-slow" />
                    <span className="mt-1 text-[6px] font-bold uppercase leading-[1.6] tracking-[0.13em]">
                      Made with
                      <br />
                      sabar
                    </span>
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between gap-4 px-2">
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-darkText/45">
                    Hand-finished details
                  </p>
                  <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-darkText/45">
                    Nº 03 / Atelier
                  </p>
                </div>
              </figure>
              </Reveal>
            </div>

            <Reveal delay={80} variant="fade">
            <dl className="mt-16 grid grid-cols-2 gap-6 border-t border-darkText/20 pt-8 sm:mt-20 sm:grid-cols-4">
              {[
                { term: "Atelier", detail: "Dubai, UAE" },
                { term: "Pieces", detail: "Small batch" },
                { term: "Delivery", detail: "Across the UAE" },
                { term: "Established", detail: "2021" },
              ].map((stat) => (
                <div key={stat.term}>
                  <dt className="text-[8px] font-bold uppercase tracking-[0.18em] text-darkText/45">
                    {stat.term}
                  </dt>
                  <dd className="mt-1.5 font-serif text-xl italic text-darkText/85">{stat.detail}</dd>
                </div>
              ))}
            </dl>
            </Reveal>
          </div>
        </section>

        {/* SECURE CHECKOUT */}
        <section
          id="checkout"
          aria-labelledby="checkout-heading"
          className="relative scroll-mt-24 overflow-hidden bg-mainPink py-16 sm:py-20 lg:py-24"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <DaisyPattern
              id="checkout-daisies"
              opacity={0.13}
              petal="#FBF8CE"
              center="#F4C3D1"
              stem="#4A3B42"
            />
            <div className="absolute left-1/2 top-1/2 h-80 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lightPink/30 blur-3xl" />
            <SparkleOrnament className="animate-spin-slow absolute right-10 top-12 hidden h-12 w-12 text-darkText/20 lg:block" />
            <DaisyIcon className="animate-float absolute bottom-10 left-[7%] hidden h-9 w-9 rotate-12 text-darkText/20 lg:block [animation-delay:1.2s]" />
            <DaisyBloom
              className="animate-spin-slower absolute -left-16 top-24 hidden h-40 w-40 text-darkText/10 lg:block"
              petal="#FBF8CE"
              center="#F4C3D1"
              petals={10}
            />
          </div>

          <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
            <Reveal variant="scale" threshold={0.08}>
              <div className="liquid-glass-light relative overflow-hidden rounded-[2rem] p-4 sm:p-8 lg:p-10">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-daisyYellow/55 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-lightPink/55 blur-3xl"
                />

                <header className="relative mb-7 flex flex-col gap-5 border-b border-darkText/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-xl">
                    <p className="eyebrow flex items-center gap-3 text-[8px] text-darkText/50">
                      <span className="hairline text-darkText" aria-hidden="true" /> 04 — Secure
                      Checkout
                    </p>
                    <SplitText
                      as="h2"
                      id="checkout-heading"
                      text={`Secure Checkout in ${currency}`}
                      delay={60}
                      stagger={65}
                      className="editorial-heading mt-3 text-[clamp(2.3rem,4.5vw,3.6rem)] leading-[1.02] text-darkText"
                    />
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-darkText/60">
                      Direct one-page checkout for a seamless experience.
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-darkText/45">
                      Complimentary delivery across the UAE · Displayed in {currency}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="liquid-glass-light inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-darkText/65">
                      <LockIcon className="h-3.5 w-3.5" /> SSL secured
                    </span>
                    <span className="liquid-glass-light inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-darkText/65">
                      <TruckIcon className="h-3.5 w-3.5" /> Free UAE delivery
                    </span>
                  </div>
                </header>

                {orderPlaced ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="animate-success-pop relative overflow-hidden rounded-2xl border border-white/50 bg-white/30 px-5 py-9 text-center sm:px-10 sm:py-12"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-daisyYellow/60 blur-2xl"
                    />
                    <DaisyBloom
                      className="animate-spin-slow absolute -left-14 -bottom-14 h-40 w-40 text-lightPink/50"
                      petal="#F4C3D1"
                      center="#FBF8CE"
                      petals={10}
                    />
                    <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/60 bg-daisyGreen text-darkText shadow-liquid">
                      <CheckIcon className="h-7 w-7" />
                    </span>
                    <p className="eyebrow relative mt-4 text-darkText/55">Order confirmed</p>
                    <h3 className="editorial-heading relative mt-2 text-[clamp(2rem,4vw,3rem)] leading-tight text-darkText">
                      Beautifully done, {orderPlaced.customerName}.
                    </h3>
                    <p className="relative mx-auto mt-3 max-w-md text-[12px] leading-[1.8] text-darkText/65">
                      Your order has been received at our Dubai atelier. A stylist will confirm your
                      delivery details on WhatsApp shortly.
                    </p>
                    <dl className="relative mx-auto mt-7 grid max-w-2xl grid-cols-2 gap-3 text-left sm:grid-cols-4">
                      <div className="rounded-xl border border-white/50 bg-white/35 px-3.5 py-3">
                        <dt className="text-[7px] font-bold uppercase tracking-[0.16em] text-darkText/45">Order</dt>
                        <dd className="mt-1 text-[11px] font-bold text-darkText">{orderPlaced.reference}</dd>
                      </div>
                      <div className="rounded-xl border border-white/50 bg-white/35 px-3.5 py-3">
                        <dt className="text-[7px] font-bold uppercase tracking-[0.16em] text-darkText/45">Total</dt>
                        <dd className="mt-1 text-[11px] font-bold text-darkText">
                          {formatMoney(orderPlaced.totalAed, currency)}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-white/50 bg-white/35 px-3.5 py-3">
                        <dt className="text-[7px] font-bold uppercase tracking-[0.16em] text-darkText/45">Payment</dt>
                        <dd className="mt-1 text-[11px] font-bold text-darkText">
                          {PAYMENT_OPTIONS.find((option) => option.id === orderPlaced.payment)?.label ??
                            "Secure payment"}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-white/50 bg-white/35 px-3.5 py-3">
                        <dt className="text-[7px] font-bold uppercase tracking-[0.16em] text-darkText/45">Delivery</dt>
                        <dd className="mt-1 text-[11px] font-bold text-darkText">2–4 working days</dd>
                      </div>
                    </dl>
                    <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <a
                        href="#collection"
                        onClick={resetCheckout}
                        className="liquid-btn px-6 py-3.5 transition-all duration-300 hover:scale-105 hover:bg-[#F09DBB] hover:text-darkText active:scale-95"
                        aria-label="Continue browsing the collection"
                      >
                        Continue browsing
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={resetCheckout}
                        className="liquid-btn liquid-btn-solid px-6 py-3.5 transition-all duration-300 hover:scale-105 active:scale-95"
                        aria-label="Start a new order"
                      >
                        Start a new order
                      </button>
                    </div>
                    <p className="relative mt-4 text-[8px] font-medium uppercase tracking-[0.14em] text-darkText/40">
                      Need help? hello@sabarbysimran.ae
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={placeOrder}
                    noValidate
                    aria-label="Secure checkout"
                    className="relative grid grid-cols-1 gap-8 lg:grid-cols-2"
                  >
                    {/* LEFT — CUSTOMER & PAYMENT */}
                    <div className="flex flex-col gap-7">
                      <fieldset>
                        <legend className="mb-5 flex w-full items-center gap-3 border-b border-darkText/15 pb-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-darkText/20 bg-lightPink/60 text-[9px] font-bold text-darkText">
                            01
                          </span>
                          <span>
                            <span className="block font-serif text-2xl italic leading-none text-darkText">
                              Customer Details
                            </span>
                            <span className="mt-1.5 block text-[8px] font-bold uppercase tracking-[0.16em] text-darkText/45">
                              Where should we deliver your pieces?
                            </span>
                          </span>
                        </legend>

                        <div className="space-y-4">
                          <div>
                            <label
                              htmlFor="checkout-full-name"
                              className="mb-1.5 flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-darkText/65"
                            >
                              Full Name <span className="text-darkText/40">Required</span>
                            </label>
                            <input
                              id="checkout-full-name"
                              name="fullName"
                              type="text"
                              autoComplete="name"
                              placeholder="e.g. Layla Al Mansouri"
                              value={customer.fullName}
                              onChange={(event) => updateCustomerField("fullName", event.target.value)}
                              required
                              aria-required="true"
                              aria-invalid={Boolean(checkoutErrors.fullName)}
                              aria-describedby={checkoutErrors.fullName ? "checkout-full-name-error" : undefined}
                              className={`${CHECKOUT_INPUT_CLASSES(Boolean(checkoutErrors.fullName))} scroll-mt-28`}
                            />
                            {checkoutErrors.fullName && (
                              <p
                                id="checkout-full-name-error"
                                role="alert"
                                className="mt-1.5 text-[10px] font-semibold text-[#B84E4E]"
                              >
                                {checkoutErrors.fullName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="checkout-phone"
                              className="mb-1.5 flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-darkText/65"
                            >
                              Phone Number <span className="text-darkText/40">Required</span>
                            </label>
                            <input
                              id="checkout-phone"
                              name="phone"
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="+971 50 123 4567"
                              value={customer.phone}
                              onChange={(event) => updateCustomerField("phone", event.target.value)}
                              required
                              aria-required="true"
                              aria-invalid={Boolean(checkoutErrors.phone)}
                              aria-describedby={checkoutErrors.phone ? "checkout-phone-error" : undefined}
                              className={`${CHECKOUT_INPUT_CLASSES(Boolean(checkoutErrors.phone))} scroll-mt-28`}
                            />
                            {checkoutErrors.phone && (
                              <p
                                id="checkout-phone-error"
                                role="alert"
                                className="mt-1.5 text-[10px] font-semibold text-[#B84E4E]"
                              >
                                {checkoutErrors.phone}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="checkout-address"
                              className="mb-1.5 flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-darkText/65"
                            >
                              Delivery Address <span className="text-darkText/40">Required</span>
                            </label>
                            <input
                              id="checkout-address"
                              name="address"
                              type="text"
                              autoComplete="street-address"
                              placeholder="Villa / apartment, street, emirate"
                              value={customer.address}
                              onChange={(event) => updateCustomerField("address", event.target.value)}
                              required
                              aria-required="true"
                              aria-invalid={Boolean(checkoutErrors.address)}
                              aria-describedby={checkoutErrors.address ? "checkout-address-error" : undefined}
                              className={`${CHECKOUT_INPUT_CLASSES(Boolean(checkoutErrors.address))} scroll-mt-28`}
                            />
                            {checkoutErrors.address && (
                              <p
                                id="checkout-address-error"
                                role="alert"
                                className="mt-1.5 text-[10px] font-semibold text-[#B84E4E]"
                              >
                                {checkoutErrors.address}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="mt-3 flex items-start gap-1.5 text-[9px] leading-relaxed text-darkText/45">
                          <ShieldIcon className="mt-px h-3 w-3 shrink-0" />
                          Your details are used only to deliver this order. No marketing, ever.
                        </p>
                      </fieldset>

                      <fieldset aria-describedby="payment-help">
                        <legend className="mb-4 flex w-full items-center gap-3 border-b border-darkText/15 pb-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-darkText/20 bg-lightPink/60 text-[9px] font-bold text-darkText">
                            02
                          </span>
                          <span className="flex flex-1 items-center justify-between gap-2">
                            <span className="block font-serif text-2xl italic leading-none text-darkText">
                              Payment Method
                            </span>
                            <span className="flex items-center gap-1 text-[7px] font-bold uppercase tracking-[0.16em] text-darkText/40">
                              <LockIcon className="h-3 w-3" /> Encrypted
                            </span>
                          </span>
                        </legend>

                        <div
                          role="radiogroup"
                          aria-label="Payment method"
                          aria-describedby="payment-help"
                          className="grid grid-cols-2 gap-3"
                        >
                          {PAYMENT_OPTIONS.map((option) => {
                            const isActive = paymentMethod === option.id;
                            return (
                              <button
                                key={option.id}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                aria-label={`Select ${option.label} for checkout`}
                                onClick={() => choosePaymentMethod(option.id)}
                                className={`relative flex w-full cursor-pointer items-center gap-2.5 rounded-xl p-3 text-left transition-all duration-300 hover:scale-[1.02] hover:bg-white/45 sm:p-4 ${
                                  isActive
                                    ? "scale-[1.02] border-2 border-[#E87272] bg-white/60 shadow-[0_0_15px_rgba(232,114,114,0.3)]"
                                    : "border border-white/50 bg-white/30"
                                }`}
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-darkText/10 bg-lightPink/60 text-darkText">
                                  {option.icon}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[11px] font-bold leading-tight text-darkText sm:text-[12px]">
                                    {option.label}
                                  </span>
                                  <span className="mt-1 block text-[8px] font-semibold uppercase leading-tight tracking-[0.08em] text-darkText/50">
                                    {option.detail}
                                  </span>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className={`absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full border transition-all duration-300 ${
                                    isActive
                                      ? "border-[#E87272] bg-[#E87272] text-white opacity-100"
                                      : "border-darkText/15 bg-white/30 text-transparent opacity-60"
                                  }`}
                                >
                                  <CheckIcon className="h-2.5 w-2.5" />
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <p
                          id="payment-help"
                          aria-live="polite"
                          className="mt-3 flex min-h-4 items-center gap-1.5 text-[9px] leading-relaxed text-darkText/50"
                        >
                          <LockIcon className="h-3 w-3 shrink-0" />
                          {selectedPayment
                            ? `${selectedPayment.label} selected — you’ll confirm securely when you place your order.`
                            : "Choose a payment method to continue."}
                        </p>
                        {checkoutErrors.payment && (
                          <p role="alert" className="mt-1 text-[10px] font-semibold text-[#B84E4E]">
                            {checkoutErrors.payment}
                          </p>
                        )}

                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/40 bg-white/25 px-3 py-2.5">
                          <ShieldIcon className="h-4 w-4 shrink-0 text-darkText/60" />
                          <p className="text-[8px] font-semibold uppercase leading-relaxed tracking-[0.1em] text-darkText/50">
                            256-bit encrypted · Card details never stored by Sabar
                          </p>
                        </div>
                      </fieldset>
                    </div>

                    {/* RIGHT — ORDER SUMMARY. The ambient frame floats gently
                        while the interactive card stays still for precise input. */}
                    <div className="relative">
                      <div
                        aria-hidden="true"
                        className="animate-float pointer-events-none absolute -inset-2 rounded-[1.7rem] border border-white/40 bg-white/15 shadow-[0_22px_55px_-30px_rgba(74,59,66,0.5)] will-change-transform motion-reduce:animate-none sm:-inset-3"
                      />
                      <aside
                        aria-labelledby="order-summary-heading"
                        className="relative overflow-hidden rounded-2xl border border-white/50 bg-white/30 p-6 shadow-[0_20px_50px_-25px_rgba(74,59,66,0.45)]"
                      >
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-daisyYellow/50 blur-2xl"
                        />
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-lightPink/50 blur-2xl"
                        />

                        <div className="relative flex items-start justify-between gap-3">
                          <div>
                            <p className="eyebrow flex items-center gap-2 text-[8px] text-darkText/45">
                              <DaisyIcon className="h-3.5 w-3.5" /> Your edit
                            </p>
                            <h3
                              id="order-summary-heading"
                              className="mt-1.5 font-serif text-[1.65rem] italic leading-none text-darkText"
                            >
                              Order Summary
                            </h3>
                          </div>
                          <span className="shrink-0 rounded-full border border-daisyGreen/50 bg-daisyGreen/35 px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.12em] text-darkText/70">
                            {checkoutPieceCount} {checkoutPieceCount === 1 ? "piece" : "pieces"}
                          </span>
                        </div>

                        <ul className="relative mt-5 max-h-[17rem] space-y-3 overflow-y-auto pr-1 no-scrollbar">
                          {checkoutItems.map(({ product, quantity, size, lineKey }) => (
                            <li
                              key={lineKey}
                              className="flex items-center gap-3 rounded-xl border border-white/45 bg-white/25 p-2.5"
                            >
                              <div className="relative h-[68px] w-[54px] shrink-0 overflow-hidden rounded-lg border border-white/60 bg-daisyYellow">
                                <img
                                  src={product.image}
                                  alt={product.imageAlt}
                                  loading="lazy"
                                  decoding="async"
                                  className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
                                />
                                <span className="absolute bottom-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-darkText px-1 text-[7px] font-bold text-daisyYellow">
                                  {quantity}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate font-serif text-[15px] italic leading-tight text-darkText">
                                      {product.name}
                                    </p>
                                    <p className="mt-1 truncate text-[7px] font-semibold uppercase tracking-[0.1em] text-darkText/45">
                                      {product.category} · {product.colour} · Size {size}
                                    </p>
                                  </div>
                                  <p className="shrink-0 text-[11px] font-bold text-darkText">
                                    {formatMoney(product.price * quantity, currency)}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="flex items-center rounded-full border border-darkText/15 bg-white/45">
                                    <button
                                      type="button"
                                      onClick={() => adjustCheckoutQuantity(lineKey, -1)}
                                      disabled={quantity <= 1}
                                      aria-label={`Decrease quantity of ${product.name}, size ${size}`}
                                      className="flex h-6 w-6 items-center justify-center rounded-full text-darkText/60 transition hover:bg-white/70 hover:text-darkText disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                      <MinusIcon className="h-2.5 w-2.5" />
                                    </button>
                                    <span className="min-w-5 text-center text-[10px] font-bold tabular-nums text-darkText">
                                      {quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => adjustCheckoutQuantity(lineKey, 1)}
                                      aria-label={`Increase quantity of ${product.name}, size ${size}`}
                                      className="flex h-6 w-6 items-center justify-center rounded-full text-darkText/60 transition hover:bg-white/70 hover:text-darkText"
                                    >
                                      <PlusIcon className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                  <span className="text-[7px] font-semibold uppercase tracking-[0.1em] text-darkText/35">
                                    {isFeaturedCheckout ? "Featured piece" : "In your edit"}
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>

                        <div className="relative mt-5 space-y-2.5 border-t border-darkText/15 pt-4 text-[11px] text-darkText/70">
                          <div className="flex items-center justify-between gap-3">
                            <span>Subtotal</span>
                            <span className="font-bold text-darkText">
                              {formatMoney(checkoutSubtotalAed, currency)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span>Shipping</span>
                            <span className="flex items-center gap-1 font-semibold text-darkText">
                              <DaisyIcon className="h-3 w-3" /> Complimentary
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span>Taxes</span>
                            <span className="font-semibold text-darkText">Included</span>
                          </div>
                        </div>

                        <div className="relative mt-4 flex items-end justify-between gap-3 border-t border-darkText/20 pt-4">
                          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-darkText/55">
                            Total
                          </span>
                          <div className="text-right">
                            <p
                              className="font-serif text-[1.7rem] font-semibold leading-none text-darkText"
                              aria-live="polite"
                            >
                              {checkoutTotalLabel}
                            </p>
                            <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-darkText/40">
                              VAT included
                            </p>
                          </div>
                        </div>

                        <button
                          type="submit"
                          aria-label={`Place order for ${checkoutTotalLabel}`}
                          className="animate-pulse-glow relative mt-6 w-full rounded-xl bg-[#E87272] py-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-[#d15d5d] active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#E87272] focus:ring-offset-2 focus:ring-offset-white/30"
                        >
                          <span className="flex items-center justify-center gap-2">
                            <LockIcon className="h-4 w-4" />
                            Place Order <span aria-hidden="true">•</span>{" "}
                            <span>{checkoutTotalLabel}</span>
                          </span>
                        </button>

                        <div className="relative mt-3 flex items-center justify-between gap-2 border-t border-darkText/10 pt-3">
                          <span className="flex items-center gap-1 text-[7px] font-bold uppercase tracking-[0.12em] text-darkText/45">
                            <ShieldIcon className="h-3 w-3" /> SSL secured
                          </span>
                          <span className="text-[7px] font-semibold uppercase tracking-[0.1em] text-darkText/40">
                            Apple Pay · Visa · COD
                          </span>
                        </div>

                        <p className="relative mt-3 flex items-center justify-center gap-1.5 text-center text-[8px] font-semibold uppercase tracking-[0.1em] text-darkText/45">
                          <TruckIcon className="h-3.5 w-3.5" /> UAE delivery in 2–4 working days
                        </p>
                      </aside>

                      <div className="relative mt-4 rounded-xl border border-white/40 bg-white/20 px-4 py-3.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-2.5">
                            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-darkText/10 bg-lightPink/55 text-darkText">
                              <FlamingoMark className="h-4.5 w-4.5" />
                            </span>
                            <div className="min-w-0">
                              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-darkText/70">
                                Prefer a personal touch?
                              </p>
                              <p className="mt-1 text-[9px] leading-[1.65] text-darkText/50">
                                Our Dubai stylists can size, gift-wrap and arrange your delivery
                                personally.
                              </p>
                            </div>
                          </div>
                          <a
                            href="mailto:hello@sabarbysimran.ae?subject=Checkout%20assistance"
                            aria-label="Email a Sabar stylist for checkout assistance"
                            className="group/stylist inline-flex shrink-0 items-center gap-1 text-[8px] font-bold uppercase tracking-[0.12em] text-darkText/70 transition hover:text-darkText"
                          >
                            <span className="link-underline">Ask a stylist</span>
                            <ArrowUpRight className="h-3 w-3 transition-all duration-300 group-hover/stylist:-translate-y-0.5 group-hover/stylist:translate-x-0.5" />
                          </a>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-darkText/10 pt-2.5 sm:gap-x-4">
                          <span className="flex items-center gap-1.5 text-[8px] font-semibold text-darkText/45">
                            <MailIcon className="h-3 w-3" /> hello@sabarbysimran.ae
                          </span>
                          <span className="flex items-center gap-1.5 text-[8px] font-semibold text-darkText/45">
                            <WhatsAppIcon className="h-3 w-3" /> +971 4 000 0000
                          </span>
                          <span className="ml-auto flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-darkText/45">
                            <DaisyIcon className="h-3 w-3" /> Gift notes available
                          </span>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                <div className="relative mt-8 flex flex-col gap-4 border-t border-darkText/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {[
                      { icon: TruckIcon, label: "Complimentary delivery" },
                      { icon: ShieldIcon, label: "14-day considered returns" },
                      { icon: LockIcon, label: "Private & protected" },
                    ].map(({ icon: TrustIcon, label }) => (
                      <span
                        key={label}
                        className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-darkText/50"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-daisyGreen/45 text-darkText">
                          <TrustIcon className="h-3.5 w-3.5" />
                        </span>
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-darkText/40">
                    <MapPinIcon className="h-3.5 w-3.5" /> Fulfilled from Dubai, UAE
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="contact" className="relative scroll-mt-24 overflow-hidden bg-mainPink pb-16 pt-14 sm:pb-3 sm:pt-16">
        <DaisyPattern
          id="footer-daisies"
          opacity={0.13}
          petal="#FBF8CE"
          center="#F4C3D1"
          stem="#4A3B42"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <span className="absolute -bottom-16 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-serif text-[38vw] italic leading-none text-darkText/[0.06] lg:text-[24rem]">
            Sabar
          </span>
          <DaisyBloom
            className="animate-spin-slow absolute -right-10 top-12 h-40 w-40 rotate-12 text-darkText/15"
            petal="#F4C3D1"
            center="#FBF8CE"
          />
          <DaisyIcon className="animate-float absolute bottom-32 left-[12%] hidden h-8 w-8 rotate-12 text-darkText/20 lg:block" />
          <DaisyIcon className="animate-float absolute right-[24%] top-24 hidden h-5 w-5 -rotate-12 text-darkText/20 sm:block [animation-delay:2.4s]" />
        </div>

        <Reveal className="relative mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10" threshold={0.05}>
          <div className="grid gap-10 border-t border-darkText/20 pb-12 pt-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.75fr_0.75fr] lg:gap-12">
            <div>
              <Wordmark size="md" href="#home" ariaLabel="Sabar by Simran — back to top" />
              <p className="mt-5 max-w-[29ch] text-[12px] font-normal leading-[1.8] text-darkText/70">
                Quietly luxurious pieces for the woman writing her own story. Designed and hand-finished
                in Dubai, under the Daisy Dreams sky.
              </p>
              <div className="mt-5 space-y-2">
                <a
                  href="mailto:hello@sabarbysimran.ae"
                  aria-label="Email the Sabar atelier"
                  className="flex items-center gap-2 text-[11px] font-medium text-darkText/65 transition hover:text-darkText"
                >
                  <MailIcon className="h-3.5 w-3.5" /> hello@sabarbysimran.ae
                </a>
                <p className="flex items-center gap-2 text-[11px] font-medium text-darkText/65">
                  <MapPinIcon className="h-3.5 w-3.5" /> Dubai Design District, UAE
                </p>
              </div>
              <ul className="mt-5 flex items-center gap-2" aria-label="Social media">
                {SOCIALS.map(({ label, href, icon: SocialIcon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Sabar by Simran on ${label}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-darkText/15 bg-lightPink/30 text-darkText/65 transition hover:border-darkText/35 hover:bg-daisyYellow hover:text-darkText"
                    >
                      <SocialIcon className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-[8px] font-bold uppercase tracking-[0.22em] text-darkText/50">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="link-underline text-[11px] font-medium text-darkText/65 transition-colors duration-300 hover:text-darkText"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-darkText/20 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-darkText/55">
              © 2026 Sabar by Simran. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.14em] text-darkText/50">
              <span className="flex items-center gap-1.5">
                <FlamingoMark className="h-4 w-4" /> Dubai, UAE
              </span>
              <span aria-hidden="true">·</span>
              <span>Prices in {currency}</span>
              <span aria-hidden="true">·</span>
              <a
                href="#home"
                aria-label="Back to top"
                className="inline-flex items-center gap-1 text-darkText/60 transition hover:text-darkText"
              >
                Back to top <ArrowUpRight className="h-3 w-3 -rotate-45" />
              </a>
            </div>
          </div>
        </Reveal>
      </footer>

      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-5">
          <button
            type="button"
            aria-label="Close product details"
            onClick={closeProduct}
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-default bg-black/40 backdrop-blur-md"
          />

          <section
            ref={productModalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            aria-describedby="product-modal-description"
            className="animate-sheet-in relative z-10 max-h-[92dvh] w-full overflow-y-auto overscroll-contain rounded-t-[2rem] border border-white/60 bg-basePink/95 pb-[env(safe-area-inset-bottom)] shadow-[0_35px_100px_-30px_rgba(44,28,35,0.65)] backdrop-blur-2xl sm:max-w-[940px] sm:rounded-[2rem] sm:pb-0"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 top-1/3 h-56 w-56 rounded-full bg-daisyYellow/45 blur-3xl"
            />

            <button
              ref={productModalCloseRef}
              type="button"
              onClick={closeProduct}
              aria-label="Close product details"
              className="absolute right-3 top-3 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-basePink/75 text-darkText shadow-liquid backdrop-blur-md transition-all duration-300 hover:rotate-90 hover:bg-daisyYellow focus:outline-none focus:ring-2 focus:ring-[#E87272] sm:right-4 sm:top-4"
            >
              <CloseIcon className="h-4 w-4" />
            </button>

            <div className="mx-auto flex max-w-full items-center justify-center pt-2 sm:hidden" aria-hidden="true">
              <span className="h-1 w-10 rounded-full bg-darkText/25" />
            </div>

            <div className="grid md:grid-cols-[0.92fr_1.08fr]">
              {/* Product image */}
              <div className="relative mt-2 h-[38vh] min-h-[250px] overflow-hidden rounded-t-[1.5rem] bg-daisyYellow sm:mt-0 sm:h-auto sm:min-h-[560px] sm:rounded-l-[2rem] sm:rounded-tr-none md:rounded-r-none">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.imageAlt}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-darkText/55 via-darkText/5 to-transparent"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-mainPink/10 mix-blend-multiply"
                />

                <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                  <span className="liquid-glass-light rounded-full px-3 py-1.5 text-[7px] font-bold uppercase tracking-[0.16em] text-darkText/75">
                    {selectedProduct.category}
                  </span>
                  {selectedProduct.badge && (
                    <span className="rounded-full bg-daisyGreen px-3 py-1.5 text-[7px] font-bold uppercase tracking-[0.16em] text-darkText">
                      {selectedProduct.badge}
                    </span>
                  )}
                </div>

                <div className="liquid-glass-light absolute inset-x-4 bottom-4 rounded-[1.1rem] px-4 py-3">
                  <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-darkText/50">
                    Sabar by Simran · SS26
                  </p>
                  <p className="mt-1 font-serif text-base italic leading-tight text-darkText">
                    Cut, draped and finished in Dubai.
                  </p>
                </div>
              </div>

              {/* Product detail */}
              <div className="relative flex flex-col p-5 pb-6 pt-4 sm:p-8 sm:pt-10">
                <div className="flex items-center justify-between gap-3 pr-12">
                  <p className="eyebrow text-[8px] text-darkText/50">
                    {selectedProduct.category} <span className="mx-1 text-darkText/25">·</span>{" "}
                    {selectedProduct.colour}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleSaved(selectedProduct)}
                    aria-pressed={saved.has(selectedProduct.id)}
                    aria-label={
                      saved.has(selectedProduct.id)
                        ? `Remove ${selectedProduct.name} from your wishlist`
                        : `Save ${selectedProduct.name} to your wishlist`
                    }
                    className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/35 text-darkText/65 transition-all duration-300 hover:scale-110 hover:bg-daisyYellow hover:text-darkText sm:flex"
                  >
                    <HeartIcon filled={saved.has(selectedProduct.id)} className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h2
                  id="product-modal-title"
                  className="editorial-heading mt-3 pr-10 text-[clamp(2rem,4.5vw,3rem)] leading-[1.02] text-darkText sm:pr-12"
                >
                  {selectedProduct.name}
                </h2>

                <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <p className="text-lg font-bold tracking-[0.02em] text-darkText">
                    {formatMoney(selectedProduct.price, currency)}
                  </p>
                  <span className="text-[8px] font-semibold uppercase tracking-[0.12em] text-darkText/40">
                    VAT included · Limited run
                  </span>
                </div>

                <p
                  id="product-modal-description"
                  className="mt-4 max-w-prose text-[12px] font-normal leading-[1.8] text-darkText/65"
                >
                  {selectedProduct.description}
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-darkText/10 py-3">
                  <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-darkText/55">
                    <span className="h-2 w-2 rounded-full bg-lightPink ring-1 ring-darkText/20" />
                    {selectedProduct.colour}
                  </span>
                  <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-darkText/55">
                    <DaisyIcon className="h-3 w-3" /> Hand-finished
                  </span>
                  <span className="flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.1em] text-darkText/55">
                    <MapPinIcon className="h-3 w-3" /> Made in the UAE
                  </span>
                </div>

                <div className="mt-5">
                  <div className="flex items-center justify-between gap-3">
                    <p
                      id="product-size-label"
                      className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-darkText/70"
                    >
                      Select your size
                      {selectedSize && (
                        <span className="rounded-full bg-daisyGreen/60 px-2 py-0.5 text-[7px] tracking-[0.1em] text-darkText">
                          {selectedSize}
                        </span>
                      )}
                    </p>
                    <span className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-darkText/40">
                      <RulerIcon className="h-3.5 w-3.5" /> True to size
                    </span>
                  </div>

                  <div
                    role="radiogroup"
                    aria-labelledby="product-size-label"
                    className="mt-2.5 grid grid-cols-4 gap-2"
                  >
                    {selectedProduct.sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          aria-label={`Size ${size}`}
                          onClick={() => setSelectedSize(size)}
                          className={`rounded-xl border py-3 text-[11px] font-bold transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#E87272] focus:ring-offset-2 focus:ring-offset-basePink ${
                            isSelected
                              ? "border-[#E87272] bg-[#E87272] text-white shadow-[0_8px_22px_-10px_rgba(232,114,114,0.85)]"
                              : "border-white/60 bg-white/35 text-darkText/65 hover:border-[#E87272]/45 hover:text-darkText"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-2 min-h-4 text-[9px] text-darkText/45" aria-live="polite">
                    {selectedSize
                      ? `Size ${selectedSize} selected — ready for your edit.`
                      : "Choose a size to add this piece to your cart."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!selectedProduct || !selectedSize) return;
                    addToCart(selectedProduct, selectedSize);
                    closeProduct();
                  }}
                  disabled={!selectedSize}
                  aria-label={
                    selectedSize
                      ? `Add ${selectedProduct.name}, size ${selectedSize}, to cart for ${formatMoney(
                          selectedProduct.price,
                          currency
                        )}`
                      : `Select a size before adding ${selectedProduct.name} to cart`
                  }
                  className={`mt-3 w-full rounded-xl py-4 text-[10px] font-bold uppercase tracking-[0.14em] transition-all duration-300 ${
                    selectedSize
                      ? "animate-pulse-glow bg-[#E87272] text-white shadow-lg hover:scale-[1.02] hover:bg-[#d15d5d] active:scale-95" 
                      : "cursor-not-allowed border border-darkText/15 bg-darkText/10 text-darkText/55"
                  }`}
                >
                  {selectedSize ? (
                    <span className="flex items-center justify-center gap-2">
                      <BagIcon className="h-4 w-4" />
                      Add to Cart <span aria-hidden="true">•</span>{" "}
                      {formatMoney(selectedProduct.price, currency)}
                    </span>
                  ) : (
                    "Select a Size"
                  )}
                </button>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[8px] font-semibold uppercase tracking-[0.1em] text-darkText/45">
                  <span className="flex items-center gap-1.5">
                    <TruckIcon className="h-3.5 w-3.5" /> Complimentary UAE delivery
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldIcon className="h-3.5 w-3.5" /> 14-day returns
                  </span>
                </div>

                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[8px] text-darkText/40">
                  <LockIcon className="h-3 w-3" /> Secure checkout · Pay with Apple Pay, card or COD
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      <CartDrawer
        open={cartOpen}
        onClose={closeCart}
        items={cartItems}
        currency={currency}
        onQuantityChange={changeQuantity}
        onRemove={removeFromCart}
        onCheckout={proceedToCheckout}
      />

      {/* FLOATING WHATSAPP CONCIERGE */}
      {navReady && !cartOpen && !selectedProduct && (
        <a
          href="https://wa.me/971XXXXXXXXX"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Sabar by Simran on WhatsApp"
          className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
        >
          <span className="pointer-events-none absolute right-full mr-3 flex translate-x-2 items-center gap-1.5 whitespace-nowrap rounded-full border border-white/60 bg-white/35 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.13em] text-darkText opacity-0 shadow-liquid backdrop-blur-xl transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
            <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" aria-hidden="true" />
            Chat with us
          </span>

          <span className="relative flex h-14 w-14 animate-bounce items-center justify-center rounded-full border border-white/50 bg-[#25D366]/85 text-white shadow-[0_14px_38px_-10px_rgba(37,211,102,0.8)] backdrop-blur-xl transition-all duration-300 [animation-duration:3s] group-hover:scale-105 group-hover:animate-none group-hover:bg-[#25D366] group-focus-visible:scale-105 group-focus-visible:animate-none group-active:scale-95 motion-reduce:animate-none">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-[#25D366]/35 [animation-duration:3s] group-hover:animate-none motion-reduce:animate-none"
            />
            <WhatsAppLogo className="relative h-7 w-7" />
          </span>
        </a>
      )}

      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className="animate-toast-in fixed bottom-[5.75rem] left-1/2 z-[80] flex w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 items-center gap-3 rounded-[1.35rem] border border-white/50 bg-basePink/95 px-4 py-3 shadow-[0_18px_50px_-18px_rgba(74,59,66,0.5)] backdrop-blur-xl sm:bottom-6 sm:left-auto sm:right-24 sm:w-auto sm:translate-x-0"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-daisyGreen/70 text-darkText">
            <SparkleIcon className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-[10px] font-medium leading-snug text-darkText/75">
            {toast.message}
          </p>
          {toast.action === "bag" && (
            <button
              type="button"
              onClick={() => {
                setToast(null);
                setCartOpen(true);
              }}
              aria-label="View your shopping bag"
              className="shrink-0 text-[8px] font-bold uppercase tracking-[0.14em] text-darkText transition hover:text-darkText/60"
            >
              View edit
            </button>
          )}
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="shrink-0 text-darkText/35 transition hover:text-darkText/75"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <span className="sr-only" aria-live="polite">
        {cartCount > 0
          ? `${cartCount} item${cartCount === 1 ? "" : "s"} in your edit, subtotal ${formatMoney(
              cartSubtotalAed,
              currency
            )}.`
          : "Your shopping bag is empty."}
      </span>
    </div>
  );
}
