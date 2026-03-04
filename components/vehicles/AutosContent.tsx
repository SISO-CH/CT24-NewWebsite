"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, CheckCircle2 } from "lucide-react";
import { trackEvent } from "@/lib/tracking";
import type { Vehicle, VehicleBody } from "@/lib/vehicles";
import VehicleFilter, { type FilterState, DEFAULT_FILTERS } from "./VehicleFilter";
import VehicleGrid from "./VehicleGrid";
import VehicleCard from "./VehicleCard";
import CompareBar from "./CompareBar";
import PriceAlertForm from "@/components/ui/PriceAlertForm";

const VALID_BODIES: VehicleBody[] = ["Cabriolet", "Coupé", "Kombi", "Limousine", "SUV", "Van"];

interface AutosContentProps {
  vehicles: Vehicle[];
  initialMake?: string;
  initialBody?: string;
}

function SourcingMiniForm() {
  const [email, setEmail] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          subject: "Fahrzeug-Sourcing-Anfrage",
          message: `Fahrzeugwunsch: ${desc}\nE-Mail: ${email}`,
        }),
      });
      if (res.ok) {
        trackEvent({ event: "lead_form_submit", form_type: "sourcing", value: 50 });
      }
      setStatus(res.ok ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-2 py-2">
        <CheckCircle2 size={28} style={{ color: "var(--ct-green)" }} />
        <p className="text-sm font-semibold text-ct-dark">Anfrage gesendet!</p>
        <p className="text-xs text-[#6b7280]">Wir melden uns bei Ihnen.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-left">
      <input
        required
        type="email"
        placeholder="Ihre E-Mail-Adresse *"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full h-10 px-3 text-sm border border-[#e5e7eb] rounded-lg
                   focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1
                   focus:ring-[var(--ct-cyan)]/20 transition-colors"
      />
      <textarea
        required
        placeholder="Welches Fahrzeug suchen Sie? (Marke, Modell, Budget…) *"
        rows={3}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg resize-none
                   focus:outline-none focus:border-[var(--ct-cyan)] focus:ring-1
                   focus:ring-[var(--ct-cyan)]/20 transition-colors"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-2.5 rounded-xl text-white text-sm font-semibold
                   hover:opacity-90 transition-opacity disabled:opacity-60"
        style={{ backgroundColor: "var(--ct-cyan)" }}
      >
        {status === "loading" ? "Wird gesendet…" : "Wunschfahrzeug anfragen"}
      </button>
      {status === "error" && (
        <p className="text-xs text-center" style={{ color: "var(--ct-magenta)" }}>
          Fehler. Bitte anrufen: +41 56 618 55 44
        </p>
      )}
    </form>
  );
}

export default function AutosContent({ vehicles, initialMake = "", initialBody = "" }: AutosContentProps) {
  const validMakes = useMemo(() => vehicles.map((v) => v.make), [vehicles]);
  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTERS,
    make: (initialMake && validMakes.includes(initialMake)) ? initialMake : "Alle Marken",
    body: (VALID_BODIES.includes(initialBody as VehicleBody) ? initialBody : "") as VehicleBody | "",
  });

  const filtered = useMemo(() => {
    let result = vehicles.filter((v) => {
      const query = filters.search.toLowerCase();
      if (query && !v.make.toLowerCase().includes(query) &&
          !v.model.toLowerCase().includes(query) &&
          !(v.variant ?? "").toLowerCase().includes(query)) return false;
      if (filters.make !== "Alle Marken" && v.make !== filters.make) return false;
      if (filters.body && v.body !== filters.body) return false;
      if (filters.priceMin && v.price < parseInt(filters.priceMin)) return false;
      if (filters.priceMax && v.price > parseInt(filters.priceMax)) return false;
      if (filters.yearMin && v.year < parseInt(filters.yearMin)) return false;
      if (filters.yearMax && v.year > parseInt(filters.yearMax)) return false;
      if (filters.kmMax && v.mileage > parseInt(filters.kmMax)) return false;
      if (filters.fuel && v.fuel !== filters.fuel) return false;
      if (filters.transmission && v.transmission !== filters.transmission) return false;
      if (filters.color && v.color !== filters.color) return false;
      if (filters.drivetrain && v.drivetrain !== filters.drivetrain) return false;
      if (filters.monthlyRateMax && v.leasingPrice > parseInt(filters.monthlyRateMax)) return false;
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
      if (filters.fuel && v.fuel === filters.fuel) score += 2;
      if (filters.transmission && v.transmission === filters.transmission) score += 1;
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
              onClick={() => setFilters({ ...DEFAULT_FILTERS })}
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

          {/* Sourcing CTA */}
          <div className="mt-10 max-w-lg mx-auto bg-ct-light rounded-2xl p-6 text-center">
            <h4 className="text-lg font-extrabold text-ct-dark mb-2">
              Wir finden Ihr Traumauto!
            </h4>
            <p className="text-sm text-[#6b7280] mb-4 leading-relaxed">
              Beschreiben Sie uns Ihr Wunschfahrzeug — wir suchen aktiv für Sie
              und melden uns, sobald wir einen Treffer haben.
            </p>
            <SourcingMiniForm />
          </div>
        </div>
      ) : (
        <VehicleGrid vehicles={filtered} />
      )}
      <div className="max-w-xl mx-auto mt-8 mb-4">
        <PriceAlertForm filtersJson={JSON.stringify(filters)} />
      </div>
      <CompareBar vehicles={vehicles} />
    </div>
  );
}
