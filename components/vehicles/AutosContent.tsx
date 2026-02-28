"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal } from "lucide-react";
import type { Vehicle, VehicleBody } from "@/lib/vehicles";
import VehicleFilter, { type FilterState } from "./VehicleFilter";
import VehicleGrid from "./VehicleGrid";
import VehicleCard from "./VehicleCard";

const VALID_BODIES: VehicleBody[] = ["Cabriolet", "Coupé", "Kombi", "Limousine", "SUV", "Van"];

interface AutosContentProps {
  vehicles: Vehicle[];
  initialMake?: string;
  initialBody?: string;
}

export default function AutosContent({ vehicles, initialMake = "", initialBody = "" }: AutosContentProps) {
  const validMakes = useMemo(() => vehicles.map((v) => v.make), [vehicles]);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    make: (initialMake && validMakes.includes(initialMake)) ? initialMake : "Alle Marken",
    priceMax: "",
    body: (VALID_BODIES.includes(initialBody as VehicleBody) ? initialBody : "") as VehicleBody | "",
    sort: "default",
  });

  const filtered = useMemo(() => {
    let result = vehicles.filter((v) => {
      const query = filters.search.toLowerCase();
      if (query && !v.make.toLowerCase().includes(query) &&
          !v.model.toLowerCase().includes(query) &&
          !(v.variant ?? "").toLowerCase().includes(query)) return false;
      if (filters.make !== "Alle Marken" && v.make !== filters.make) return false;
      if (filters.priceMax && v.price > parseInt(filters.priceMax)) return false;
      if (filters.body && v.body !== filters.body) return false;
      return true;
    });

    switch (filters.sort) {
      case "price_asc":   result = [...result].sort((a, b) => a.price - b.price); break;
      case "price_desc":  result = [...result].sort((a, b) => b.price - a.price); break;
      case "mileage_asc": result = [...result].sort((a, b) => a.mileage - b.mileage); break;
      case "year_desc":   result = [...result].sort((a, b) => b.year - a.year); break;
    }
    return result;
  }, [filters, vehicles]);

  // Ähnliche Fahrzeuge wenn kein Ergebnis — Scoring nach Übereinstimmung mit aktiven Filtern
  const suggestions = useMemo(() => {
    if (filtered.length > 0) return [];

    const scored = vehicles.map((v) => {
      let score = 0;
      if (filters.make !== "Alle Marken" && v.make === filters.make) score += 3;
      if (filters.body && v.body === filters.body) score += 2;
      if (filters.priceMax) {
        const max = parseInt(filters.priceMax);
        if (v.price <= max * 1.4) score += 1;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (v.make.toLowerCase().includes(q) || v.model.toLowerCase().includes(q)) score += 3;
      }
      return { v, score };
    });

    const top = scored
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ v }) => v);

    // Fallback: einfach die ersten 3 Fahrzeuge
    return top.length > 0 ? top : vehicles.slice(0, 3);
  }, [filtered, filters, vehicles]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <VehicleFilter
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
        vehicles={vehicles}
      />
      {filtered.length === 0 ? (
        <div className="py-14">
          {/* Message */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-14 h-14 rounded-full bg-ct-light flex items-center justify-center mb-5">
              <SlidersHorizontal size={22} className="text-ct-cyan" />
            </div>
            <h3 className="text-xl font-extrabold mb-2 text-ct-dark">
              Kein passendes Fahrzeug gefunden
            </h3>
            <p className="text-[#6b7280] text-sm max-w-sm leading-relaxed">
              Für Ihre Suche haben wir aktuell kein exaktes Match —
              aber unser Lager dreht sich schnell. Schauen Sie sich diese
              Alternativen an oder melden Sie sich direkt bei uns.
            </p>
            <button
              type="button"
              onClick={() => setFilters({ search: "", make: "Alle Marken", priceMax: "", body: "", sort: "default" })}
              className="mt-6 px-5 py-2.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity bg-ct-cyan"
            >
              Alle Fahrzeuge anzeigen
            </button>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 border-t border-[#f0f0f0]" />
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ct-cyan whitespace-nowrap">
                  Das könnte Sie interessieren
                </p>
                <div className="flex-1 border-t border-[#f0f0f0]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {suggestions.map((v) => (
                  <VehicleCard key={v.id} vehicle={v} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <VehicleGrid vehicles={filtered} />
      )}
    </div>
  );
}
