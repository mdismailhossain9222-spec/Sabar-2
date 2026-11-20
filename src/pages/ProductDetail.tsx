import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { FlamingoMark, Wordmark } from "@/components/Brand";
import {
  ArrowUpRight,
  BagIcon,
  CheckIcon,
  ChevronLeft,
  ChevronRight,
  CloseIcon,
  DaisyIcon,
  LeafIcon,
  LockIcon,
  MapPinIcon,
  MinusIcon,
  PlusIcon,
  RulerIcon,
  ShieldIcon,
  SparkleIcon,
  TruckIcon,
  WhatsAppIcon,
} from "@/components/Icons";
import { PRODUCTS, formatMoney, type CurrencyCode, type Product } from "@/data/shop";
import { Reveal } from "@/components/Reveal";

/** Extra images per product for the gallery. */
const GALLERY_IMAGES: Record<string, string[]> = {
  "black-swan": [
    "/The Black Swan.png",
    "/The Black Swan.png",
    "/The Black Swan.png",
    "/The Black Swan.png",
  ],
  "eclat": [
    "/The Éclat.png",
    "/The Éclat.png",
    "/The Éclat.png",
    "/The Éclat.png",
  ],
  "espresso": [
    "/The Espresso.png",
    "/The Espresso.png",
    "/The Espresso.png",
    "/The Espresso.png",
  ],
  "coco": [
    "/The Coco.png",
    "/The Coco.png",
    "/The Coco.png",
    "/The Coco.png",
  ],
};

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>("AED");
  const [isAdding, setIsAdding] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);

  const product = useMemo(() => PRODUCTS.find((p) => p.id === id), [id]);
  const images = useMemo(() => GALLERY_IMAGES[id ?? ""] ?? [product?.image].filter(Boolean), [id, product?.image]);
  const price = product ? formatMoney(product.price, currency) : "";

  useEffect(() => {
    if (!product) {
      navigate("/");
    }
  }, [product, navigate]);

  if (!product) return null;

  const nextImage = () => setSelectedImage((i) => (i + 1) % images.length);
  const prevImage = () => setSelectedImage((i) => (i - 1 + images.length) % images.length);

  const handleAddToCart = () => {
    if (!selectedSize) return;
    setIsAdding(true);
    addToCart(product, selectedSize);
    setTimeout(() => setIsAdding(false), 300);
  };

  const handleCheckout = () => {
    if (!selectedSize) return;
    addToCart(product, selectedSize);
    setTimeout(() => navigate("/checkout"), 50);
  };

  return (
    <div id="product-detail" className="relative min-h-screen overflow-x-hidden bg-[#4A0E17] text-[#FAF5EF]">
      <a
        href="#main-content"
        className="sr-only z-[130] rounded-full bg-[#FAF5EF] px-5 py-3 text-xs font-bold text-[#FAF5EF] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {/* PRELOADER */}
      <div
        role="status"
        aria-live="polite"
        className="fixed inset-0 z-[120] flex flex-col items-center justify-center overflow-hidden bg-[#4A0E17] transition-opacity duration-500 ease-out opacity-0 pointer-events-none"
      >
        <div className="relative z-10 flex flex-col items-center text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full border border-[#4A0E17]/20 bg-[#FAF5EF]/10 text-[#FAF5EF] shadow-liquid">
            <FlamingoMark className="h-11 w-11" />
          </span>
          <p className="mt-5 font-serif text-5xl italic tracking-[-0.05em] text-[#FAF5EF]">Sabr</p>
          <p className="mt-2 text-[8px] font-bold uppercase tracking-[0.5em] text-[#FAF5EF]/60">By Simran</p>
        </div>
      </div>

      {/* FLOATING NAVBAR */}
      <header className="fixed inset-x-0 z-50 px-3 top-3.5 sm:px-5 sm:top-5">
        <nav aria-label="Primary navigation" className="liquid-glass-nav relative z-50 mx-auto flex max-w-[1240px] items-center justify-between gap-3 rounded-full px-3 py-2.5 sm:px-5 lg:px-6">
          <span className="shrink-0 md:hidden">
            <Wordmark size="sm" ariaLabel="Sabr by Simran — return to top" />
          </span>
          <span className="hidden shrink-0 md:block">
            <Wordmark size="md" ariaLabel="Sabr by Simran — return to top" />
          </span>

          <div className="hidden flex-1 items-center justify-center gap-8 md:flex lg:gap-11">
            <a href="/" aria-label="Back to home" className="link-underline eyebrow flex items-center gap-2 text-[9px] text-[#FAF5EF]/75 transition-colors duration-300 hover:text-[#FAF5EF]">
              <span className="h-1 w-1 rounded-full bg-[#4A0E17]/50" aria-hidden="true" />
              Home
            </a>
            <a href="#collection" aria-label="The Premiere collection" className="link-underline eyebrow flex items-center gap-2 text-[9px] text-[#FAF5EF]/75 transition-colors duration-300 hover:text-[#FAF5EF]">
              <span className="h-1 w-1 rounded-full bg-[#4A0E17]/50" aria-hidden="true" />
              The Premiere
            </a>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4A0E17]/30 bg-[#FAF5EF]/10 text-[#FAF5EF]/75 transition hover:border-[#4A0E17]/50 hover:bg-[#FAF5EF]/10 hover:text-[#FAF5EF] sm:h-10 sm:w-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </header>

      <main id="main-content">
        {/* PRODUCT GALLERY + DETAILS */}
        <section aria-labelledby="product-title" className="relative pt-[100px] pb-16 sm:pt-[120px] sm:pb-20">
          <div className="mx-auto max-w-[1340px] px-5 sm:px-8 lg:px-10">
            <Reveal variant="fade" className="mb-8">
              <a href="#collection" aria-label="Back to The Premiere" className="link-underline eyebrow flex items-center gap-2 text-[9px] text-[#FAF5EF]/55 transition-colors duration-300 hover:text-[#FAF5EF]">
                <ChevronLeft className="h-3.5 w-3.5" />
                Back to The Premiere
              </a>
            </Reveal>

            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:gap-12 xl:gap-16">
              {/* LEFT — GALLERY */}
              <Reveal variant="fade" className="relative">
                <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] bg-[#E87272]">
                  {/* Main image with red background for first image */}
                  <div className="absolute inset-0 overflow-hidden">
                    <img
                      src={images[selectedImage]}
                      alt={product.imageAlt}
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      width={product.imageWidth}
                      height={product.imageHeight}
                      className="h-full w-full object-cover transition-opacity duration-500"
                    />
                    {selectedImage === 0 && (
                      <div aria-hidden="true" className="absolute inset-0 bg-[#E87272] mix-blend-multiply opacity-20" />
                    )}
                  </div>

                  {/* Thumbnail strip — premium styling */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 mb-6 flex gap-3">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedImage(idx)}
                        aria-label={`View image ${idx + 1} of ${images.length}`}
                        aria-current={idx === selectedImage ? "true" : "false"}
                        className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-400 ease-out ${
                          idx === selectedImage
                            ? "border-[#E87272] shadow-[0_0_0_2px_rgba(232,114,114,0.5),_0_8px_24px_-8px_rgba(232,114,114,0.3)] scale-[1.02]"
                            : "border-[#4A0E17]/30 hover:border-[#E87272]/60 hover:shadow-[0_4px_16px_-4px_rgba(232,114,114,0.2)]"
                        }`}
                      >
                        <img
                          src={img}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                        />
                        {idx === selectedImage && (
                          <span className="absolute inset-0 bg-gradient-to-t from-[#E87272]/30 via-transparent to-transparent pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Nav arrows — refined */}
                  {images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={prevImage}
                        aria-label="Previous image"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#4A0E17]/30 bg-[#FAF5EF]/10 backdrop-blur-sm text-[#FAF5EF]/80 transition-all duration-300 hover:border-[#E87272] hover:bg-[#FAF5EF] hover:text-[#FAF5EF] hover:shadow-[0_8px_24px_-8px_rgba(232,114,114,0.4)]"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={nextImage}
                        aria-label="Next image"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[#4A0E17]/30 bg-[#FAF5EF]/10 backdrop-blur-sm text-[#FAF5EF]/80 transition-all duration-300 hover:border-[#E87272] hover:bg-[#FAF5EF] hover:text-[#FAF5EF] hover:shadow-[0_8px_24px_-8px_rgba(232,114,114,0.4)]"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}

                  {/* Counter — refined */}
                  <span className="absolute right-5 top-5 z-10 px-3.5 py-1.5 text-[7px] font-bold uppercase tracking-[0.16em] text-[#FAF5EF]/90 backdrop-blur-sm bg-[#4A0E17]/80 border border-[#FAF5EF]/10 rounded-full">
                    {selectedImage + 1} / {images.length}
                  </span>
                </div>

                {/* Product meta badges — refined */}
                <div className="mt-5 flex flex-wrap items-center gap-2.5">
                  <span className="px-4 py-1.5 text-[7px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF]/70 bg-[#FAF5EF]/10 border border-[#4A0E17]/20 rounded-full backdrop-blur-sm">
                    {product.category}
                  </span>
                  {product.badge && (
                    <span className="rounded-full bg-[#9EB79B] px-3 py-1.5 text-[7px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF] shadow-[0_2px_8px_-2px_rgba(158,183,155,0.4)]">
                      {product.badge}
                    </span>
                  )}
                  {product.microcopy && (
                    <span className="rounded-full border border-[#FAF5EF]/20 bg-[#4A0E17]/70 px-3 py-1.5 text-[6px] font-medium tracking-[0.12em] text-[#FAF5EF]/85 backdrop-blur-md">
                      {product.microcopy}
                    </span>
                  )}
                </div>
              </Reveal>

              {/* RIGHT — DETAILS */}
              <Reveal delay={120} variant="fade" className="relative">
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -inset-2 rounded-[1.5rem] border border-white/40 bg-[#FAF5EF]/10 shadow-[0_22px_55px_-30px_rgba(74,59,66,0.5)] will-change-transform motion-reduce:animate-none"
                  />
                  <div className="relative overflow-hidden rounded-2xl border border-[#4A0E17]/20 bg-[#FAF5EF]/10 p-6 sm:p-8 shadow-[0_20px_50px_-25px_rgba(74,59,66,0.45)]">
                    <div className="relative flex items-start justify-between gap-3">
                      <div>
                        <p className="eyebrow flex items-center gap-2 text-[8px] text-[#FAF5EF]/45">
                          <DaisyIcon className="h-3.5 w-3.5" /> The Premiere · SS26
                        </p>
                        <h1 id="product-title" className="editorial-heading mt-2 text-[clamp(3rem,6vw,5rem)] leading-[0.9] tracking-tighter text-[#FAF5EF] font-serif">
                          {product.name}
                        </h1>
                      </div>
                      <span className="shrink-0 rounded-full border border-[#9EB79B]/50 bg-[#9EB79B]/35 px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.12em] text-[#FAF5EF]/70">
                        Nº {String(PRODUCTS.findIndex((p) => p.id === id) + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <p className="text-4xl sm:text-5xl font-bold tracking-tighter text-[#FAF5EF] tabular-nums">{price}</p>
                      <span className="text-[7px] font-semibold uppercase tracking-[0.14em] text-[#FAF5EF]/30 self-center">VAT included · Limited run</span>
                    </div>

                    <p className="mt-5 max-w-prose text-[13px] font-normal leading-[1.9] text-[#FAF5EF]/65">
                      {product.description}
                    </p>

                    {/* Size selector — premium pill buttons */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <p id="size-label" className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF]/70">
                          Select your size
                          {selectedSize && (
                            <span className="rounded-full bg-[#9EB79B]/60 px-2.5 py-0.5 text-[7px] tracking-[0.1em] text-[#FAF5EF]">
                              {selectedSize}
                            </span>
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowSizeChart(!showSizeChart)}
                          aria-expanded={showSizeChart}
                          aria-controls="size-chart"
                          className="flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.1em] text-[#FAF5EF]/50 transition hover:text-[#FAF5EF]"
                        >
                          <RulerIcon className="h-3.5 w-3.5" />
                          Size guide
                          <ChevronRight className={`h-3 w-3 transition-transform duration-300 ${showSizeChart ? "rotate-90" : ""}`} />
                        </button>
                      </div>

                      <div role="radiogroup" aria-labelledby="size-label" className="grid grid-cols-4 gap-3">
                        {product.sizes.map((size) => {
                          const isSelected = selectedSize === size;
                          return (
                            <button
                              key={size}
                              type="button"
                              role="radio"
                              aria-checked={isSelected}
                              aria-label={`Size ${size}`}
                              onClick={() => setSelectedSize(size)}
                              className={`relative flex h-14 items-center justify-center rounded-xl border-2 transition-all duration-400 ease-out text-[12px] font-bold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E87272] focus-visible:ring-offset-2 focus-visible:ring-offset-basePink ${
                                isSelected
                                  ? "border-[#E87272] bg-gradient-to-br from-[#E87272] via-[#c85454] to-[#b04545] text-[#FAF5EF] shadow-[0_6px_20px_-6px_rgba(232,114,114,0.6),_inset_0_1px_0_rgba(255,255,255,0.15),_inset_0_-1px_0_rgba(0,0,0,0.1)]"
                                  : "border-[#4A0E17]/30 bg-white/5 backdrop-blur-sm text-[#FAF5EF]/70 hover:border-[#E87272]/70 hover:bg-white/8 hover:text-[#FAF5EF] hover:shadow-[0_4px_16px_-4px_rgba(232,114,114,0.2)] active:scale-[0.98]"
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>

                      <p className="mt-3 min-h-5 text-[9px] text-[#FAF5EF]/45" aria-live="polite">
                        {selectedSize
                          ? `Size ${selectedSize} selected — ready for your edit.`
                          : "Choose a size to continue."}
                      </p>
                    </div>

                    {/* Size chart modal */}
                    {showSizeChart && (
                      <div
                        id="size-chart"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="size-chart-title"
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                      >
                        <div className="relative max-w-md w-full rounded-2xl border border-[#4A0E17]/30 bg-[#4A0E17]/95 p-6 shadow-[0_35px_100px_-30px_rgba(44,28,35,0.65)] backdrop-blur-2xl">
                          <button
                            type="button"
                            onClick={() => setShowSizeChart(false)}
                            aria-label="Close size guide"
                            className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-[#4A0E17]/75 text-[#FAF5EF] shadow-liquid backdrop-blur-md transition-transform duration-300 hover:rotate-90 hover:bg-[#FAF5EF]"
                          >
                            <CloseIcon className="h-4 w-4" />
                          </button>
                          <h2 id="size-chart-title" className="editorial-heading text-[1.5rem] leading-tight text-[#FAF5EF]">
                            Size Guide
                          </h2>
                          <p className="mt-3 text-[11px] leading-[1.7] text-[#FAF5EF]/65">
                            Our pieces are designed to fit true to size. For a more relaxed fit, we recommend
                            sizing up. All measurements are in centimeters and refer to body measurements,
                            not garment dimensions.
                          </p>
                          <table className="mt-5 w-full text-[11px] text-[#FAF5EF]/70" role="table">
                            <thead>
                              <tr className="border-b border-[#4A0E17]/20">
                                <th className="text-left pb-2 font-semibold uppercase tracking-[0.08em] text-[#FAF5EF]/50">Size</th>
                                <th className="text-right pb-2 font-semibold uppercase tracking-[0.08em] text-[#FAF5EF]/50">Bust</th>
                                <th className="text-right pb-2 font-semibold uppercase tracking-[0.08em] text-[#FAF5EF]/50">Waist</th>
                                <th className="text-right pb-2 font-semibold uppercase tracking-[0.08em] text-[#FAF5EF]/50">Hip</th>
                              </tr>
                            </thead>
                            <tbody>
                              {["S", "M", "L", "XL"].map((sz, i) => (
                                <tr key={sz} className={`border-b border-[#4A0E17]/10 ${selectedSize === sz ? "bg-[#E87272]/10" : ""}`}>
                                  <td className="py-2 font-bold">{sz}</td>
                                  <td className="py-2 text-right">{82 + i * 4}</td>
                                  <td className="py-2 text-right">{64 + i * 4}</td>
                                  <td className="py-2 text-right">{90 + i * 4}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <p className="mt-4 text-[9px] text-[#FAF5EF]/45">For personal fitting advice, contact our Dubai stylists.</p>
                        </div>
                      </div>
                    )}

                    {/* Action buttons — perfectly aligned, equal height, elegant glow */}
                    <div className="mt-10 grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!selectedSize || isAdding}
                        aria-label={selectedSize ? `Add ${product.name}, size ${selectedSize}, to cart` : `Select a size before adding ${product.name} to cart`}
                        className={`relative flex h-14 items-center justify-center gap-2 rounded-xl py-4 text-[10px] font-bold uppercase tracking-[0.14em] transition-all duration-300 ${
                          selectedSize
                            ? "bg-gradient-to-r from-[#E87272] via-[#c85454] to-[#b04545] text-[#FAF5EF] shadow-[0_4px_16px_-4px_rgba(232,114,114,0.5),_inset_0_1px_0_rgba(255,255,255,0.1)] hover:scale-[1.01] hover:shadow-[0_8px_24px_-6px_rgba(232,114,114,0.7)] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100"
                            : "cursor-not-allowed border border-[#4A0E17]/15 bg-white/5 text-[#FAF5EF]/40"
                        }`}
                      >
                        {isAdding ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#FAF5EF]/30 border-t-[#FAF5EF]" />
                            Adding…
                          </>
                        ) : (
                          <>
                            <BagIcon className="h-4 w-4" />
                            Add to Cart
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCheckout}
                        disabled={!selectedSize}
                        aria-label={selectedSize ? `Checkout with ${product.name}, size ${selectedSize}` : `Select a size before checkout`}
                        className={`group relative flex h-14 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold tracking-wide text-black shadow-[0_4px_16px_-4px_rgba(255,255,255,0.4),_inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_24px_-6px_rgba(255,255,255,0.6),_inset_0_1px_0_rgba(255,255,255,0.3)] w-full ${
                          selectedSize ? "" : "opacity-40 cursor-not-allowed pointer-events-none"
                        }`}
                      >
                        Checkout
                        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </button>
                    </div>

                    {/* Trust signals — elegant horizontal alignment with subtle icons */}
                    <div className="relative mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 border-t border-[#4A0E17]/15 pt-6">
                      {[
                        { icon: TruckIcon, label: "Complimentary delivery" },
                        { icon: ShieldIcon, label: "14-day considered returns" },
                        { icon: LockIcon, label: "Private & protected" },
                      ].map(({ icon: TrustIcon, label }) => (
                        <span key={label} className="flex items-center gap-1.5 text-[7px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF]/45">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#9EB79B]/30 text-[#9EB79B]">
                            <TrustIcon className="h-3 w-3" />
                          </span>
                          {label}
                        </span>
                      ))}
                    </div>

                    <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[8px] text-[#FAF5EF]/40">
                      <LockIcon className="h-3 w-3" /> Secure checkout · Pay with Apple Pay, card or COD
                    </p>

                    {/* Stylist help */}
                    <div className="relative mt-6 rounded-xl border border-white/40 bg-[#FAF5EF]/10 px-4 py-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#4A0E17]/10 bg-[#FAF5EF]/10 text-[#FAF5EF]">
                            <FlamingoMark className="h-4.5 w-4.5" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#FAF5EF]/70">Prefer a personal touch?</p>
                            <p className="mt-1 text-[9px] leading-[1.65] text-[#FAF5EF]/50">Our Dubai stylists can size, gift-wrap and arrange your delivery personally.</p>
                          </div>
                        </div>
                        <a
                          href="mailto:hello@sabarbysimran.ae?subject=Checkout%20assistance"
                          aria-label="Email a Sabar stylist for checkout assistance"
                          className="group/stylist inline-flex shrink-0 items-center gap-1 text-[8px] font-bold uppercase tracking-[0.12em] text-[#FAF5EF]/70 transition hover:text-[#FAF5EF]"
                        >
                          <span className="link-underline">Ask a stylist</span>
                          <ArrowUpRight className="h-3 w-3 transition-colors duration-300 group-hover/stylist:-translate-y-0.5 group-hover/stylist:translate-x-0.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="contact" className="relative scroll-mt-[140px] overflow-hidden bg-[#4A0E17] pb-16 pt-14 sm:pb-3 sm:pt-16">
        <Reveal className="relative mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10" threshold={0.05}>
          <div className="grid gap-10 border-t border-[#4A0E17]/20 pb-12 pt-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.75fr_0.75fr] lg:gap-12">
            <div>
              <Wordmark size="md" href="/" ariaLabel="Sabr by Simran — back to top" />
              <p className="mt-5 max-w-[29ch] text-[12px] font-normal leading-[1.8] text-[#FAF5EF]/70">
                Quietly luxurious pieces for the woman writing her own story. Designed and hand-finished
                in Dubai, under the Daisy Dreams sky.
              </p>
              <div className="mt-5 space-y-2">
                <a href="mailto:hello@sabarbysimran.ae" aria-label="Email the Sabar atelier" className="flex items-center gap-2 text-[11px] font-medium text-[#FAF5EF]/65 transition hover:text-[#FAF5EF]">
                  <MapPinIcon className="h-3.5 w-3.5" /> Dubai Design District, UAE
                </a>
              </div>
              <ul className="mt-5 flex items-center gap-2" aria-label="Social media">
                {[
                  { label: "Instagram", href: "https://instagram.com", icon: WhatsAppIcon },
                  { label: "Pinterest", href: "https://pinterest.com", icon: LeafIcon },
                  { label: "TikTok", href: "https://tiktok.com", icon: SparkleIcon },
                ].map(({ label, href, icon: SocialIcon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer" aria-label={`Sabr by Simran on ${label}`} className="flex h-8 w-8 items-center justify-center rounded-full border border-[#4A0E17]/15 bg-[#FAF5EF]/10 text-[#FAF5EF]/65 transition hover:border-darkText/35 hover:bg-[#FAF5EF] hover:text-[#FAF5EF]">
                      <SocialIcon className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <nav aria-label="Customer Care">
              <h3 className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#FAF5EF]/50">Customer Care</h3>
              <ul className="mt-4 space-y-2.5">
                <li><a href="mailto:hello@sabarbysimran.ae" className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF]">Contact the atelier</a></li>
                <li><a href="mailto:hello@sabarbysimran.ae?subject=Private%20fitting" className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF]">Book a private fitting</a></li>
                <li><a href="#collection" className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF]">The Premiere</a></li>
              </ul>
            </nav>

            <nav aria-label="Store Policies">
              <h3 className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#FAF5EF]/50">Store Policies</h3>
              <ul className="mt-4 space-y-2.5">
                <li><a href="#checkout" className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF]">Shipping & delivery</a></li>
                <li><a href="#checkout" className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF]">Returns & exchanges</a></li>
                <li><a href="#contact" className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF]">Privacy & terms</a></li>
              </ul>
            </nav>

            <nav aria-label="Order Tracking">
              <h3 className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#FAF5EF]/50">Order Tracking</h3>
              <ul className="mt-4 space-y-2.5">
                <li><a href="mailto:hello@sabarbysimran.ae?subject=Order%20tracking" className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF]">Track your order</a></li>
                <li><a href="mailto:hello@sabarbysimran.ae?subject=Return" className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF]">Start a return</a></li>
                <li><a href="#checkout" className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF]">Payment security</a></li>
              </ul>
            </nav>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#4A0E17]/20 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#FAF5EF]/55">© 2026 Sabr by Simran. All rights reserved.</p>
            <div className="flex flex-wrap items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#FAF5EF]/50">
              <span className="flex items-center gap-1.5"><FlamingoMark className="h-4 w-4" /> Dubai, UAE</span>
              <span aria-hidden="true">·</span>
              <span>Prices in {currency}</span>
              <span aria-hidden="true">·</span>
              <a href="/" aria-label="Back to top" className="inline-flex items-center gap-1 text-[#FAF5EF]/60 transition hover:text-[#FAF5EF]">Back to top <ArrowUpRight className="h-3 w-3 -rotate-45" /></a>
            </div>
          </div>
        </Reveal>
      </footer>
    </div>
  );
}