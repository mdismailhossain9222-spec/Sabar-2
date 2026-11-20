import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import { FlamingoMark, Wordmark } from "@/components/Brand";
import {
  ArrowUpRight,
  CheckIcon,
  ChevronLeft,
  DaisyIcon,
  LeafIcon,
  LockIcon,
  MapPinIcon,
  MinusIcon,
  PlusIcon,
  ShieldIcon,
  SparkleIcon,
  TruckIcon,
} from "@/components/Icons";
import { formatMoney, type CurrencyCode } from "@/data/shop";
import { Reveal } from "@/components/Reveal";
import { useCart } from "@/contexts/CartContext";
import { useStripe, redirectToStripeCheckout, toMinorUnits } from "@/hooks/useStripe";
import { CustomSelect } from "@/components/Select";

type PaymentMethod = "apple" | "google" | "card" | "cod";
type ToastMessage = { id: number; message: string; action?: "bag" };

type PaymentOption = {
  id: PaymentMethod;
  label: string;
  detail: string;
  icon: React.ReactNode;
};

type CustomerDetails = {
  fullName: string;
  phone: string;
  address: string;
  emirate: string;
};

type CheckoutErrors = Partial<Record<keyof CustomerDetails | "payment", string>>;

type PlacedOrder = {
  reference: string;
  totalAed: number;
  payment: PaymentMethod;
  customerName: string;
};

const EMIRATES = [
  "Dubai",
  "Abu Dhabi",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain",
];

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: "apple", label: "Apple Pay", detail: "Instant · Face ID", icon: <span className="flex items-center"><svg className="h-4 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19.5 5.5l-3.5 10 6.5 0 3.5-10ZM4.5 5.5l3.5 10 6.5 0 3.5-10Z"/></svg></span> },
  { id: "google", label: "Google Pay", detail: "Instant · Wallet", icon: <span className="flex items-center"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12.5 11v4.5h4.5v-4.5H12.5Z"/></svg></span> },
  {
    id: "card",
    label: "Visa / Mastercard",
    detail: "Credit & debit",
    icon: (
      <span className="flex items-center" aria-hidden="true">
        <span className="h-3 w-3 rounded-full bg-[#4A0E17]" />
        <span className="-ml-1 h-3 w-3 rounded-full bg-[#9EB79B]/90" />
      </span>
    ),
  },
  {
    id: "cod",
    label: "Cash on Delivery",
    detail: "Available in UAE",
    icon: <TruckIcon className="h-4 w-4" />,
  },
];

/** Premium input styling — softer glass, more refined */
const CHECKOUT_INPUT_CLASSES = (hasError = false) =>
  `w-full rounded-xl border bg-white/3 px-5 py-4 text-sm text-[#FAF5EF] transition-all duration-300 placeholder:text-[#FAF5EF]/35 focus:outline-none focus:ring-2 focus:ring-[#E87272] focus:border-[#E87272] focus:bg-white/5 ${
    hasError
      ? "border-[#E87272] ring-1 ring-[#E87272]/20 bg-white/6"
      : "border-[#FAF5EF]/15 hover:border-[#FAF5EF]/25 hover:bg-white/5"
  }`;

export default function CheckoutPage() {
  const {
    cartItems,
    currency,
    cartSubtotalAed,
    cartCount,
    clearCart,
    setCurrency,
    changeQuantity,
    removeFromCart,
  } = useCart();
  const navigate = useNavigate();
  const stripe = useStripe();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>("apple");
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: "",
    phone: "",
    address: "",
    emirate: "Dubai",
  });
  const [checkoutErrors, setCheckoutErrors] = useState<CheckoutErrors>({});
  const [orderPlaced, setOrderPlaced] = useState<PlacedOrder | null>(null);

  const checkoutSubtotalAed = cartSubtotalAed;
  const checkoutTotalLabel = formatMoney(checkoutSubtotalAed, currency);
  const checkoutPieceCount = cartCount;

  const notify = (message: string, action?: "bag") => {
    setToast({ id: Date.now(), message, action });
  };

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems.length, navigate]);

  useEffect(() => {
    if (!toast) return;
    const dismissTimer = window.setTimeout(() => setToast(null), 3400);
    return () => window.clearTimeout(dismissTimer);
  }, [toast]);

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

  const resetCheckout = () => {
    setOrderPlaced(null);
    setCustomer({ fullName: "", phone: "", address: "", emirate: "Dubai" });
    setCheckoutErrors({});
    setPaymentMethod("apple");
  };

  const placeOrder = async (event: FormEvent<HTMLFormElement>) => {
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
    if (!customer.emirate) {
      nextErrors.emirate = "Please select an emirate.";
    }
    if (!paymentMethod) {
      nextErrors.payment = "Choose a payment method to continue.";
    }

    setCheckoutErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      notify("Please complete the highlighted checkout details.");
      const firstInvalid = (["fullName", "phone", "address", "emirate"] as const).find(
        (field) => nextErrors[field]
      );
      const fieldIds: Record<"fullName" | "phone" | "address" | "emirate", string> = {
        fullName: "checkout-full-name",
        phone: "checkout-phone",
        address: "checkout-address",
        emirate: "checkout-emirate",
      };
      if (firstInvalid) {
        window.setTimeout(() => document.getElementById(fieldIds[firstInvalid])?.focus(), 40);
      }
      return;
    }

    if (!paymentMethod) return;

    if (paymentMethod !== "cod") {
      if (!stripe) {
        notify("Payment system not configured. Please contact support.");
        return;
      }

      const lineItems = cartItems.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        amount: toMinorUnits(item.product.price, currency),
        quantity: item.quantity,
        currency: currency.toLowerCase(),
      }));

      notify("Redirecting to secure checkout...");

      const result = await redirectToStripeCheckout(stripe, lineItems, {
        successUrl: `${window.location.origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/checkout?canceled=true`,
        metadata: {
          customerName: customer.fullName.trim(),
          customerPhone: customer.phone.trim(),
          customerAddress: customer.address.trim(),
          customerEmirate: customer.emirate,
          paymentMethod,
          currency,
        },
      });

      if (result.error) {
        notify(`Checkout error: ${result.error}`);
        console.error("[Stripe] Checkout error:", result.error);
      }
      return;
    }

    // COD (Cash on Delivery)
    setOrderPlaced({
      reference: `SBR-${String(Date.now()).slice(-6)}`,
      totalAed: checkoutSubtotalAed,
      payment: paymentMethod,
      customerName: customer.fullName.trim().split(/\s+/)[0],
    });
    clearCart();
    setCheckoutErrors({});
    notify("Order placed — welcome to the Sabr edit.");
  };

  const handleCurrency = (code: CurrencyCode) => {
    setCurrency(code);
    notify(`Prices now shown in ${code}.`);
  };

  const selectedPaymentOpt = PAYMENT_OPTIONS.find((option) => option.id === paymentMethod);

  return (
    <div id="checkout-page" className="relative min-h-screen overflow-x-hidden bg-[#4A0E17] text-[#FAF5EF]">
      <a
        href="#main-content"
        className="sr-only z-[130] rounded-full bg-[#FAF5EF] px-5 py-3 text-xs font-bold text-[#FAF5EF] focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

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
            <div className="relative flex items-center gap-1 rounded-full border border-[#4A0E17]/30 bg-[#FAF5EF]/10 px-2 py-1.5 text-[#FAF5EF] transition hover:border-[#4A0E17]/50 hover:bg-[#FAF5EF]/10 sm:gap-1.5 sm:px-2.5">
              <label htmlFor="currency-select" className="sr-only">Select currency</label>
              <select
                id="currency-select"
                value={currency}
                onChange={(event) => handleCurrency(event.target.value as CurrencyCode)}
                aria-label="Select currency"
                className="w-[42px] cursor-pointer appearance-none bg-transparent pr-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#FAF5EF]/75 outline-none sm:w-[46px] sm:text-[10px]"
              >
                {[
                  { code: "AED", symbol: "AED" },
                  { code: "USD", symbol: "$" },
                  { code: "GBP", symbol: "£" },
                  { code: "EUR", symbol: "€" },
                ].map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </nav>
      </header>

      <main id="main-content">
        {/* CHECKOUT */}
        <section
          id="checkout"
          aria-labelledby="checkout-heading"
          className="relative pt-[100px] pb-16 sm:pt-[120px] sm:pb-20"
        >
          <div className="relative mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
            <Reveal variant="fade" className="mb-8">
              <a href="/product" aria-label="Back to shopping" className="link-underline eyebrow flex items-center gap-2 text-[9px] text-[#FAF5EF]/55 transition-colors duration-300 hover:text-[#FAF5EF]">
                <ChevronLeft className="h-3.5 w-3.5" />
                Back to Shopping
              </a>
            </Reveal>

            <Reveal variant="scale" threshold={0.08}>
              <div className="liquid-glass-light relative overflow-hidden rounded-[2rem] p-4 sm:p-8 lg:p-10">
                <header className="relative mb-7 flex flex-col gap-5 border-b border-[#4A0E17]/15 pb-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-xl">
                    <p className="eyebrow flex items-center gap-3 text-[8px] text-[#FAF5EF]/50">
                      <span className="hairline text-[#FAF5EF]" aria-hidden="true" /> 04 — Secure
                      Checkout
                    </p>
                    <h1
                      id="checkout-heading"
                      className="editorial-heading mt-3 text-[clamp(2.5rem,5vw,4rem)] leading-[0.92] tracking-tighter text-[#FAF5EF] font-serif"
                    >
                      Secure Checkout
                    </h1>
                    <p className="mt-3 max-w-md text-sm leading-relaxed text-[#FAF5EF]/60">
                      Direct one-page checkout for a seamless experience.
                    </p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#FAF5EF]/45">
                      Complimentary delivery across the UAE · Displayed in {currency}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="liquid-glass-light inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF]/65">
                      <LockIcon className="h-3.5 w-3.5" /> SSL secured
                    </span>
                    <span className="liquid-glass-light inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF]/65">
                      <TruckIcon className="h-3.5 w-3.5" /> Free UAE delivery
                    </span>
                  </div>
                </header>

                {orderPlaced ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="animate-success-pop relative overflow-hidden rounded-2xl border border-[#4A0E17]/20 bg-[#FAF5EF]/10 px-5 py-9 text-center sm:px-10 sm:py-12"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-[#FAF5EF]/8 blur-2xl"
                    />
                    <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#4A0E17]/30 bg-[#9EB79B] text-[#FAF5EF] shadow-liquid">
                      <CheckIcon className="h-7 w-7" />
                    </span>
                    <p className="eyebrow relative mt-4 text-[#FAF5EF]/55">Order confirmed</p>
                    <h3 className="editorial-heading relative mt-2 text-[clamp(2rem,4vw,3rem)] leading-tight text-[#FAF5EF]">
                      Beautifully done, {orderPlaced.customerName}.
                    </h3>
                    <p className="relative mx-auto mt-3 max-w-md text-[12px] leading-[1.8] text-[#FAF5EF]/65">
                      Your order has been received at our Dubai atelier. A stylist will confirm your
                      delivery details on WhatsApp shortly.
                    </p>
                    <dl className="relative mx-auto mt-7 grid max-w-2xl grid-cols-2 gap-3 text-left sm:grid-cols-4">
                      <div className="rounded-xl border border-[#4A0E17]/20 bg-[#FAF5EF]/10 px-3.5 py-3">
                        <dt className="text-[7px] font-bold uppercase tracking-[0.16em] text-[#FAF5EF]/45">Order</dt>
                        <dd className="mt-1 text-[11px] font-bold text-[#FAF5EF]">{orderPlaced.reference}</dd>
                      </div>
                      <div className="rounded-xl border border-[#4A0E17]/20 bg-[#FAF5EF]/10 px-3.5 py-3">
                        <dt className="text-[7px] font-bold uppercase tracking-[0.16em] text-[#FAF5EF]/45">Total</dt>
                        <dd className="mt-1 text-[11px] font-bold text-[#FAF5EF]">
                          {formatMoney(orderPlaced.totalAed, currency)}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-[#4A0E17]/20 bg-[#FAF5EF]/10 px-3.5 py-3">
                        <dt className="text-[7px] font-bold uppercase tracking-[0.16em] text-[#FAF5EF]/45">Payment</dt>
                        <dd className="mt-1 text-[11px] font-bold text-[#FAF5EF]">
                          {PAYMENT_OPTIONS.find((option) => option.id === orderPlaced.payment)?.label ??
                            "Secure payment"}
                        </dd>
                      </div>
                      <div className="rounded-xl border border-[#4A0E17]/20 bg-[#FAF5EF]/10 px-3.5 py-3">
                        <dt className="text-[7px] font-bold uppercase tracking-[0.16em] text-[#FAF5EF]/45">Delivery</dt>
                        <dd className="mt-1 text-[11px] font-bold text-[#FAF5EF]">3–5 working days</dd>
                      </div>
                    </dl>
                    <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                      <a
                        href="/"
                        onClick={resetCheckout}
                        className="liquid-btn-wrapper px-6 py-3.5 transition-transform duration-300 hover:scale-105 hover:bg-[#F09DBB] hover:text-[#FAF5EF] active:scale-95"
                        aria-label="Continue browsing the collection"
                      >
                        Continue browsing
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        onClick={resetCheckout}
                        className="liquid-btn-wrapper liquid-btn-solid px-6 py-3.5 transition-transform duration-300 hover:scale-105 active:scale-95"
                        aria-label="Start a new order"
                      >
                        Start a new order
                      </button>
                    </div>
                    <p className="relative mt-4 text-[8px] font-medium uppercase tracking-[0.14em] text-[#FAF5EF]/40">
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
                    <div className="flex flex-col gap-8">
                      <fieldset>
                        <legend className="mb-6 flex w-full items-center gap-3 border-b border-[#4A0E17]/15 pb-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#4A0E17]/20 bg-[#FAF5EF]/10 text-[9px] font-bold text-[#FAF5EF]">
                            01
                          </span>
                          <span>
                            <span className="block font-serif text-2xl italic leading-none text-[#FAF5EF]">
                              Customer Details
                            </span>
                            <span className="mt-1.5 block text-[8px] font-bold uppercase tracking-[0.16em] text-[#FAF5EF]/45">
                              Where should we deliver your pieces?
                            </span>
                          </span>
                        </legend>

                        <div className="space-y-5">
                          <div>
                            <label
                              htmlFor="checkout-full-name"
                              className="mb-2 flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF]/65"
                            >
                              Full Name <span className="text-[#FAF5EF]/40">Required</span>
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
                                className="mt-2 text-[10px] font-semibold text-[#E58A8A]"
                              >
                                {checkoutErrors.fullName}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="checkout-phone"
                              className="mb-2 flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF]/65"
                            >
                              Phone Number <span className="text-[#FAF5EF]/40">Required</span>
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
                                className="mt-2 text-[10px] font-semibold text-[#E58A8A]"
                              >
                                {checkoutErrors.phone}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="checkout-address"
                              className="mb-2 flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF]/65"
                            >
                              Delivery Address <span className="text-[#FAF5EF]/40">Required</span>
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
                                className="mt-2 text-[10px] font-semibold text-[#E58A8A]"
                              >
                                {checkoutErrors.address}
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="checkout-emirate"
                              className="mb-2 flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF]/65"
                            >
                              Emirate <span className="text-[#FAF5EF]/40">Required</span>
                            </label>
                            <CustomSelect
                              id="checkout-emirate"
                              value={customer.emirate}
                              onValueChange={(value) => updateCustomerField("emirate", value)}
                              options={EMIRATES.map((emirate) => ({ value: emirate, label: emirate }))}
                              placeholder="Select emirate"
                              ariaLabel="Select emirate"
                              required
                              ariaInvalid={Boolean(checkoutErrors.emirate)}
                              ariaDescribedBy={checkoutErrors.emirate ? "checkout-emirate-error" : undefined}
                              className="scroll-mt-28"
                              disabled={false}
                            />
                            {checkoutErrors.emirate && (
                              <p
                                id="checkout-emirate-error"
                                role="alert"
                                className="mt-2 text-[10px] font-semibold text-[#E58A8A]"
                              >
                                {checkoutErrors.emirate}
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="mt-3 flex items-start gap-1.5 text-[9px] leading-relaxed text-[#FAF5EF]/45">
                          <ShieldIcon className="mt-px h-3 w-3 shrink-0" />
                          Your details are used only to deliver this order. No marketing, ever.
                        </p>
                      </fieldset>

                      <fieldset aria-describedby="payment-help">
                        <legend className="mb-5 flex w-full items-center gap-3 border-b border-[#4A0E17]/15 pb-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#4A0E17]/20 bg-[#FAF5EF]/10 text-[9px] font-bold text-[#FAF5EF]">
                            02
                          </span>
                          <span className="flex flex-1 items-center justify-between gap-2">
                            <span className="block font-serif text-2xl italic leading-none text-[#FAF5EF]">
                              Payment Method
                            </span>
                            <span className="flex items-center gap-1 text-[7px] font-bold uppercase tracking-[0.16em] text-[#FAF5EF]/40">
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
                                className={`relative flex w-full cursor-pointer items-center gap-3 rounded-xl p-4 text-left transition-all duration-400 ease-out ${
                                  isActive
                                    ? "border-2 border-[#E87272] bg-gradient-to-br from-[#FAF5EF]/8 to-[#E87272]/8 shadow-[0_0_20px_rgba(232,114,114,0.25),_inset_0_1px_0_rgba(255,255,255,0.05)]"
                                    : "border border-[#4A0E17]/20 bg-white/3 hover:border-[#E87272]/50 hover:bg-white/5 hover:shadow-[0_4px_16px_-4px_rgba(232,114,114,0.15)]"
                                }`}
                              >
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                                  isActive
                                    ? "border-[#E87272] bg-gradient-to-br from-[#E87272] to-[#c85454] text-[#FAF5EF] shadow-[0_2px_8px_-2px_rgba(232,114,114,0.4)]"
                                    : "border-[#4A0E17]/15 bg-white/3 text-[#FAF5EF]/80 hover:border-[#E87272]/40 hover:bg-white/5"
                                }`}>
                                  {option.icon}
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[12px] font-bold leading-tight text-[#FAF5EF] sm:text-[13px]">
                                    {option.label}
                                  </span>
                                  <span className="mt-1 block text-[7px] font-semibold uppercase leading-tight tracking-[0.1em] text-[#FAF5EF]/45">
                                    {option.detail}
                                  </span>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className={`absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full border transition-all duration-300 ${
                                    isActive
                                      ? "border-[#E87272] bg-[#E87272] text-[#FAF5EF] opacity-100 shadow-[0_0_0_2px_rgba(232,114,114,0.3)]"
                                      : "border-[#4A0E17]/15 bg-transparent text-transparent opacity-60"
                                  }`}
                                >
                                  <CheckIcon className="h-3 w-3" />
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <p
                          id="payment-help"
                          aria-live="polite"
                          className="mt-3 flex min-h-5 items-center gap-1.5 text-[9px] leading-relaxed text-[#FAF5EF]/50"
                        >
                          <LockIcon className="h-3 w-3 shrink-0" />
                          {selectedPaymentOpt
                            ? `${selectedPaymentOpt.label} selected — you'll confirm securely when you place your order.`
                            : "Choose a payment method to continue."}
                        </p>
                        {checkoutErrors.payment && (
                          <p role="alert" className="mt-1 text-[10px] font-semibold text-[#E58A8A]">
                            {checkoutErrors.payment}
                          </p>
                        )}

                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-3 py-2.5">
                          <ShieldIcon className="h-4 w-4 shrink-0 text-[#FAF5EF]/60" />
                          <p className="text-[8px] font-semibold uppercase leading-relaxed tracking-[0.1em] text-[#FAF5EF]/50">
                            256-bit encrypted · Card details never stored by Sabar
                          </p>
                        </div>
                      </fieldset>
                    </div>

                    {/* RIGHT — ORDER SUMMARY */}
                    <div className="relative">
                      <div
                        aria-hidden="true"
                        className="animate-float pointer-events-none absolute -inset-2 rounded-[1.7rem] border border-white/40 bg-[#FAF5EF]/10 shadow-[0_22px_55px_-30px_rgba(74,59,66,0.5)] will-change-transform motion-reduce:animate-none sm:-inset-3"
                      />
                      <aside
                        aria-labelledby="order-summary-heading"
                        className="relative overflow-hidden rounded-2xl border border-[#4A0E17]/20 bg-black/20 backdrop-blur-sm p-6 shadow-[0_20px_50px_-25px_rgba(74,59,66,0.45)]"
                      >
                        <div className="relative flex items-start justify-between gap-3">
                          <div>
                            <p className="eyebrow flex items-center gap-2 text-[8px] text-[#FAF5EF]/45">
                              <DaisyIcon className="h-3.5 w-3.5" /> Your edit
                            </p>
                            <h3
                              id="order-summary-heading"
                              className="mt-1.5 font-serif text-[1.65rem] italic leading-none text-[#FAF5EF]"
                            >
                              Order Summary
                            </h3>
                          </div>
                          <span className="shrink-0 rounded-full border border-[#9EB79B]/50 bg-[#9EB79B]/35 px-2.5 py-1 text-[7px] font-bold uppercase tracking-[0.12em] text-[#FAF5EF]/70">
                            {checkoutPieceCount} {checkoutPieceCount === 1 ? "piece" : "pieces"}
                          </span>
                        </div>

                        <ul className="relative mt-6 max-h-[17rem] space-y-4 overflow-y-auto pr-1 no-scrollbar">
                          {cartItems.map(({ product, quantity, size, lineKey }) => (
                            <li
                              key={lineKey}
                              className="flex items-center gap-4 rounded-xl border border-[#4A0E17]/20 bg-white/5 p-3 transition-all duration-300 hover:bg-white/8"
                            >
                              <div className="relative h-[72px] w-[58px] shrink-0 overflow-hidden rounded-lg border border-[#4A0E17]/30 bg-[#FAF5EF]">
                                <img
                                  src={product.image}
                                  alt={product.imageAlt}
                                  loading="eager"
                                  fetchPriority="high"
                                  decoding="async"
                                  width={product.imageWidth}
                                  height={product.imageHeight}
                                  className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
                                />
                                <span className="absolute bottom-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#4A0E17] px-1 text-[7px] font-bold text-[#9EB79B]">
                                  {quantity}
                                </span>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate font-serif text-[15px] italic leading-tight text-[#FAF5EF]">
                                      {product.name}
                                    </p>
                                    <p className="mt-1 truncate text-[7px] font-semibold uppercase tracking-[0.1em] text-[#FAF5EF]/45">
                                      {product.category} · {product.colour} · Size {size}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <p className="shrink-0 text-[11px] font-bold text-[#FAF5EF] tabular-nums">
                                      {formatMoney(product.price * quantity, currency)}
                                    </p>
                                    <button
                                      type="button"
                                      onClick={() => removeFromCart(lineKey)}
                                      aria-label={`Remove ${product.name}, size ${size}, from your edit`}
                                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#FAF5EF]/40 transition hover:bg-white/10 hover:text-[#E87272] hover:scale-110"
                                    >
                                      <svg
                                        className="h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        aria-hidden="true"
                                      >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="flex items-center rounded-full border border-[#4A0E17]/15 bg-white/5">
                                    <button
                                      type="button"
                                      onClick={() => changeQuantity(lineKey, -1)}
                                      disabled={quantity <= 1}
                                      aria-label={`Decrease quantity of ${product.name}, size ${size}`}
                                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#FAF5EF]/60 transition hover:bg-white/10 hover:text-[#FAF5EF] disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                      <MinusIcon className="h-2.5 w-2.5" />
                                    </button>
                                    <span className="min-w-5 text-center text-[10px] font-bold tabular-nums text-[#FAF5EF]">
                                      {quantity}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => changeQuantity(lineKey, 1)}
                                      aria-label={`Increase quantity of ${product.name}, size ${size}`}
                                      className="flex h-7 w-7 items-center justify-center rounded-full text-[#FAF5EF]/60 transition hover:bg-white/10 hover:text-[#FAF5EF]"
                                    >
                                      <PlusIcon className="h-2.5 w-2.5" />
                                    </button>
                                  </div>
                                  <span className="text-[7px] font-semibold uppercase tracking-[0.1em] text-[#FAF5EF]/35">
                                    In your edit
                                  </span>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>

                        {/* Delivery Method Box — elegant and distinct */}
                        <div className="relative mt-6 p-5 rounded-xl border border-[#9EB79B]/30 bg-gradient-to-br from-[#9EB79B]/8 to-transparent">
                          <p className="flex items-center gap-2 text-[7px] font-bold uppercase tracking-[0.14em] text-[#FAF5EF]/65 mb-3">
                            <TruckIcon className="h-3 w-3" /> Delivery Method
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#9EB79B]/15 text-[#9EB79B]">
                                <TruckIcon className="h-4.5 w-4.5" />
                              </span>
                              <div>
                                <p className="text-[10px] font-bold text-[#FAF5EF]">Free Shipping</p>
                                <p className="text-[7px] font-semibold uppercase tracking-[0.1em] text-[#FAF5EF]/45">3 to 5 Business Days</p>
                              </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-[#9EB79B]/15 px-3 py-1 text-[7px] font-bold uppercase tracking-[0.12em] text-[#FAF5EF]">Free</span>
                          </div>
                        </div>

                        <div className="relative mt-6 space-y-2.5 border-t border-[#4A0E17]/15 pt-4 text-[11px] text-[#FAF5EF]/70">
                          <div className="flex items-center justify-between gap-3">
                            <span>Subtotal</span>
                            <span className="font-bold text-[#FAF5EF] tabular-nums">
                              {formatMoney(checkoutSubtotalAed, currency)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span>Shipping</span>
                            <span className="flex items-center gap-1 font-semibold text-[#FAF5EF]">
                              <DaisyIcon className="h-3 w-3" /> Complimentary
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span>Taxes</span>
                            <span className="font-semibold text-[#FAF5EF]">Included</span>
                          </div>
                        </div>

                        <div className="relative mt-5 flex items-end justify-between gap-3 border-t border-[#4A0E17]/20 pt-4">
                          <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#FAF5EF]/55">
                            Total
                          </span>
                          <div className="text-right">
                            <p
                              className="font-serif text-[2rem] font-semibold leading-none text-[#FAF5EF] tabular-nums"
                              aria-live="polite"
                            >
                              {checkoutTotalLabel}
                            </p>
                            <p className="mt-1 text-[7px] font-semibold uppercase tracking-[0.12em] text-[#FAF5EF]/40">
                              VAT included
                            </p>
                          </div>
                        </div>

                        {/* Place Order Button — perfectly centered, elegant glow */}
                        <button
                          type="submit"
                          aria-label={`Place order for ${checkoutTotalLabel}`}
                          className="group relative flex h-14 items-center justify-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-bold tracking-wide text-black shadow-[0_4px_16px_-4px_rgba(255,255,255,0.35),_inset_0_1px_0_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_8px_24px_-6px_rgba(255,255,255,0.5),_inset_0_1px_0_rgba(255,255,255,0.2)] w-full"
                        >
                          Place Order
                          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </button>

                        <div className="relative mt-4 flex items-center justify-between gap-2 border-t border-[#4A0E17]/10 pt-3">
                          <span className="flex items-center gap-1 text-[7px] font-bold uppercase tracking-[0.12em] text-[#FAF5EF]/45">
                            <ShieldIcon className="h-3 w-3" /> SSL secured
                          </span>
                          <span className="text-[7px] font-semibold uppercase tracking-[0.1em] text-[#FAF5EF]/40">
                            Apple Pay · Visa · COD
                          </span>
                        </div>

                        <p className="relative mt-4 flex items-center justify-center gap-1.5 text-center text-[8px] font-semibold uppercase tracking-[0.1em] text-[#FAF5EF]/45">
                          <TruckIcon className="h-3.5 w-3.5" /> UAE delivery in 3–5 working days
                        </p>
                      </aside>

                      <div className="relative mt-4 rounded-xl border border-white/20 bg-white/5 px-4 py-3.5">
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
                        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-[#4A0E17]/10 pt-2.5 sm:gap-x-4">
                          <span className="flex items-center gap-1.5 text-[8px] font-semibold text-[#FAF5EF]/45">
                            <MapPinIcon className="h-3 w-3" /> hello@sabarbysimran.ae
                          </span>
                          <span className="flex items-center gap-1.5 text-[8px] font-semibold text-[#FAF5EF]/45">
                            <MapPinIcon className="h-3 w-3" /> +971 4 000 0000
                          </span>
                          <span className="ml-auto flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.08em] text-[#FAF5EF]/45">
                            <DaisyIcon className="h-3 w-3" /> Gift notes available
                          </span>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                <div className="relative mt-8 flex flex-col gap-4 border-t border-[#4A0E17]/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                    {[
                      { icon: TruckIcon, label: "Complimentary delivery" },
                      { icon: ShieldIcon, label: "14-day considered returns" },
                      { icon: LockIcon, label: "Private & protected" },
                    ].map(({ icon: TrustIcon, label }) => (
                      <span key={label} className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.12em] text-[#FAF5EF]/50">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#9EB79B]/40 text-[#FAF5EF]">
                          <TrustIcon className="h-3.5 w-3.5" />
                        </span>
                        {label}
                      </span>
                    ))}
                  </div>
                  <p className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-[#FAF5EF]/40">
                    <MapPinIcon className="h-3.5 w-3.5" /> Fulfilled from Dubai, UAE
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="contact" className="relative overflow-hidden bg-[#4A0E17] pb-16 pt-14 sm:pb-3 sm:pt-16">
        <Reveal className="relative mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10" threshold={0.05}>
          <div className="grid gap-10 border-t border-[#4A0E17]/20 pb-12 pt-12 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.75fr_0.75fr_0.75fr_0.75fr] lg:gap-12">
            <div>
              <Wordmark size="md" href="/" ariaLabel="Sabr by Simran — back to top" />
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
                  <MapPinIcon className="h-3.5 w-3.5" /> hello@sabarbysimran.ae
                </a>
                <p className="flex items-center gap-2 text-[11px] font-medium text-[#FAF5EF]/65">
                  <MapPinIcon className="h-3.5 w-3.5" /> Dubai Design District, UAE
                </p>
              </div>
              <ul className="mt-5 flex items-center gap-2" aria-label="Social media">
                {[
                  { label: "Instagram", href: "https://instagram.com", icon: SparkleIcon },
                  { label: "Pinterest", href: "https://pinterest.com", icon: LeafIcon },
                  { label: "TikTok", href: "https://tiktok.com", icon: DaisyIcon },
                ].map(({ label, href, icon: SocialIcon }) => (
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

            {/* NEW: Contact Us Column */}
            <nav aria-label="Contact Us">
              <h3 className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#FAF5EF]/50">Contact Us</h3>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <button
                    type="button"
                    className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF] w-full text-left"
                    data-policy="return"
                  >
                    Return & Exchange Policy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="link-underline text-[11px] font-medium text-[#FAF5EF]/65 transition-colors duration-300 hover:text-[#FAF5EF] w-full text-left"
                    data-policy="shipping"
                  >
                    Shipping Policy
                  </button>
                </li>
              </ul>
            </nav>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#4A0E17]/20 py-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#FAF5EF]/55">
              © 2026 Sabr by Simran. All rights reserved.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.14em] text-[#FAF5EF]/50">
              <span className="flex items-center gap-1.5"><FlamingoMark className="h-4 w-4" /> Dubai, UAE</span>
              <span aria-hidden="true">·</span>
              <span>Prices in {currency}</span>
              <span aria-hidden="true">·</span>
              <a
                href="/"
                aria-label="Back to top"
                className="inline-flex items-center gap-1 text-[#FAF5EF]/60 transition hover:text-[#FAF5EF]"
              >
                Back to top <ArrowUpRight className="h-3 w-3 -rotate-45" />
              </a>
            </div>
          </div>
        </Reveal>
      </footer>

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
                navigate("/checkout");
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
            <CheckIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}