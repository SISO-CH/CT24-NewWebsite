"use client";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  question: string;
  answer: string;
}

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[#f0f0f0] border border-[#f0f0f0] rounded-xl overflow-hidden">
      {items.map((item, i) => (
        <div key={i}>
          <button
            className="w-full flex items-center justify-between px-6 py-4 text-left gap-4 bg-white hover:bg-ct-light transition-colors"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span className="font-semibold text-sm" style={{ color: "var(--ct-dark)" }}>
              {item.question}
            </span>
            <ChevronDown
              size={16}
              className={`shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
              style={{ color: "var(--ct-cyan)" }}
            />
          </button>
          <div className={`overflow-hidden transition-all duration-200 ${open === i ? "max-h-96" : "max-h-0"}`}>
            <p className="px-6 py-4 text-sm text-[#6b7280] leading-relaxed bg-white">
              {item.answer}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
