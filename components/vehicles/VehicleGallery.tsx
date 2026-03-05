"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface VehicleGalleryProps {
  images: string[];
  alt: string;
}

export default function VehicleGallery({ images, alt }: VehicleGalleryProps) {
  const [active, setActive] = useState(0);

  const prev = () => setActive((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActive((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-ct-light group">
        <Image
          src={images[active]}
          alt={`${alt} – Bild ${active + 1}`}
          fill
          className="object-contain transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 65vw"
          priority
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Vorheriges Bild"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80
                         flex items-center justify-center hover:bg-white transition-colors shadow-md
                         opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft size={18} className="text-ct-dark" />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Nächstes Bild"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80
                         flex items-center justify-center hover:bg-white transition-colors shadow-md
                         opacity-0 group-hover:opacity-100"
            >
              <ChevronRight size={18} className="text-ct-dark" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              type="button"
              key={`${src}-${i}`}
              onClick={() => setActive(i)}
              aria-label={`Bild ${i + 1} anzeigen`}
              className={`relative w-20 aspect-[4/3] rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                i === active
                  ? "border-ct-cyan"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`${alt} ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
