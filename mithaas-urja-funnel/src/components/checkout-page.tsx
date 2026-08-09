"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig, getProductById } from "@/data/site";
import { buildCheckoutUrl, calculatePricing, formatCurrency, getDeliveryFee } from "@/lib/format";

function getNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialProductId = searchParams.get("productId") || siteConfig.defaultProductId;
  const initialQuantity = getNumber(searchParams.get("quantity"), 1);
  const [selectedProductId, setSelectedProductId] = useState(initialProductId);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    alternativePhone: "",
    email: "",
    province: "",
    district: "",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const selectedProduct = getProductById(selectedProductId);
  const pricing = useMemo(
    () => calculatePricing(quantity, selectedProduct.price, siteConfig.delivery.normalFee),
    [quantity, selectedProduct.price]
  );

  const deliveryNote =
    pricing.deliveryFee === 0
      ? siteConfig.delivery.freeDeliveryMessage
      : siteConfig.delivery.standardDeliveryMessage(
          Math.max(1, siteConfig.delivery.freeDeliveryThreshold - quantity)
        );

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    console.info(
      `[checkout] submitting order: ${JSON.stringify({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        flavor: selectedProduct.flavor,
        quantity,
        pricePerPiece: selectedProduct.price,
        subtotal: pricing.subtotal,
        discount: pricing.discount,
        deliveryFee: pricing.deliveryFee,
        totalPrice: pricing.totalPrice,
      })}`
    );

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          productId: selectedProduct.id,
          productName: selectedProduct.name,
          flavor: selectedProduct.flavor,
          quantity,
          pricePerPiece: selectedProduct.price,
          subtotal: pricing.subtotal,
          discount: pricing.discount,
          deliveryFee: pricing.deliveryFee,
          totalPrice: pricing.totalPrice,
          notes: "",
        }),
      });

      const payload = (await response.json()) as
        | { success: true; orderId: string }
        | { success: false; message: string; stage?: string; partialSuccess?: boolean };

      console.info(
        `[checkout] api response: ${JSON.stringify({
          ok: response.ok,
          status: response.status,
          payload,
        })}`
      );

      if (!response.ok || !payload.success) {
        const stageLabel =
          !payload.success && payload.stage ? ` (${payload.stage.replaceAll("_", " ")})` : "";
        throw new Error(
          "message" in payload ? `${payload.message}${stageLabel}` : "Order submission failed."
        );
      }

      router.push(
        `/thank-you?orderId=${encodeURIComponent(payload.orderId)}&productId=${encodeURIComponent(
          selectedProduct.id
        )}&productName=${encodeURIComponent(selectedProduct.name)}&flavor=${encodeURIComponent(
          selectedProduct.flavor
        )}&quantity=${quantity}&totalPrice=${pricing.totalPrice}&paymentMethod=Cash%20On%20Delivery`
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong while submitting the order.";
      setErrorMessage(
        message.includes("fetch failed")
          ? "The order form could not reach the API. Please make sure the Next.js server is running on localhost:3000."
          : message
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="bg-[radial-gradient(circle_at_top_left,rgba(255,184,76,0.16),transparent_30%),linear-gradient(180deg,#fff9f4_0%,#f8fff5_100%)] text-[#2d2d2d]">
      <SiteHeader />

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-[36px] border border-white/70 bg-white/90 p-6 shadow-[0_30px_80px_rgba(120,53,15,0.1)] backdrop-blur-xl sm:p-8"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
              Secure COD Checkout
            </span>
            <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-900">
              {siteConfig.discountRules[0].label}
            </span>
            <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-700">
              Free delivery on 4+
            </span>
          </div>

          <h1 className="mt-6 font-[family-name:var(--font-dm-serif)] text-4xl leading-tight text-slate-900 sm:text-5xl">
            Review your bottle selection and place your COD order.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Your selected product, quantity, and pricing are kept visible throughout the checkout
            flow for a calm, premium, conversion-friendly experience.
          </p>

          <form className="mt-8 space-y-5" onSubmit={submitOrder}>
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Full Name</span>
                <input
                  required
                  value={form.fullName}
                  onChange={(event) => updateField("fullName", event.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-2xl border border-slate-200 bg-[#fffaf7] px-4 py-3 text-sm outline-none transition focus:border-[#f28c28] focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Phone Number</span>
                <input
                  required
                  value={form.phoneNumber}
                  onChange={(event) => updateField("phoneNumber", event.target.value)}
                  placeholder="Enter your phone number"
                  className="w-full rounded-2xl border border-slate-200 bg-[#fffaf7] px-4 py-3 text-sm outline-none transition focus:border-[#f28c28] focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Email Address</span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => updateField("email", event.target.value)}
                  placeholder="Enter your email address"
                  className="w-full rounded-2xl border border-slate-200 bg-[#fffaf7] px-4 py-3 text-sm outline-none transition focus:border-[#f28c28] focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Exact Location</span>
                <input
                  required
                  value={form.location}
                  onChange={(event) => updateField("location", event.target.value)}
                  placeholder="Kindly share your exact location"
                  className="w-full rounded-2xl border border-slate-200 bg-[#fffaf7] px-4 py-3 text-sm outline-none transition focus:border-[#f28c28] focus:bg-white"
                />
              </label>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Alternative Phone</span>
                <input
                  value={form.alternativePhone}
                  onChange={(event) => updateField("alternativePhone", event.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-2xl border border-slate-200 bg-[#fffaf7] px-4 py-3 text-sm outline-none transition focus:border-[#f28c28] focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Province</span>
                <input
                  value={form.province}
                  onChange={(event) => updateField("province", event.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-2xl border border-slate-200 bg-[#fffaf7] px-4 py-3 text-sm outline-none transition focus:border-[#f28c28] focus:bg-white"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">District</span>
                <input
                  value={form.district}
                  onChange={(event) => updateField("district", event.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-2xl border border-slate-200 bg-[#fffaf7] px-4 py-3 text-sm outline-none transition focus:border-[#f28c28] focus:bg-white"
                />
              </label>
            </div>

            <div className="grid gap-5 rounded-[30px] border border-amber-100 bg-[#fff9f4] p-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Product</span>
                <select
                  value={selectedProductId}
                  onChange={(event) => {
                    const next = event.target.value;
                    setSelectedProductId(next);
                    setQuantity(1);
                  }}
                  className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none"
                >
                  {siteConfig.products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.flavor}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-100 bg-white text-xl text-[#2d6a4f] transition hover:bg-amber-50"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <input
                    value={quantity}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value);
                      if (Number.isFinite(nextValue)) {
                        setQuantity(Math.min(siteConfig.maxQuantity, Math.max(1, nextValue)));
                      }
                    }}
                    inputMode="numeric"
                    className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-center text-sm font-medium text-slate-900 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.min(siteConfig.maxQuantity, current + 1))}
                    className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-100 bg-white text-xl text-[#2d6a4f] transition hover:bg-amber-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Price Per Bottle</span>
                <input
                  value={formatCurrency(selectedProduct.price)}
                  readOnly
                  className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none"
                />
              </label>
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Total Price</span>
                <input
                  value={formatCurrency(pricing.totalPrice)}
                  readOnly
                  className="w-full rounded-2xl border border-amber-100 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-full bg-gradient-to-r from-[#f28c28] to-[#ffb84c] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(242,140,40,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Submitting Order..." : "Order Now"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-full border border-emerald-200 bg-white px-7 py-4 text-base font-semibold text-[#2d6a4f] transition hover:bg-emerald-50"
              >
                Back to Home
              </button>
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}
          </form>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="space-y-6 rounded-[36px] border border-white/70 bg-[#2d6a4f] p-6 text-white shadow-[0_30px_80px_rgba(45,106,79,0.22)] sm:p-8"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.34em] text-amber-200">
            Order preview
          </p>
          <h2 className="font-[family-name:var(--font-dm-serif)] text-4xl leading-tight">
            {siteConfig.brandName}
          </h2>
          <p className="text-base leading-8 text-white/80">
            Elegant, secure, and designed to convert high-intent Cash On Delivery customers.
          </p>

          <div className="rounded-[30px] bg-white/8 p-5">
            <div className="flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-white/70">Product</span>
              <span className="font-semibold text-right">{selectedProduct.name}</span>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-white/70">Flavor</span>
              <span className="font-semibold">{selectedProduct.flavor}</span>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-white/70">Quantity</span>
              <span className="font-semibold">{quantity}</span>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-white/70">Subtotal</span>
              <span className="font-semibold">{formatCurrency(pricing.subtotal)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-white/70">Discount</span>
              <span className="font-semibold">-{formatCurrency(pricing.discount)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3">
              <span className="text-white/70">Delivery</span>
              <span className="font-semibold">
                {pricing.deliveryFee === 0 ? "Free" : formatCurrency(pricing.deliveryFee)}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-amber-400/20 px-4 py-3">
              <span className="text-amber-100">Grand Total</span>
              <span className="text-lg font-semibold">{formatCurrency(pricing.totalPrice)}</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
            <p className="text-sm font-semibold text-amber-200">Delivery message</p>
            <p className="mt-3 text-sm leading-7 text-white/80">{deliveryNote}</p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/8 p-5">
            <p className="text-sm font-semibold text-amber-200">Why shoppers trust this page</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-white/80">
              <li>• Clear product pricing and quantity summary.</li>
              <li>• Secure Cash On Delivery checkout flow.</li>
              <li>• Google Sheets and email automation happen after submission.</li>
              <li>• The customer is redirected to the thank you page on success.</li>
            </ul>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                buildCheckoutUrl({
                  productId: selectedProduct.id,
                  productName: selectedProduct.name,
                  flavor: selectedProduct.flavor,
                  quantity: Math.min(siteConfig.maxQuantity, quantity + 1),
                  pricePerPiece: selectedProduct.price,
                  deliveryFee: getDeliveryFee(quantity + 1),
                })
              )
            }
            className="w-full rounded-full border border-white/20 bg-white/10 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/15"
          >
            Increase quantity to {Math.min(siteConfig.maxQuantity, quantity + 1)}
          </button>
        </motion.aside>
      </section>

      <SiteFooter />
    </main>
  );
}
