"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/data/site";
import { buildCheckoutUrl } from "@/lib/format";
import { getDefaultProduct } from "@/data/site";

const navItems = [
  { label: "Benefits", id: "benefits" },
  { label: "Ingredients", id: "ingredients" },
  { label: "Gallery", id: "gallery" },
  { label: "Reviews", id: "reviews" },
  { label: "FAQs", id: "faqs" },
];

export function SiteHeader() {
  const router = useRouter();
  const defaultProduct = getDefaultProduct();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/65 backdrop-blur-2xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex items-center text-left"
          aria-label={`${siteConfig.brandName} home`}
        >
          <div className="relative h-10 w-[130px] overflow-hidden rounded-2xl bg-transparent sm:h-12 sm:w-[170px]">
            <Image
              src={siteConfig.logoSrc}
              alt={siteConfig.logoAlt}
              fill
              sizes="(max-width: 640px) 130px, 170px"
              className="object-contain object-left"
              priority
            />
          </div>
        </button>

        <nav className="hidden items-center gap-1 rounded-full border border-white/80 bg-white/75 px-2 py-2 shadow-[0_18px_50px_rgba(120,53,15,0.08)] lg:flex">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => scrollTo(item.id)}
              className="rounded-full px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-amber-50 hover:text-slate-950"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              router.push(
                buildCheckoutUrl({
                  productId: defaultProduct.id,
                  productName: defaultProduct.name,
                  flavor: defaultProduct.flavor,
                  quantity: 1,
                  pricePerPiece: defaultProduct.price,
                  deliveryFee: siteConfig.delivery.normalFee,
                })
              )
            }
            className="rounded-full bg-gradient-to-r from-[#f28c28] to-[#ffb84c] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_35px_rgba(242,140,40,0.3)] transition hover:-translate-y-0.5"
          >
            Order Now
          </button>
        </div>
      </div>
    </header>
  );
}
