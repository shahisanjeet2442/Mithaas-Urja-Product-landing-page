"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig, getProductById } from "@/data/site";
import { formatCurrency } from "@/lib/format";

function getNumber(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default function ThankYouPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId") || "Order received";
  const productId = searchParams.get("productId");
  const product = getProductById(productId);
  const productName = searchParams.get("productName") || product.name;
  const flavor = searchParams.get("flavor") || product.flavor;
  const quantity = getNumber(searchParams.get("quantity"), 1);
  const totalPrice = getNumber(searchParams.get("totalPrice"), product.price);
  const paymentMethod = searchParams.get("paymentMethod") || "Cash On Delivery";

  return (
    <main className="bg-[radial-gradient(circle_at_top_left,rgba(45,106,79,0.1),transparent_30%),linear-gradient(180deg,#fff9f4_0%,#f8fff5_100%)] text-[#2d2d2d]">
      <SiteHeader />

      <section className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="rounded-[38px] border border-white/70 bg-white/90 p-7 shadow-[0_30px_80px_rgba(45,106,79,0.12)] backdrop-blur-xl sm:p-10"
        >
          <div className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800">
            Payment method: {paymentMethod}
          </div>
          <h1 className="mt-6 font-[family-name:var(--font-dm-serif)] text-5xl leading-tight text-slate-900 sm:text-6xl">
            Thank you for your order!
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Our sales representative will call you soon to confirm your order.
          </p>
          <p className="mt-3 text-lg leading-8 text-[#2d6a4f]">{siteConfig.sloganEnglish}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] bg-[#fff9f4] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Order ID</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{orderId}</p>
            </div>
            <div className="rounded-[24px] bg-[#fff9f4] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Product</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{productName}</p>
              <p className="mt-1 text-sm text-slate-500">{flavor}</p>
            </div>
            <div className="rounded-[24px] bg-[#fff9f4] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Quantity</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">{quantity}</p>
            </div>
            <div className="rounded-[24px] bg-gradient-to-r from-[#f28c28] to-[#ffb84c] p-5 text-white sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.24em] text-white/80">Total price</p>
              <p className="mt-2 text-4xl font-semibold">{formatCurrency(totalPrice)}</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-full bg-gradient-to-r from-[#f28c28] to-[#ffb84c] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(242,140,40,0.28)]"
            >
              Continue Shopping
            </button>
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="rounded-full border border-emerald-200 bg-white px-6 py-4 text-base font-semibold text-[#2d6a4f]"
            >
              Place Another Order
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="relative overflow-hidden rounded-[38px] border border-emerald-100 bg-[#2d6a4f] p-7 text-white shadow-[0_30px_80px_rgba(45,106,79,0.2)] sm:p-10"
        >
          <div className="absolute right-[-8%] top-[-10%] h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="absolute left-[-12%] bottom-[-12%] h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-amber-200">
              What happens next
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-dm-serif)] text-4xl leading-tight sm:text-5xl">
              Your order is confirmed and your team is already on it.
            </h2>

            <div className="mt-8 rounded-[28px] border border-white/15 bg-white/10 p-6 backdrop-blur-xl">
              <p className="text-sm font-semibold text-amber-200">Estimated delivery</p>
              <p className="mt-3 text-2xl font-semibold">Fast doorstep fulfillment</p>
              <p className="mt-2 text-base leading-8 text-white/80">
                A sales representative will call to confirm the order details and arrange delivery.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white/10 p-5">
                <p className="text-sm font-semibold text-amber-200">Support</p>
                <p className="mt-2 text-sm text-white/80">{siteConfig.supportEmail}</p>
              </div>
              <div className="rounded-[24px] bg-white/10 p-5">
                <p className="text-sm font-semibold text-amber-200">COD</p>
                <p className="mt-2 text-sm text-white/80">Cash On Delivery ready</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <SiteFooter />
    </main>
  );
}
