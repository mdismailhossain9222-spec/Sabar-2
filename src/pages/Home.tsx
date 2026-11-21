import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PolicyModal } from "@/components/PolicyModal";
import { Link, useNavigate } from "react-router-dom";
import { Reveal } from "@/components/Reveal";
import { SplitText } from "@/components/SplitText";
import { FlamingoMark, Wordmark } from "@/components/Brand";
import {
  AppleGlyph,
  ArrowUpRight,
  BagIcon,
  CheckIcon,
  ChevronDown,
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
  getProducts,
  type CurrencyCode,
  type Product,
} from "@/data/shop";
import { useCart } from "@/contexts/CartContext";

const NAV_LINKS = [
  { label: "The Premiere", href: "#collection" },
  { label: "Contact", href: "#contact" },
];

const MARQUEE_NOTES = [
  "Daisy Dreams — The SS26 Edit",
  "Hand-finished in Dubai",
  "Complimentary delivery across the UAE",
  "Limited runs, considered pieces",
  "Sabr by Simran",
];

const PRESS = ["Vogue Arabia", "Harper's Bazaar", "MOJEH", "Emirates Woman"];

const PRODUCT_MATS = ["bg-[#FAF5EF]", "bg-[#FAF5EF]", "bg-[#FAF5EF]", "bg-[#FAF5EF]"];

const FOOTER_COLUMNS = [
  {
    title: "Customer Care",
    links: [
      { label: "Contact the atelier", href: "mailto:hello@sabarbysimran.ae" },
      {
        label: "Book a private fitting",
        href: "mailto:hello@sabarbysimran.ae?subject=Private%20fitting",
      },
      { label: "Care guide", href: "#collection" },
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
  {
    title: "Contact Us",
    links: [
      { label: "Return & Exchange Policy", href: "#", policy: "return" },
      { label: "Shipping Policy", href: "#", policy: "shipping" },
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
  const {
    cartItems,
    currency,
    setCurrency,
    addToCart,
    removeFromCart,
    changeQuantity,
    cartCount,
    cartSubtotalAed,
    clearCart,
  } = useCart();

  const [preloaderVisible, setPreloaderVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [saved, setSaved] = useState<Set<string>>(() => new Set());
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [returnPolicyOpen, setReturnPolicyOpen] = useState(false);
  const [shippingPolicyOpen, setShippingPolicyOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const productModalCloseRef = useRef<HTMLButtonElement>(null);
  const productModalRef = useRef<HTMLElement>(null);

  const navReady = !preloaderVisible;

  // ──────────────────────────────────────────────────────────────
  // Fetch products from Supabase on mount (falls back to static if unavailable)
  // ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    getProducts().then((fetched) => {
      if (!cancelled && fetched.length > 0) {
        setProducts(fetched);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const notify = useCallback((message: string, action?: "bag") => {
    setToast({ id: Date.now(), message, action });
  }, []);

  const closeCart = useCallback(() => setCartOpen(false), []);

  const openReturnPolicy = useCallback(() => setReturnPolicyOpen(true), []);
  const openShippingPolicy = useCallback(() => setShippingPolicyOpen(true), []);

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
    if (!cartOpen && !menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [cartOpen, menuOpen]);

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

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((product) => product.category)))],
    [products]
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
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

  const navigate = useNavigate();

  const openProduct = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  const proceedToCheckout = () => {
    setCartOpen(false);
    setToast(null);
    navigate("/checkout");
  };

  return (
    <div id="home" className="relative min-h-screen overflow-x-hidden bg-[#4A0E17] text-[#FAF5EF]">
      <a
        href="#main-content"
        className="sr-only z-[130] rounded-full bg-[#FAF5EF] px-5 py-3 text-xs font-bold text-[#FAF5EF] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {/* PRELOADER — replace the blank <video /> below with your intro film. */}
      <div
        role="status"
        aria-live="polite"
        aria-hidden={!preloaderVisible}
        aria-label="Welcome to Sabr by Simran"
        className={`fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden bg-[#4A0E17] transition-opacity duration-500 ease-out ${
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
        <div className="relative z-10 flex flex-col items-center text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#4A0E17]/20 bg-[#FAF5EF]/10 text-[#FAF5EF] shadow-liquid">
            <FlamingoMark className="h-11 w-11" />
          </span>
          <p className="mt-5 font-serif text-5xl italic tracking-[-0.05em] text-[#FAF5EF]">Sabr</p>
          <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.5em] text-[#FAF5EF]/60">
            By Simran
          </p>
          <span className="mt-8 flex h-1.5 w-32 overflow-hidden rounded-full bg-[#4A0E17]/15">
            <span className="block h-full w-1/2 animate-pulse rounded-full bg-[#4A0E17]" />
          </span>
          <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.3em] text-[#FAF5EF]/50">
            A new era of elegance
          </p>
        </div>
        <p className="absolute bottom-7 left-0 right-0 text-center text-[8px] font-semibold uppercase tracking-[0.34em] text-[#FAF5EF]/45">
          Dubai · United Arab Emirates
        </p>
      </div>

      {/* FLOATING NAVBAR */}
      <header
        className={`fixed inset-x-0 z-50 px-3 transition-colors duration-500 sm:px-5 ${
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
            <Wordmark size="sm" ariaLabel="Sabr by Simran — return to top" />
          </span>
          <span
            style={navReady ? { animationDelay: "80ms" } : undefined}
            className={`hidden shrink-0 md:block ${navReady ? "animate-fade-down" : "opacity-0"}`}
          >
            <Wordmark size="md" ariaLabel="Sabr by Simran — return to top" />
          </span>

          <div className="hidden flex-1 items-center justify-center gap-8 md:flex lg:gap-11">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={navReady ? { animationDelay: `${140 + NAV_LINKS.indexOf(link) * 90}ms` } : undefined}
                className={`link-underline eyebrow flex items-center gap-2 text-[9px] text-[#FAF5EF]/75 transition-colors duration-300 hover:text-[#FAF5EF] ${
                  navReady ? "animate-fade-down" : "opacity-0"
                }`}
              >
                <span className="h-1 w-1 rounded-full bg-[#4A0E17]/50" aria-hidden="true" />
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
            <div className="relative flex items-center gap-1 rounded-full border border-[#4A0E17]/30 bg-[#FAF5EF]/10 px-2 py-1.5 text-[#FAF5EF] transition hover:border-[#4A0E17]/50 hover:bg-[#FAF5EF]/10 sm:gap-1.5 sm:px-2.5">
              <GlobeIcon className="hidden h-3.5 w-3.5 text-[#FAF5EF]/50 sm:block" />
              <label htmlFor="currency-select" className="sr-only">
                Select currency
              </label>
              <select
                id="currency-select"
                value={currency}
                onChange={(event) => handleCurrency(event.target.value as CurrencyCode)}
                aria-label="Select currency"
                className="w-[42px] cursor-pointer appearance-none bg-transparent pr-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#FAF5EF]/75 outline-none sm:w-[46px] sm:text-[10px]"
              >
                {Object.values(CURRENCIES).map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none h-3 w-3 text-[#FAF5EF]/50"
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
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#4A0E17]/30 bg-[#FAF5EF]/10 text-[#FAF5EF]/75 transition hover:border-[#4A0E17]/50 hover:bg-[#FAF5EF]/10 hover:text-[#FAF5EF] sm:h-10 sm:w-10"
            >
              <BagIcon className="h-4 w-4" />
              {cartCount > 0 && (
                <span
                  key={cartCount}
                  className="animate-cart-pop absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E87272] px-1 text-[8px] font-bold leading-none text-[#FAF5EF] shadow-[0_0_0_2px_rgba(252,228,236,0.9)]"
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
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4A0E17]/30 bg-[#FAF5EF]/10 text-[#FAF5EF]/75 transition hover:border-[#4A0E17]/50 hover:bg-[#FAF5EF]/10 hover:text-[#FAF5EF] md:hidden"
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
              className="fixed inset-0 z-40 h-full w-full cursor-default bg-[#4A0E17]/15 backdrop-blur-[2px]"
            />
            <div
              id="mobile-menu"
              className="animate-menu-in fixed inset-x-3 top-[4.85rem] z-50 overflow-hidden rounded-[1.75rem] border border-[#4A0E17]/30 bg-[#4A0E17]/95 p-5 shadow-[0_24px_70px_-24px_rgba(74,59,66,0.5)] backdrop-blur-2xl"
            >
              <div className="flex items-center justify-between border-b border-[#4A0E17]/20 pb-3">
                <p className="eyebrow flex items-center gap-2 text-[#FAF5EF]/55">
                  <DaisyIcon className="h-3.5 w-3.5" /> The house of Sabar
                </p>
                <span className="text-[8px] font-semibold uppercase tracking-[0.22em] text-[#FAF5EF]/40">
                  Dubai · SS26
                </span>
              </div>
              <nav aria-label="Mobile navigation" className="mt-1">
                {NAV_LINKS.map((link) => {
                const linkIndex = NAV_LINKS.indexOf(link);
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-label={`${link.label} section`}
                    style={{ animationDelay: `${90 + linkIndex * 80}ms` }}
                    className="group flex animate-fade-down items-center justify-between border-b border-[#4A0E17]/10 py-3.5"
                  >
                    <span className="flex items-baseline gap-3">
                      <span
                        aria-hidden="true"
                        className="text-[8px] font-bold tracking-[0.18em] text-[#FAF5EF]/45"
                      >
                        0{linkIndex + 1}
                      </span>
                      <span className="font-serif text-2xl italic text-[#FAF5EF]">{link.label}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-[#FAF5EF]/40 transition group-hover:text-[#FAF5EF]" />
                  </a>
                );
              })}
              </nav>
              <a
                href="#collection"
                onClick={() => setMenuOpen(false)}
                className="liquid-btn-wrapper mt-4 w-full py-3.5 transition-transform duration-300 hover:scale-105 hover:bg-[#F09DBB] hover:text-[#FAF5EF] active:scale-95"
                aria-label="Explore the SS26 collection"
              >
                Explore the collection <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#FAF5EF]/45">
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
          className="relative flex min-h-[90vh] w-full items-center justify-center overflow-hidden bg-[#4A0E17]"
        >
          <video
            className="absolute inset-0 z-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata" src="/2.mp4"
            aria-hidden="true"
          />
          <div className="absolute inset-0 z-10 bg-black/30" aria-hidden="true" />

          {/* Editorial framing marks */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-5 top-20 z-20 flex items-center justify-between gap-4 border-t border-[#4A0E17]/20 pt-3 sm:inset-x-8 sm:top-24 lg:inset-x-12"
          >
            <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-[#FAF5EF]/75 sm:text-[8px]">
              Sabr by Simran
            </p>
            <p className="hidden text-[7px] font-bold uppercase tracking-[0.3em] text-[#FAF5EF]/65 sm:block sm:text-[8px]">
              The Desert Bloom · SS26
            </p>
            <p className="text-[7px] font-bold uppercase tracking-[0.3em] text-[#FAF5EF]/75 sm:text-[8px]">
              Dubai · UAE
            </p>
          </div>

          <div className="relative z-20 mx-auto flex w-full max-w-[1120px] flex-col items-center px-6 pb-24 pt-40 text-center sm:pb-28 sm:pt-44">
            <Reveal delay={0} variant="fade" start={navReady}>
              <span className="liquid-glass-light inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[8px] font-bold uppercase tracking-[0.22em] text-[#FAF5EF]/90">
                <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4A0E17] opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#4A0E17]" />
                </span>
                SS26 — Daisy Dreams
                <span className="h-2.5 w-px bg-[#4A0E17]/35" aria-hidden="true" />
                <span className="font-medium tracking-[0.18em] text-[#FAF5EF]/65">Campaign Film</span>
              </span>
            </Reveal>

            <Reveal delay={100} variant="fade" start={navReady} className="mt-7 w-full sm:mt-8">
              <h1
                id="hero-heading"
                aria-label="Built with Sabr, worn with confidence"
                className="editorial-heading flex flex-col items-center justify-center text-center gap-y-5 text-[#FAF5EF] drop-shadow-[0_4px_26px_rgba(74,14,23,0.15)]"
              >
                <span aria-hidden="true" className="whitespace-nowrap">
                  <SplitText text="Built with" delay={160} stagger={90} className="text-[clamp(1.2rem,3vw,2.5rem)] italic font-serif text-[#FAF5EF]" />
                </span>
                <span aria-hidden="true" className="whitespace-nowrap">
                  <SplitText
                    text="Sabr"
                    accent=""
                    accentClassName="text-[#FAF5EF]"
                    delay={280}
                    stagger={90}
                    className="text-[clamp(4rem,12vw,10rem)] font-serif tracking-tight"
                  />
                </span>
                <span aria-hidden="true" className="whitespace-nowrap">
                  <SplitText
                    text="WORN WITH CONFIDENCE"
                    delay={400}
                    stagger={90}
                    className="text-[clamp(0.7rem,1.5vw,1.2rem)] font-medium uppercase tracking-[0.35em] text-[#FAF5EF] font-sans"
                  />
                </span>
              </h1>
            </Reveal>

            <Reveal delay={260} variant="fade" start={navReady}>
              <p className="mx-auto mt-8 max-w-[32rem] text-[13px] font-normal leading-[1.9] text-[#FAF5EF] sm:mt-10 sm:text-[15px]">
                Premium clothing crafted for the modern UAE lifestyle.
              </p>
              <p className="mt-4 text-[8px] font-bold uppercase tracking-[0.28em] text-[#FAF5EF] sm:text-[9px]">
                Hand-finished in Dubai · Made in small numbers
              </p>
            </Reveal>

            <Reveal delay={380} variant="fade" start={navReady}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:mt-12 sm:flex-row sm:gap-6">
                <a
                  href="#collection"
                  aria-label="Explore the Sabr by Simran SS26 collection"
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-full border-2 border-[#FAF5EF] px-8 py-4 text-[9px] font-bold uppercase tracking-[0.18em] text-[#FAF5EF] transition-all duration-300 hover:scale-105 hover:bg-[#FAF5EF] hover:text-[#4A0E17] hover:border-[#FAF5EF] active:scale-95 sm:w-auto"
                >
                  EXPLORE COLLECTION
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
                <a
                  href="#collection"
                  aria-label="Explore the Sabr by Simran Premiere collection"
                  className="liquid-btn-wrapper group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-[9px] font-bold uppercase tracking-[0.18em] text-[#FAF5EF] transition-transform duration-300 hover:scale-105 active:scale-95 sm:w-auto"
                >
                  <span className="link-underline">The Premiere</span>
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
              <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[#4A0E17]/20 pt-5 sm:mt-11">
                {[
                  { icon: LeafIcon, text: "Considered, small-batch craft" },
                ].map(({ icon: FeatureIcon, text }) => (
                  <p
                    key={text}
                    className="flex items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#FAF5EF]/70 sm:text-[9px]"
                  >
                    <FeatureIcon className="h-3.5 w-3.5 text-[#FAF5EF]/80" />
                    {text}
                  </p>
                ))}
              </div>
            </Reveal>
          </div>

          <a
            href="#collection"
            aria-label="Scroll down to discover the collection"
            className="group absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-[7px] font-bold uppercase tracking-[0.26em] text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF] sm:bottom-8 sm:text-[8px]"
          >
            Scroll to discover
            <span className="flex h-8 w-px justify-center overflow-hidden bg-[#FAF5EF]/10">
              <span className="block h-1/2 w-full animate-float bg-[#FAF5EF]/10" />
            </span>
          </a>
        </section>

        {/* RUNNING EDITORIAL NOTES */}
        <section
          aria-label="Brand notes"
          className="relative overflow-hidden border-y border-[#FAF5EF]/15 bg-[#4A0E17] py-3.5"
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
                    <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#FAF5EF]/65 sm:text-[10px]">
                      {note}
                    </span>
                    <DaisyIcon className="h-3.5 w-3.5 text-[#FAF5EF]/70" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* PRESS */}
        <section aria-label="Selected press" className="border-b border-[#4A0E17]/10 bg-[#4A0E17] py-6">
          <Reveal
            variant="fade"
            className="mx-auto flex max-w-[1240px] flex-col items-center justify-between gap-4 px-5 sm:flex-row sm:px-8 lg:px-10"
          >
            <p className="eyebrow flex items-center gap-2.5 text-[8px] text-[#FAF5EF]/45">
              <span className="hairline" aria-hidden="true" /> As seen in
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5 sm:gap-x-10">
              {PRESS.map((publication) => (
                <span
                  key={publication}
                  className="press-logo inline-block text-[10px] text-[#FAF5EF]/50 transition-transform duration-300 hover:-translate-y-0.5 hover:text-[#FAF5EF] sm:text-[11px]"
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
          className="relative scroll-mt-[140px] overflow-hidden bg-[#4A0E17] py-20 sm:py-24 lg:py-28"
        >
          <div className="relative mx-auto max-w-[1340px] px-5 sm:px-8 lg:px-10">
            <Reveal variant="fade" className="flex flex-col items-center text-center" threshold={0.25}>
              <p className="eyebrow flex items-center gap-3 text-[8px] text-[#FAF5EF]/50">
                <span className="hairline text-[#FAF5EF]" aria-hidden="true" /> The SS26 Edit
                <span className="hairline text-[#FAF5EF]" aria-hidden="true" />
              </p>
              <SplitText
                as="h2"
                id="collection-heading"
                text="The Premiere"
                delay={80}
                stagger={110}
                className="editorial-heading mt-5 text-[clamp(3rem,6.4vw,5.5rem)] leading-[0.95] text-[#FAF5EF]"
              />
              <Reveal delay={200} variant="fade">
                <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#FAF5EF]/20 bg-[#FAF5EF]/10 px-3.5 py-1.5 text-[7px] font-medium tracking-[0.14em] text-[#FAF5EF]/70">
                  <span className="h-1 w-1 rounded-full bg-[#E87272]" aria-hidden="true" />
                  a quieter kind of luxury.
                </span>
              </Reveal>
            </Reveal>

            <Reveal delay={140} variant="fade" className="mt-10">
              <div className="liquid-glass-light rounded-[1.6rem] p-2.5 shadow-[0_18px_45px_-30px_rgba(74,14,23,0.3)]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex flex-1 items-center gap-3 rounded-full border border-[#4A0E17]/30 bg-[#FAF5EF]/10 px-4 py-3 transition-colors duration-300 focus-within:border-[#E87272]/60 focus-within:bg-[#FAF5EF]/10 focus-within:shadow-[0_0_0_4px_rgba(232,114,114,0.1)] sm:px-5 sm:py-3.5">
                    <SearchIcon className="h-4 w-4 shrink-0 text-[#FAF5EF]/60" />
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
                      className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#FAF5EF] outline-none placeholder:text-[#FAF5EF]/45 [&::-webkit-search-cancel-button]:hidden"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear collection search"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4A0E17]/10 text-[#FAF5EF]/55 transition-colors duration-300 hover:bg-[#4A0E17] hover:text-[#FAF5EF]"
                      >
                        <CloseIcon className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 px-3 sm:px-2">
                    <p
                      className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#FAF5EF]/50"
                      aria-live="polite"
                    >
                      {filteredProducts.length}{" "}
                      {filteredProducts.length === 1 ? "piece" : "pieces"}
                      {hasActiveFilters ? " found" : " available"}
                    </p>
                    <span className="hidden h-7 w-px bg-[#4A0E17]/15 sm:block" aria-hidden="true" />
                    <span className="hidden text-[8px] font-bold uppercase tracking-[0.15em] text-[#FAF5EF]/40 sm:block">
                      SS26
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>

            {filteredProducts.length > 0 ? (
              <div className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 sm:grid-cols-2 sm:gap-8 xl:grid-cols-4">
                {filteredProducts.map((product) => {
                  const productIndex = filteredProducts.indexOf(product);
                  const isSaved = saved.has(product.id);
                  const price = formatMoney(product.price, currency);
                  return (
                    <Reveal key={product.id} delay={productIndex * 90} className="h-full">
                      <article className="group flex h-full flex-col rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(232,114,114,0.2)]">
                        <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
                          <img
                            src={product.image}
                            alt={product.imageAlt}
                            loading={productIndex < 4 ? "eager" : "lazy"}
                            fetchPriority={productIndex < 4 ? "high" : "auto"}
                            decoding="async"
                            width={product.imageWidth}
                            height={product.imageHeight}
                            className="h-full w-full object-cover group-hover:scale-[1.055]"
                          />
                          <div
                            aria-hidden="true"
                            className="absolute inset-0 bg-linear-to-t from-darkText/35 via-transparent to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-100"
                          />

                          <span className="liquid-glass-light absolute left-3 top-3 z-10 rounded-full px-2.5 py-1.5 text-[7px] font-bold uppercase tracking-[0.16em] text-[#FAF5EF]/75">
                            Nº {String(productIndex + 1).padStart(2, "0")}
                          </span>
                          {product.microcopy && (
                            <span className="absolute left-3 top-[calc(1.5rem+1.5rem)] z-10 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-[#FAF5EF]/25 bg-[#4A0E17]/70 px-2.5 py-1 text-[6px] font-medium tracking-[0.12em] text-[#FAF5EF]/85 backdrop-blur-md">
                              {product.microcopy}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleSaved(product)}
                            aria-pressed={isSaved}
                            aria-label={
                              isSaved
                                ? `Remove ${product.name} from your wishlist`
                                : `Save ${product.name} to your wishlist`
                            }
                            className={`absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-transform duration-300 hover:scale-110 ${
                              isSaved
                                ? "border-darkText bg-darkText text-daisyYellow"
                                : "border-[#4A0E17]/30 bg-[#FAF5EF]/10 text-[#FAF5EF]/65 hover:bg-[#FAF5EF] hover:text-[#FAF5EF]"
                            }`}
                          >
                            <HeartIcon filled={isSaved} className="h-3.5 w-3.5" />
                          </button>

                          {product.badge && (
                            <span className="absolute bottom-3 left-3 z-10 rounded-full bg-[#9EB79B] px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.16em] text-[#FAF5EF] shadow-sm">
                              {product.badge}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => openProduct(product)}
                            aria-label={`Open ${product.name} to choose a size and order`}
                            className="liquid-glass-light absolute bottom-3 right-3 z-10 flex translate-y-2 items-center gap-1 rounded-full px-2.5 py-1.5 text-[7px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF]/80 opacity-0 transition-colors duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus:opacity-100 focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-[#E87272]"
                          >
                            View <ArrowUpRight className="h-2.5 w-2.5" />
                          </button>
                        </div>

                        <div className="flex flex-1 flex-col px-2 pb-1 pt-4">
                          <div className="flex items-center justify-between gap-2">
                            <p className="eyebrow text-[7px] text-[#FAF5EF]/50">{product.category}</p>
                            <span className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#FAF5EF]/45">
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-[#FAF5EF]/10 ring-1 ring-darkText/20"
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
                            className="mt-2 font-serif text-[1.35rem] italic leading-tight text-[#FAF5EF] sm:text-[1.45rem]"
                          />
                          <div className="mt-1.5 flex items-center justify-between gap-2">
                            <p
                              key={`${product.id}-${currency}`}
                              className="animate-fade-in text-[12px] font-bold tracking-[0.02em] text-[#FAF5EF]/80"
                            >
                              {price}
                            </p>
                            <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-[#FAF5EF]/35">
                              {product.sizes.join(" · ")}
                            </p>
                          </div>
                          <p className="mt-2 line-clamp-2 min-h-[2.6em] text-[10px] font-normal leading-[1.65] text-[#FAF5EF]/55">
                            {product.note}
                          </p>
                          <button
                            type="button"
                            onClick={() => openProduct(product)}
                            aria-label={`Open ${product.name} to choose a size and order`}
                            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold tracking-wide text-black shadow-[0_0_20px_rgba(255,255,255,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_rgba(255,255,255,0.9)] w-full mt-auto"
                          >
                            Order Now
                            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                          </button>
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            ) : (
              <div className="animate-fade-up liquid-glass-light mt-10 rounded-[1.8rem] px-6 py-12 text-center sm:px-10">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#4A0E17]/30 bg-[#FAF5EF]/10 text-[#FAF5EF]">
                  <SearchIcon className="h-6 w-6" />
                </span>
                <p className="eyebrow mt-4 text-[#FAF5EF]/45">No pieces found</p>
                <h3 className="editorial-heading mt-2 text-[2rem] leading-tight text-[#FAF5EF]">
                  Try a different search.
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-[11px] leading-[1.75] text-[#FAF5EF]/55">
                  We couldn’t find a match for “{searchQuery || activeCategory}”. Explore the full
                  edit, or search by a fabric or silhouette.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="liquid-btn-wrapper mt-5 px-6 py-3.5 transition-transform duration-300 hover:scale-105 hover:bg-[#F09DBB] hover:text-[#FAF5EF] active:scale-95"
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
              className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-[#4A0E17]/15 pt-6 sm:flex-row"
            >
              <p className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#FAF5EF]/50">
                <LeafIcon className="h-4 w-4 text-[#FAF5EF]/70" aria-hidden="true" />
                Limited runs · Considered fabrics · Made to be kept
              </p>
              <a
                href="mailto:hello@sabarbysimran.ae?subject=Private%20appointment"
                aria-label="Request a private appointment with the Sabar atelier"
                className="group inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[#FAF5EF]/70 hover:text-[#FAF5EF]"
              >
                <span className="link-underline">Request a private appointment</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-colors duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </Reveal>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="contact" className="relative overflow-hidden bg-[#4A0E17] pb-16 pt-14 sm:pb-3 sm:pt-16">

        <Reveal className="relative mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10" threshold={0.05}>
          <div className="grid gap-10 border-t border-[#4A0E17]/20 pb-12 pt-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.75fr_0.75fr] lg:gap-12">
            <div>
              <Wordmark size="md" href="#home" ariaLabel="Sabr by Simran — back to top" />
              <p className="mt-5 max-w-[29ch] text-[12px] font-normal leading-[1.8] text-[#FAF5EF]/70">
                Quietly luxurious pieces for the woman writing her own story. Designed and hand-finished
                in Dubai, under the Daisy Dreams sky.
              </p>
              <div className="mt-5 space-y-2">
                <a
                  href="mailto:hello@sabarbysimran.ae"
                  aria-label="Email the Sabar atelier"
                  className="flex items-center gap-2 text-[11px] font-medium text-[#FAF5EF]/65 transition hover:text-[#FAF5EF]"
                >
                  <MailIcon className="h-3.5 w-3.5" /> hello@sabarbysimran.ae
                </a>
                <p className="flex items-center gap-2 text-[11px] font-medium text-[#FAF5EF]/65">
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
                      aria-label={`Sabr by Simran on ${label}`}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-[#4A0E17]/15 bg-[#FAF5EF]/10 text-[#FAF5EF]/65 transition hover:border-darkText/35 hover:bg-[#FAF5EF] hover:text-[#FAF5EF]"
                    >
                      <SocialIcon className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h3 className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#FAF5EF]/50">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.policy ? (
                        <button
                          type="button"
                          data-policy={link.policy}
                          onClick={link.policy === "return" ? openReturnPolicy : openShippingPolicy}
                          className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF] w-full text-left"
                        >
                          {link.label}
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF]"
                        >
                          {link.label}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-[#4A0E17]/20 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#FAF5EF]/55">
              © 2026 Sabr by Simran. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#FAF5EF]/50">
              <span className="flex items-center gap-1.5">
                <FlamingoMark className="h-4 w-4" /> Dubai, UAE
              </span>
              <span aria-hidden="true">·</span>
              <span>Prices in {currency}</span>
              <span aria-hidden="true">·</span>
              <a
                href="/admin"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Admin Portal — Client Login"
                className="inline-flex items-center gap-1 text-[#FAF5EF]/60 transition hover:text-[#FAF5EF]"
              >
                <LockIcon className="h-3 w-3" /> Admin Portal
                <ArrowUpRight className="h-3 w-3 -rotate-45" />
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="#home"
                aria-label="Back to top"
                className="inline-flex items-center gap-1 text-[#FAF5EF]/60 transition hover:text-[#FAF5EF]"
              >
                Back to top <ArrowUpRight className="h-3 w-3 -rotate-45" />
              </a>
            </div>
          </div>
        </Reveal>
      </footer>

      {/* FLOATING WHATSAPP CONCIERGE */}
      {navReady && !cartOpen && (
        <a
          href="https://wa.me/971XXXXXXXXX"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Sabr by Simran on WhatsApp"
          className="group fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
        >
          <span className="pointer-events-none absolute right-full mr-3 flex translate-x-2 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#4A0E17]/30 bg-[#FAF5EF]/10 px-3.5 py-2 text-[9px] font-bold uppercase tracking-[0.13em] text-[#FAF5EF] opacity-0 shadow-liquid backdrop-blur-xl transition-colors duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
            <span className="h-1.5 w-1.5 rounded-full bg-[#25D366]" aria-hidden="true" />
            Chat with us
          </span>

          <span className="relative flex h-14 w-14 animate-bounce items-center justify-center rounded-full border border-[#4A0E17]/20 bg-[#25D366]/85 text-[#FAF5EF] shadow-[0_14px_38px_-10px_rgba(37,211,102,0.8)] backdrop-blur-xl transition-colors duration-300 [animation-duration:3s] group-hover:scale-105 group-hover:animate-none group-hover:bg-[#25D366] group-focus-visible:scale-105 group-focus-visible:animate-none group-active:scale-95 motion-reduce:animate-none">
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
          className="animate-toast-in fixed bottom-[5.75rem] left-1/2 z-[80] flex w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 items-center gap-3 rounded-[1.35rem] border border-[#4A0E17]/20 bg-[#4A0E17]/95 px-4 py-3 shadow-[0_18px_50px_-18px_rgba(74,59,66,0.5)] backdrop-blur-xl sm:bottom-6 sm:left-auto sm:right-24 sm:w-auto sm:translate-x-0"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#9EB79B]/70 text-[#FAF5EF]">
            <SparkleIcon className="h-4 w-4" />
          </span>
          <p className="min-w-0 flex-1 text-[10px] font-medium leading-snug text-[#FAF5EF]/75">
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
              className="shrink-0 text-[8px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF] transition hover:text-[#FAF5EF]/60"
            >
              View edit
            </button>
          )}
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss notification"
            className="shrink-0 text-[#FAF5EF]/35 transition hover:text-[#FAF5EF]/75"
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
      <PolicyModal
        isOpen={returnPolicyOpen}
        onClose={() => setReturnPolicyOpen(false)}
        title="Return & Exchange Policy"
      >
        <p>Return & Exchange Policy placeholder text. Our pieces are made in small batches and we want you to love your purchase. If you need to return or exchange, please contact us within 14 days of delivery.</p>
        <p>Items must be unworn, unwashed, and with all original tags attached. Custom or made-to-order items are final sale.</p>
      </PolicyModal>
      <PolicyModal
        isOpen={shippingPolicyOpen}
        onClose={() => setShippingPolicyOpen(false)}
        title="Shipping Policy"
      >
        <p>Shipping Policy placeholder text. We offer complimentary delivery across the UAE within 3–5 business days.</p>
        <p>Orders placed before 2 PM are dispatched same day. For international shipping, please contact our atelier.</p>
      </PolicyModal>
    </div>
  );
}
