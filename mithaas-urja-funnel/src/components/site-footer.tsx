import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/70 bg-[#fff9f4]">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr_0.9fr_0.9fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-[140px] overflow-hidden rounded-2xl bg-transparent sm:h-14 sm:w-[180px]">
              <Image
                src={siteConfig.logoSrc}
                alt={siteConfig.logoAlt}
                fill
                sizes="(max-width: 640px) 140px, 180px"
                className="object-contain object-left"
              />
            </div>
          </div>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">{siteConfig.footer.about}</p>
          <p className="mt-5 text-sm font-medium text-slate-700">{siteConfig.sloganEnglish}</p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-900">
            Quick Links
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li><Link href="/#benefits" className="transition hover:text-slate-950">Benefits</Link></li>
            <li><Link href="/#ingredients" className="transition hover:text-slate-950">Ingredients</Link></li>
            <li><Link href="/#gallery" className="transition hover:text-slate-950">Gallery</Link></li>
            <li><Link href="/#reviews" className="transition hover:text-slate-950">Reviews</Link></li>
            <li><Link href="/#faqs" className="transition hover:text-slate-950">FAQs</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-900">
            Support
          </p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>
              Email:{" "}
              <a href={`mailto:${siteConfig.footer.email}`} className="transition hover:text-slate-950">
                {siteConfig.footer.email}
              </a>
            </li>
            <li>
              Phone:{" "}
              <a href={siteConfig.phoneUrl} className="transition hover:text-slate-950">
                {siteConfig.supportPhone}
              </a>
            </li>
            <li>
              WhatsApp:{" "}
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-slate-950"
              >
                {siteConfig.whatsappNumber}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-900">
            Social
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
            >
              Instagram
            </a>
            <a
              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
              href={siteConfig.facebookUrl}
              target="_blank"
              rel="noreferrer"
            >
              Facebook
            </a>
            <a
              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
              href={siteConfig.emailUrl}
            >
              Email
            </a>
            <a
              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
              href={siteConfig.phoneUrl}
            >
              Call
            </a>
          </div>
          <p className="mt-6 text-sm leading-7 text-slate-500">
            Copyright © {new Date().getFullYear()} {siteConfig.parentCompany}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
