"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export function FaqAccordion({
  items,
}: {
  items: ReadonlyArray<{ question: string; answer: string }>;
}) {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-4">
      {items.map((item, index) => {
        const open = index === openIndex;
        return (
          <div
            key={item.question}
            className="overflow-hidden rounded-[28px] border border-amber-100 bg-white/85 shadow-[0_18px_45px_rgba(120,53,15,0.08)]"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? -1 : index)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              aria-expanded={open}
            >
              <span className="text-base font-semibold text-slate-900 sm:text-lg">
                {item.question}
              </span>
              <span
                className={`grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-amber-400 text-xl text-white transition ${
                  open ? "rotate-45" : "rotate-0"
                }`}
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div className="px-6 pb-6 text-sm leading-7 text-slate-600">
                    {item.answer}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
