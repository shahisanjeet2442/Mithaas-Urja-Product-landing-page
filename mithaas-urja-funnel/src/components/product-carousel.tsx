"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";

type CarouselImage = {
  src: string;
  alt: string;
};

export function ProductCarousel({
  images,
  productName,
}: {
  images: ReadonlyArray<CarouselImage>;
  productName: string;
}) {
  const [index, setIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const activeImage = images[index];
  const progress = useMemo(() => ((index + 1) / images.length) * 100, [index, images.length]);

  const previous = () => setIndex((current) => (current - 1 + images.length) % images.length);
  const next = () => setIndex((current) => (current + 1) % images.length);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        className="rounded-[34px] border border-white/70 bg-white/75 p-4 shadow-[0_30px_80px_rgba(120,53,15,0.12)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between gap-4 pb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
              Premium gallery
            </p>
            <p className="mt-2 max-w-md text-sm text-slate-600">
              Explore the {productName} can from every angle. Tap any thumbnail for a closer look.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={previous}
              className="grid h-10 w-10 place-items-center rounded-full border border-amber-200 bg-white text-xl text-amber-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-50"
              aria-label="Previous product image"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="grid h-10 w-10 place-items-center rounded-full border border-amber-200 bg-white text-xl text-amber-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-50"
              aria-label="Next product image"
            >
              ›
            </button>
          </div>
        </div>

        <motion.div
          className="relative overflow-hidden rounded-[30px] bg-gradient-to-br from-white via-[#fff7ed] to-[#f8fff6] ring-1 ring-amber-100"
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,184,76,0.22),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(45,106,79,0.12),transparent_30%)]" />
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {images.map((image) => (
              <div key={image.src} className="min-w-full">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(images.findIndex((entry) => entry.src === image.src))}
                  className="relative aspect-[4/5] w-full overflow-hidden"
                  aria-label={`Open ${image.alt}`}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    priority={image.src === activeImage.src}
                    className="object-cover transition duration-700 hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-transparent" />
                </button>
              </div>
            ))}
          </div>

          <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/75 px-3 py-1 text-xs font-semibold text-slate-900 shadow-sm backdrop-blur">
            {index + 1} / {images.length}
          </div>
          <div className="absolute bottom-4 left-4 right-4 h-1 overflow-hidden rounded-full bg-white/55">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </motion.div>

        <div className="mt-4 grid grid-cols-4 gap-3">
          {images.map((image, imageIndex) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setIndex(imageIndex)}
              className={`relative aspect-square overflow-hidden rounded-2xl border transition ${
                imageIndex === index
                  ? "border-orange-500 ring-2 ring-orange-200"
                  : "border-amber-100 hover:-translate-y-0.5 hover:border-amber-300"
              }`}
            >
              <Image src={image.src} alt={image.alt} fill className="object-cover" sizes="96px" />
            </button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence>
        {lightboxIndex !== null ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setLightboxIndex(null)}
            aria-label="Image lightbox"
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 8 }}
              onClick={(event) => event.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_90px_rgba(0,0,0,0.35)]"
            >
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/90 text-xl text-slate-900 shadow-lg"
                aria-label="Close image preview"
              >
                ×
              </button>
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={images[lightboxIndex].src}
                  alt={images[lightboxIndex].alt}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
