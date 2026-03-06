"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calculator, Leaf, ArrowRight, Plus, Trash2 } from "lucide-react";
import type { Vehicle } from "@/lib/vehicles";
import { formatCHF } from "@/lib/utils";
import {
  calculateFleetPenalty,
  CO2_TARGET,
  type FleetVehicle,
  type Co2Result,
} from "@/lib/co2";

/* ── Props ─────────────────────────────────────────────────── */
interface Props {
  lowEmissionVehicles: Vehicle[];
}

/* ── Component ─────────────────────────────────────────────── */
export default function Co2Calculator({ lowEmissionVehicles }: Props) {
  /* Mode toggle */
  const [mode, setMode] = useState<"simple" | "detail">("simple");

  /* Simple mode state */
  const [count, setCount] = useState(10);
  const [avgCo2, setAvgCo2] = useState(145);

  /* Detail mode state */
  const [detailVehicles, setDetailVehicles] = useState<FleetVehicle[]>([
    { label: "Fahrzeug 1", co2: 145 },
    { label: "Fahrzeug 2", co2: 160 },
    { label: "Fahrzeug 3", co2: 130 },
  ]);

  /* ── Compute result ───────────────────────────────────────── */
  const result: Co2Result = useMemo(() => {
    if (mode === "simple") {
      const vehicles: FleetVehicle[] = Array.from({ length: count }, (_, i) => ({
        label: `Fahrzeug ${i + 1}`,
        co2: avgCo2,
      }));
      return calculateFleetPenalty(vehicles);
    }
    return calculateFleetPenalty(detailVehicles);
  }, [mode, count, avgCo2, detailVehicles]);

  /* ── Optimized result (replace worst vehicles with CT24 low-emission) ── */
  const optimized = useMemo(() => {
    if (result.excess <= 0 || lowEmissionVehicles.length === 0) return null;

    // Build the fleet
    const fleet: FleetVehicle[] =
      mode === "simple"
        ? Array.from({ length: count }, (_, i) => ({
            label: `Fahrzeug ${i + 1}`,
            co2: avgCo2,
          }))
        : [...detailVehicles];

    // Sort descending by CO2 to find worst
    fleet.sort((a, b) => b.co2 - a.co2);

    // Replace up to 3 worst with top CT24 vehicles
    const replacements = Math.min(3, fleet.length, lowEmissionVehicles.length);
    const optimizedFleet = [...fleet];
    for (let i = 0; i < replacements; i++) {
      const v = lowEmissionVehicles[i];
      if (v.co2 && v.co2 < optimizedFleet[i].co2) {
        optimizedFleet[i] = {
          label: `${v.make} ${v.model}`,
          co2: v.co2,
        };
      }
    }

    const optimizedResult = calculateFleetPenalty(optimizedFleet);
    const savings = result.totalPenalty - optimizedResult.totalPenalty;
    return savings > 0 ? { result: optimizedResult, savings } : null;
  }, [result, mode, count, avgCo2, detailVehicles, lowEmissionVehicles]);

  /* ── Detail handlers ──────────────────────────────────────── */
  function addVehicle() {
    setDetailVehicles((prev) => [
      ...prev,
      { label: `Fahrzeug ${prev.length + 1}`, co2: 140 },
    ]);
  }

  function removeVehicle(index: number) {
    setDetailVehicles((prev) => prev.filter((_, i) => i !== index));
  }

  function updateVehicleCo2(index: number, co2: number) {
    setDetailVehicles((prev) =>
      prev.map((v, i) => (i === index ? { ...v, co2 } : v))
    );
  }

  function updateVehicleLabel(index: number, label: string) {
    setDetailVehicles((prev) =>
      prev.map((v, i) => (i === index ? { ...v, label } : v))
    );
  }

  /* ── Render ───────────────────────────────────────────────── */
  return (
    <div className="space-y-8">
      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("simple")}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200"
          style={{
            backgroundColor: mode === "simple" ? "var(--ct-cyan)" : "var(--ct-light)",
            color: mode === "simple" ? "#fff" : "var(--ct-dark)",
          }}
        >
          Einfach
        </button>
        <button
          onClick={() => setMode("detail")}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200"
          style={{
            backgroundColor: mode === "detail" ? "var(--ct-cyan)" : "var(--ct-light)",
            color: mode === "detail" ? "#fff" : "var(--ct-dark)",
          }}
        >
          Detailliert
        </button>
      </div>

      {/* ── Simple mode inputs ──────────────────────────────── */}
      {mode === "simple" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--ct-dark)" }}
            >
              Anzahl Fahrzeuge
            </label>
            <input
              type="number"
              min={1}
              max={500}
              value={count}
              onChange={(e) =>
                setCount(Math.max(1, Math.min(500, Number(e.target.value) || 1)))
              }
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[var(--ct-cyan)] focus:border-transparent"
            />
            <p className="text-xs text-[#9ca3af] mt-1">1 bis 500 Fahrzeuge</p>
          </div>
          <div>
            <label
              className="block text-sm font-semibold mb-2"
              style={{ color: "var(--ct-dark)" }}
            >
              Durchschnittlicher CO2-Ausstoss (g/km)
            </label>
            <input
              type="number"
              min={0}
              max={400}
              value={avgCo2}
              onChange={(e) =>
                setAvgCo2(Math.max(0, Math.min(400, Number(e.target.value) || 0)))
              }
              className="w-full rounded-lg border border-[#e5e7eb] px-4 py-3 text-sm
                         focus:outline-none focus:ring-2 focus:ring-[var(--ct-cyan)] focus:border-transparent"
            />
            <p className="text-xs text-[#9ca3af] mt-1">
              ASTRA-Zielwert 2025: {CO2_TARGET} g/km
            </p>
          </div>
        </div>
      )}

      {/* ── Detail mode inputs ──────────────────────────────── */}
      {mode === "detail" && (
        <div className="space-y-3">
          {detailVehicles.map((v, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg border border-[#e5e7eb] bg-white"
            >
              <input
                type="text"
                value={v.label}
                onChange={(e) => updateVehicleLabel(i, e.target.value)}
                className="flex-1 rounded-md border border-[#e5e7eb] px-3 py-2 text-sm
                           focus:outline-none focus:ring-2 focus:ring-[var(--ct-cyan)]"
                placeholder="Bezeichnung"
              />
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={400}
                  value={v.co2}
                  onChange={(e) =>
                    updateVehicleCo2(
                      i,
                      Math.max(0, Math.min(400, Number(e.target.value) || 0))
                    )
                  }
                  className="w-20 rounded-md border border-[#e5e7eb] px-3 py-2 text-sm text-center
                             focus:outline-none focus:ring-2 focus:ring-[var(--ct-cyan)]"
                />
                <span className="text-xs text-[#9ca3af]">g/km</span>
              </div>
              {detailVehicles.length > 1 && (
                <button
                  onClick={() => removeVehicle(i)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-[#9ca3af] hover:text-red-500 transition-colors"
                  aria-label="Fahrzeug entfernen"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addVehicle}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg
                       hover:bg-[var(--ct-light)] transition-colors"
            style={{ color: "var(--ct-cyan)" }}
          >
            <Plus size={16} />
            Fahrzeug hinzufuegen
          </button>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────── */}
      <div
        className="rounded-xl p-6 border"
        style={{
          borderColor: result.excess > 0 ? "#fbbf24" : "var(--ct-green)",
          backgroundColor: result.excess > 0 ? "#fffbeb" : "#f0fdf4",
        }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Calculator size={20} style={{ color: "var(--ct-dark)" }} />
          <h3 className="font-bold text-lg" style={{ color: "var(--ct-dark)" }}>
            Ergebnis
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ResultCard
            label="Flotten-Durchschnitt"
            value={`${result.fleetAverage} g/km`}
            highlight={result.fleetAverage > CO2_TARGET}
          />
          <ResultCard
            label="Zielwert 2025"
            value={`${result.target} g/km`}
          />
          <ResultCard
            label="Ueberschreitung"
            value={`${result.excess} g/km`}
            highlight={result.excess > 0}
          />
          <ResultCard
            label="CO2-Strafe Total"
            value={`CHF ${formatCHF(result.totalPenalty)}`}
            highlight={result.totalPenalty > 0}
            large
          />
        </div>

        {result.excess > 0 && result.vehicleCount > 0 && (
          <p className="text-sm text-[#6b7280] mt-3">
            = CHF {formatCHF(result.penaltyPerVehicle)} Strafe pro Fahrzeug
            &times; {result.vehicleCount} Fahrzeuge
          </p>
        )}

        {result.excess === 0 && result.vehicleCount > 0 && (
          <p className="text-sm mt-3" style={{ color: "var(--ct-green)" }}>
            Ihre Flotte liegt innerhalb des ASTRA-Zielwerts. Keine Sanktion.
          </p>
        )}
      </div>

      {/* ── Optimization suggestion ─────────────────────────── */}
      {result.excess > 0 && lowEmissionVehicles.length > 0 && (
        <div className="rounded-xl border border-[#e5e7eb] bg-white p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Leaf size={20} style={{ color: "var(--ct-green)" }} />
            <h3 className="font-bold text-lg" style={{ color: "var(--ct-dark)" }}>
              So reduzieren Sie Ihre Strafe
            </h3>
          </div>

          <p className="text-sm text-[#6b7280] leading-relaxed">
            Durch den Einkauf emissionsarmer Fahrzeuge senken Sie Ihren Flottendurchschnitt
            und reduzieren die CO2-Sanktion erheblich. Hier {lowEmissionVehicles.length >= 3 ? "drei" : "unsere"} Empfehlungen:
          </p>

          {/* Vehicle recommendation cards with impact */}
          <div className="space-y-3">
            {lowEmissionVehicles.slice(0, 3).map((v, idx) => {
              // Calculate impact of adding this single vehicle
              const currentFleet: FleetVehicle[] =
                mode === "simple"
                  ? Array.from({ length: count }, (_, i) => ({ label: `Fahrzeug ${i + 1}`, co2: avgCo2 }))
                  : [...detailVehicles];
              const withNew = [...currentFleet, { label: `${v.make} ${v.model}`, co2: v.co2 ?? 0 }];
              const newResult = calculateFleetPenalty(withNew);
              const savingsIfAdded = result.totalPenalty - newResult.totalPenalty;

              const hasImage = v.image && v.image.startsWith("http");

              return (
                <Link
                  key={v.id}
                  href={`/autos/${v.id}`}
                  className="flex items-center gap-4 rounded-lg border border-[#e5e7eb] p-4 hover:shadow-md transition-shadow"
                >
                  {hasImage && (
                    <div className="relative w-20 h-16 rounded-lg overflow-hidden bg-[#f4f6f8] shrink-0">
                      <Image
                        src={v.image}
                        alt={`${v.make} ${v.model}`}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  )}
                  {!hasImage && (
                    <div className="w-20 h-16 rounded-lg bg-[#f4f6f8] shrink-0 flex items-center justify-center">
                      <Leaf size={20} style={{ color: "var(--ct-green)" }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate" style={{ color: "var(--ct-dark)" }}>
                      {v.make} {v.model} {v.variant ?? ""}
                    </p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-[#6b7280] mt-0.5">
                      <span>{v.co2 === 0 ? "Elektro (0 g/km)" : `${v.co2} g/km CO2`}</span>
                      <span>CHF {formatCHF(v.price)}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {savingsIfAdded > 0 ? (
                      <>
                        <p className="text-sm font-bold" style={{ color: "var(--ct-green)" }}>
                          &minus; CHF {formatCHF(savingsIfAdded)}
                        </p>
                        <p className="text-[10px] text-[#9ca3af]">Straf-Reduktion</p>
                      </>
                    ) : (
                      <p className="text-xs text-[#9ca3af]">Kein Effekt</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Before / After summary */}
          {optimized && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg p-4 border border-red-200 bg-red-50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400 mb-1">Aktuell</p>
                <p className="text-lg font-bold text-red-600">CHF {formatCHF(result.totalPenalty)}</p>
                <p className="text-xs text-[#6b7280]">
                  {result.fleetAverage} g/km &middot; {result.vehicleCount} Fzg.
                </p>
              </div>
              <div className="rounded-lg p-4 border border-green-200 bg-green-50">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-green-500 mb-1">
                  Nach Optimierung
                </p>
                <p className="text-lg font-bold" style={{ color: "var(--ct-green)" }}>
                  CHF {formatCHF(optimized.result.totalPenalty)}
                </p>
                <p className="text-xs text-[#6b7280]">
                  {optimized.result.fleetAverage} g/km &middot; Ersparnis:{" "}
                  <strong className="text-green-600">CHF {formatCHF(optimized.savings)}</strong>
                </p>
              </div>
            </div>
          )}

          <Link
            href="/kontakt?subject=CO2-Flottenberatung"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold
                       text-white transition-opacity duration-200 hover:opacity-90"
            style={{ backgroundColor: "var(--ct-cyan)" }}
          >
            Kostenlose Flottenberatung anfragen
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}

/* ── ResultCard sub-component ──────────────────────────────── */
function ResultCard({
  label,
  value,
  highlight = false,
  large = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  large?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-xs text-[#6b7280] mb-1">{label}</p>
      <p
        className={`font-bold ${large ? "text-xl" : "text-lg"}`}
        style={{ color: highlight ? "#dc2626" : "var(--ct-dark)" }}
      >
        {value}
      </p>
    </div>
  );
}
