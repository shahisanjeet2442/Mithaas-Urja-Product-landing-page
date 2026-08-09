"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/animated-counter";
import { FaqAccordion } from "@/components/faq-accordion";
import { ProductCarousel } from "@/components/product-carousel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig, getProductById } from "@/data/site";
import { buildCheckoutUrl, calculatePricing, formatCurrency, getDeliveryFee } from "@/lib/format";
import { useRouter } from "next/navigation";

function FeatureGlyph({ kind }: { kind: string }) {
  const common = "h-6 w-6";

  switch (kind) {
    case "organic":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path d="M12 3c4.5 0 8 3.5 8 8s-3.5 8-8 8-8-3.5-8-8 3.5-8 8-8Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 12c2.2-4.5 5.3-6.8 9-7-1.2 3.8-3.5 6.7-7 8.7-1.1.6-2.2 1.1-3.6 1.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "energy":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path d="M13 2 5 14h6l-1 8 9-12h-6l0-8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case "fruit":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path d="M12 20c-4.4 0-8-3.4-8-7.8 0-2.8 1.5-5.1 3.9-6.5C9 4.4 10.7 4 12 4s3 .4 4.1 1.1C18.5 6.4 20 8.7 20 12.2 20 16.6 16.4 20 12 20Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M12 4c0-1.6.8-2.7 2.6-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path d="M12 3 19 6v5c0 4.8-3 8.6-7 10-4-1.4-7-5.2-7-10V6l7-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="m9.5 12 1.9 1.9L15 10.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "cod":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path d="M4 7h16v10H4z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7 11h3M14 11h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "truck":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path d="M3 7h11v10H3z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M14 10h4l3 3v4h-7V10Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="7" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="17" cy="18" r="1.8" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "fresh":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path d="M12 3c4 3 7 7 7 11a7 7 0 1 1-14 0c0-4 3-8 7-11Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9.5 12.5c1.4 0 2.6-1 3.1-2.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "made-in-nepal":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common} aria-hidden="true">
          <path d="M4 19V5l6 3 6-3 4 2v14l-4-2-6 3-6-3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M10 8h4M9.2 11h5.6M8.4 14h7.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#2d6a4f]">{eyebrow}</p>
      <h2 className="mt-4 font-[family-name:var(--font-dm-serif)] text-4xl leading-tight text-slate-900 sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-lg leading-8 text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}

function StarRow() {
  return (
    <div className="flex items-center gap-1 text-amber-400" aria-label="5 star rating">
      {Array.from({ length: 5 }).map((_, index) => (
        <span key={index}>★</span>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const [selectedProductId, setSelectedProductId] = useState<string>(siteConfig.defaultProductId);
  const [quantity, setQuantity] = useState(1);

  const selectedProduct = getProductById(selectedProductId);
  const pricing = useMemo(
    () => calculatePricing(quantity, selectedProduct.price, siteConfig.delivery.normalFee),
    [quantity, selectedProduct.price]
  );

  const deliveryMessage =
    pricing.deliveryFee === 0
      ? siteConfig.delivery.freeDeliveryMessage
      : siteConfig.delivery.standardDeliveryMessage(
          Math.max(1, siteConfig.delivery.freeDeliveryThreshold - quantity)
        );

  const goToCheckout = () => {
    router.push(
      buildCheckoutUrl({
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        flavor: selectedProduct.flavor,
        quantity,
        pricePerPiece: selectedProduct.price,
        deliveryFee: getDeliveryFee(quantity),
      })
    );
  };

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const productTabs = siteConfig.products;
  const testimonialsMarquee = [...siteConfig.testimonials, ...siteConfig.testimonials];

  return (
    <main className="overflow-x-hidden bg-[#fff9f4] text-[#2d2d2d]">
      <div id="top" />
      <SiteHeader />

      <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,184,76,0.3),transparent_28%),radial-gradient(circle_at_85%_0%,rgba(45,106,79,0.15),transparent_26%),linear-gradient(180deg,#fff9f4_0%,#fffaf7_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.8),transparent_40%,rgba(255,255,255,0.2))]" />
        <div className="absolute left-[-8%] top-16 h-72 w-72 rounded-full bg-orange-300/25 blur-3xl" />
        <div className="absolute right-[-4%] top-24 h-80 w-80 rounded-full bg-emerald-300/20 blur-3xl" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-4 py-14 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center"
          >
            <div className="mb-6 flex flex-wrap items-center gap-3">
              {siteConfig.trustPoints.slice(0, 4).map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-white/80 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur"
                >
                  {point}
                </span>
              ))}
            </div>

            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.36em] text-amber-700">
              {siteConfig.parentCompany}
            </p>
            <h1 className="max-w-3xl font-[family-name:var(--font-dm-serif)] text-5xl leading-[0.95] tracking-tight text-[#2d2d2d] sm:text-6xl lg:text-[72px]">
              {siteConfig.heroHeadline}
              <span className="mt-5 block text-[#f28c28]">{siteConfig.sloganEnglish}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-slate-600 sm:text-[24px]">
              {siteConfig.heroSubheadline}
            </p>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              {siteConfig.productDescription}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <motion.button
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={goToCheckout}
                className="rounded-full bg-gradient-to-r from-[#f28c28] to-[#ffb84c] px-7 py-4 text-base font-semibold text-white shadow-[0_20px_50px_rgba(242,140,40,0.35)] transition"
              >
                Order Now
              </motion.button>
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollTo("gallery")}
                className="rounded-full border border-emerald-200 bg-white px-7 py-4 text-base font-semibold text-[#2d6a4f] shadow-sm transition hover:bg-emerald-50"
              >
                Learn More
              </motion.button>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {siteConfig.stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5 }}
                  className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-[0_16px_40px_rgba(120,53,15,0.08)] backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{stat.label}</p>
                  <p className="mt-2 font-[family-name:var(--font-dm-serif)] text-3xl text-slate-900">
                    {typeof stat.value === "number" && stat.value % 1 !== 0 ? (
                      <AnimatedCounter value={stat.value} />
                    ) : (
                      <AnimatedCounter value={stat.value as number} suffix={stat.label.includes("Rating") ? "" : "+"} />
                    )}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08 }}
            className="relative flex items-center justify-center"
          >
            <div className="absolute inset-14 rounded-full bg-amber-200/40 blur-3xl" />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-full max-w-[34rem]"
            >
              <div className="rounded-[36px] border border-white/80 bg-white/70 p-4 shadow-[0_40px_100px_rgba(45,106,79,0.14)] backdrop-blur-xl">
                <div className="rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,240,0.85))] p-4">
                  <div className="relative overflow-hidden rounded-[28px]">
                    <Image
                      src={selectedProduct.image}
                      alt={`${selectedProduct.name} ${selectedProduct.flavor}`}
                      width={1400}
                      height={1600}
                      priority
                      className="h-auto w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_30%,rgba(0,0,0,0.12)_100%)]" />
                    <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/85 px-3 py-1 text-xs font-semibold text-slate-900 backdrop-blur">
                      {selectedProduct.badge}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 rounded-[24px] border border-white/60 bg-slate-950/72 p-4 text-white backdrop-blur-md">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.28em] text-amber-200">
                            Selected product
                          </p>
                          <p className="mt-2 text-2xl font-semibold">{selectedProduct.name}</p>
                          <p className="mt-1 text-sm text-white/80">{selectedProduct.flavor}</p>
                        </div>
                        <div className="rounded-2xl bg-white/10 px-4 py-3 text-right">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/70">Price</p>
                          <p className="mt-1 text-2xl font-semibold">
                            {formatCurrency(selectedProduct.price)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-8">
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 sm:px-6 lg:grid-cols-4 lg:px-8">
          {siteConfig.trustPoints.map((point) => (
            <motion.div
              key={point}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-[24px] border border-amber-100 bg-gradient-to-br from-white to-amber-50 p-5 shadow-[0_14px_32px_rgba(120,53,15,0.07)]"
            >
              <p className="text-sm font-semibold text-slate-900">{point}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-[#fff5eb] py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Shop by flavor"
            title="Choose your bottle, then fine-tune the quantity before checkout."
            description="The page now behaves like a premium D2C storefront: the selected product updates everywhere, pricing is transparent, and the order flow stays conversion-first."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {productTabs.map((product, index) => {
              const active = product.id === selectedProduct.id;
              return (
                <motion.button
                  key={product.id}
                  type="button"
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  whileHover={{ y: -6 }}
                  onClick={() => setSelectedProductId(product.id)}
                  className={`group rounded-[28px] border p-4 text-left shadow-[0_18px_45px_rgba(45,106,79,0.08)] transition ${
                    active
                      ? "border-[#f28c28] bg-white ring-4 ring-[#ffb84c]/20"
                      : "border-white/90 bg-white/85"
                  }`}
                >
                  <div className="overflow-hidden rounded-[22px] bg-[#fff9f4]">
                    <Image
                      src={product.image}
                      alt={`${product.name} ${product.flavor}`}
                      width={800}
                      height={900}
                      className="h-auto w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">{product.badge}</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-900">{product.flavor}</h3>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                      {product.stockStatus}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{product.description}</p>
                  <p className="mt-4 text-sm font-semibold text-[#2d6a4f]">
                    {formatCurrency(product.price)} per {siteConfig.bottleSize}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      </section>

      <section id="gallery" className="bg-[#f8fff5] py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
          >
            <ProductCarousel images={siteConfig.galleryImages} productName={selectedProduct.name} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            className="rounded-[34px] border border-emerald-100 bg-white/90 p-7 shadow-[0_24px_60px_rgba(45,106,79,0.08)] backdrop-blur"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#2d6a4f]">
              Product showcase
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-dm-serif)] text-4xl leading-tight text-slate-900">
              {selectedProduct.name} {selectedProduct.flavor}
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">{selectedProduct.description}</p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-amber-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Price per bottle</p>
                <p className="mt-2 text-3xl font-semibold text-[#2d6a4f]">
                  {formatCurrency(selectedProduct.price)}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{siteConfig.bottleSize}</p>
              </div>
              <div className="rounded-[24px] bg-emerald-50 p-5">
                <p className="text-sm font-semibold text-slate-900">Offer</p>
                <p className="mt-2 text-xl font-semibold text-emerald-900">
                  {siteConfig.discountRules[0].label}
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">Free delivery on 4+ bottles.</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 rounded-[30px] border border-amber-100 bg-[#fffaf5] p-5 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                    className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-200 bg-white text-xl font-semibold text-[#2d6a4f] transition hover:bg-amber-50"
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
                    aria-label="Quantity"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-center text-lg font-semibold outline-none focus:border-[#f28c28]"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((current) => Math.min(siteConfig.maxQuantity, current + 1))}
                    className="grid h-12 w-12 place-items-center rounded-2xl border border-amber-200 bg-white text-xl font-semibold text-[#2d6a4f] transition hover:bg-amber-50"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </label>
              <div className="space-y-2">
                <span className="text-sm font-semibold text-slate-700">Total</span>
                <div className="rounded-2xl bg-white px-4 py-3 text-lg font-semibold text-slate-900 shadow-sm">
                  {formatCurrency(pricing.totalPrice)}
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-[28px] border border-amber-100 bg-gradient-to-r from-[#fff6e8] to-[#fffdf6] p-5">
              <p className="text-sm font-semibold text-amber-900">{deliveryMessage}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  Subtotal {formatCurrency(pricing.subtotal)}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  Discount -{formatCurrency(pricing.discount)}
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                  Delivery {pricing.deliveryFee === 0 ? "Free" : formatCurrency(pricing.deliveryFee)}
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={goToCheckout}
                className="rounded-full bg-gradient-to-r from-[#f28c28] to-[#ffb84c] px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(242,140,40,0.3)]"
              >
                Order Now
              </button>
              <button
                type="button"
                onClick={() => scrollTo("benefits")}
                className="rounded-full border border-emerald-200 bg-white px-6 py-4 text-base font-semibold text-[#2d6a4f]"
              >
                Buy Now
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {selectedProduct.benefits.map((benefit) => (
                <div key={benefit} className="rounded-[22px] bg-[#fff9f4] p-4 text-sm leading-7 text-slate-700">
                  {benefit}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {siteConfig.reels.length > 0 ? (
        <section className="bg-white py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Product reels"
              title="Watch the product in a premium phone frame."
              description="Reels are only shown when links are provided, so the section stays lean on launches without video assets."
            />
          </div>
        </section>
      ) : null}

      <section id="benefits" className="bg-white py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why choose Mithaas Urja"
            title="Built to feel premium, trustworthy, and easy to love."
            description="The visual system now balances luxury spacing with clear conversion cues, so the page feels elevated without becoming vague."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {siteConfig.features.map((feature, index) => (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.03 }}
                whileHover={{ y: -6 }}
                className="group rounded-[28px] border border-white/90 bg-white/85 p-6 shadow-[0_18px_45px_rgba(45,106,79,0.08)] transition"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#f28c28] to-[#ffb84c] text-white shadow-lg shadow-orange-200/40">
                  <FeatureGlyph kind={feature.icon} />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fff5eb] py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Benefits"
            title="A thoughtful blend of taste, trust, and everyday convenience."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {siteConfig.benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.05 }}
                className={`grid gap-6 rounded-[36px] p-6 shadow-[0_24px_60px_rgba(45,106,79,0.08)] lg:grid-cols-[0.9fr_1.1fr] ${
                  index % 2 === 0 ? "bg-white" : "bg-[#f8fff5]"
                }`}
              >
                <div className="rounded-[28px] bg-gradient-to-br from-[#f28c28]/15 via-white to-[#2d6a4f]/10 p-6">
                  <div className="rounded-[24px] border border-white/70 bg-white/80 p-5">
                    <p className="text-xs uppercase tracking-[0.28em] text-amber-700">
                      Benefit {index + 1}
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-slate-900">{benefit.title}</h3>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-lg leading-8 text-slate-600">{benefit.description}</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={goToCheckout}
                      className="rounded-full bg-slate-950 px-6 py-4 text-base font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.22)]"
                    >
                      Order Now
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollTo("gallery")}
                      className="rounded-full border border-amber-200 bg-white px-6 py-4 text-base font-semibold text-amber-900"
                    >
                      View Gallery
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f8fff5] py-20">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="rounded-[32px] border border-emerald-100 bg-white p-7 shadow-[0_18px_45px_rgba(45,106,79,0.08)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#2d6a4f]">
                Social proof
              </p>
              <h2 className="mt-4 font-[family-name:var(--font-dm-serif)] text-4xl leading-tight text-slate-900">
                Confidence-building numbers that feel real and premium.
              </h2>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {siteConfig.stats.map((stat) => (
                  <div key={stat.label} className="rounded-[24px] bg-[#fff9f4] p-5">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-900">
                      <AnimatedCounter
                        value={typeof stat.value === "number" ? stat.value : 0}
                        suffix={stat.label.includes("Rating") ? "" : stat.label.includes("Reviews") ? "" : "+"}
                      />
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-8 rounded-[24px] bg-gradient-to-r from-[#f28c28] to-[#ffb84c] p-6 text-white">
                <StarRow />
                <p className="mt-4 text-lg leading-8">
                  Loved by customers who want something fresh, uplifting, and pleasantly premium.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="overflow-hidden rounded-[32px] border border-white/80 bg-white shadow-[0_24px_60px_rgba(120,53,15,0.08)]"
            >
              <div className="px-6 pt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.34em] text-amber-700">
                  Reviews
                </p>
                <h2 className="mt-4 font-[family-name:var(--font-dm-serif)] text-4xl leading-tight text-slate-900">
                  Real voices from happy customers.
                </h2>
              </div>
              <div className="relative mt-8 overflow-hidden pb-6">
                <motion.div
                  animate={{ x: ["0%", "-50%"] }}
                  transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
                  className="flex w-[200%] gap-5 px-6"
                >
                  {testimonialsMarquee.map((testimonial, index) => (
                    <div
                      key={`${testimonial.name}-${index}`}
                      className="w-[320px] shrink-0 rounded-[28px] border border-amber-100 bg-[#fff9f4] p-6 shadow-[0_15px_40px_rgba(120,53,15,0.08)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-sm font-semibold text-white">
                          {testimonial.name
                            .split(" ")
                            .map((part) => part[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div className="min-w-0">
                          <StarRow />
                          <p className="mt-3 text-sm leading-7 text-slate-600">{testimonial.quote}</p>
                          <p className="mt-5 font-semibold text-slate-900">{testimonial.name}</p>
                          <p className="text-sm text-slate-500">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section id="faqs" className="bg-white py-20">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-[#2d6a4f]">
              FAQs
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-dm-serif)] text-4xl leading-tight text-slate-900">
              Answers that remove friction before checkout.
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              The FAQ section keeps the buying experience clear, calm, and trustworthy.
            </p>
          </motion.div>
          <FaqAccordion items={siteConfig.faqs} />
        </div>
      </section>

      <section className="bg-[#2d6a4f] py-20 text-white">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.34em] text-amber-200">
              Final CTA
            </p>
            <h2 className="mt-4 font-[family-name:var(--font-dm-serif)] text-4xl leading-tight sm:text-6xl">
              Bring Mithaas Urja into your everyday routine today.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">
              Premium enough for a luxury brand shelf, friendly enough for direct conversion, and simple enough for Cash On Delivery shoppers.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-[32px] border border-white/15 bg-white/10 p-7 shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl"
          >
            <div className="grid gap-3">
              <button
                type="button"
                onClick={goToCheckout}
                className="rounded-full bg-white px-6 py-4 text-base font-semibold text-[#2d6a4f] shadow-[0_18px_40px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5"
              >
                Order Now
              </button>
              <button
                type="button"
                onClick={() => scrollTo("benefits")}
                className="rounded-full border border-white/20 px-6 py-4 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Buy Now
              </button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[24px] bg-white/10 p-5">
                <p className="text-sm font-semibold text-amber-200">Support</p>
                <p className="mt-2 text-sm text-white/80">{siteConfig.supportEmail}</p>
              </div>
              <div className="rounded-[24px] bg-white/10 p-5">
                <p className="text-sm font-semibold text-amber-200">COD</p>
                <p className="mt-2 text-sm text-white/80">Cash On Delivery ready</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/90 px-4 py-3 shadow-[0_-16px_40px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-[0.28em] text-slate-500">
              {selectedProduct.flavor}
            </p>
            <p className="truncate text-sm font-semibold text-slate-900">
              {formatCurrency(pricing.totalPrice)} · {quantity} bottle{quantity > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1">
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.max(1, current - 1))}
              className="grid h-9 w-9 place-items-center rounded-full text-lg font-semibold text-[#2d6a4f]"
            >
              −
            </button>
            <span className="min-w-6 text-center text-sm font-semibold text-slate-900">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((current) => Math.min(siteConfig.maxQuantity, current + 1))}
              className="grid h-9 w-9 place-items-center rounded-full text-lg font-semibold text-[#2d6a4f]"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={goToCheckout}
            className="rounded-full bg-gradient-to-r from-[#f28c28] to-[#ffb84c] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(242,140,40,0.3)]"
          >
            Order Now
          </button>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}
