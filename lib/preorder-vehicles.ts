import { cache } from "react";
import { fetchSheet } from "@/lib/google-sheets";
import type { Vehicle, VehicleBody } from "@/lib/vehicles";

const VALID_BODIES: VehicleBody[] = [
  "Limousine",
  "SUV",
  "Kombi",
  "Cabriolet",
  "Van",
  "Coup\u00e9",
];

export const fetchPreorderVehicles = cache(
  async function fetchPreorderVehiclesImpl(): Promise<Vehicle[]> {
    const rows = await fetchSheet("Vorbestellungen");
    if (!rows.length) return [];

    return rows
      .filter((r) => r.status === "aktiv")
      .map((r, i) => {
        const body = VALID_BODIES.includes(r.karosserie as VehicleBody)
          ? (r.karosserie as VehicleBody)
          : undefined;

        return {
          id: 9000 + i,
          make: r.marke || "Unbekannt",
          model: r.modell || "",
          variant: r.variante || "",
          year: parseInt(r.jahrgang, 10) || new Date().getFullYear(),
          mileage: parseInt(r.km, 10) || 0,
          power: parseInt(r.ps, 10) || 0,
          transmission: r.getriebe || "Automatik",
          fuel: r.treibstoff || undefined,
          price: parseInt(r.preis, 10) || 0,
          leasingPrice: 0,
          image: r.bild || "/images/placeholder-car.jpg",
          body,
          description: r.beschreibung || undefined,
          preorder: true,
        } satisfies Vehicle;
      });
  }
);
