// lib/as24.ts
// AutoScout24 Dealer API Client
// Docs: https://api.autoscout24.com (API-Key + Dealer-ID aus .env.local)
//
// WICHTIG: Feldnamen im mapAS24ToVehicle-Adapter ggf. an echte API-Response anpassen.
// API-Response mit curl testen: curl -H "Authorization: Bearer $AS24_API_KEY" \
//   "https://api.autoscout24.com/dealers/$AS24_DEALER_ID/listings" | jq .

import { cache } from "react";
import type { Vehicle, VehicleBody, EnergyLabel } from "@/lib/vehicles";
import { generateSalespitch } from "@/lib/ai";

const API_BASE  = "https://api.autoscout24.com";
const API_KEY   = process.env.AS24_API_KEY;
const DEALER_ID = process.env.AS24_DEALER_ID;

// Roher Typ aus der AS24 API-Response (Feldnamen ggf. anpassen)
interface AS24Listing {
  id: string;
  make: string;
  model: string;
  version?: string;
  year?: number;
  firstRegistration?: string;       // "2021-03" — fallback für year
  mileage?: number;
  power?: number;                    // in PS/HP
  transmission?: string;             // "Automatic" | "Manual"
  fuelType?: string;                 // "Petrol" | "Diesel" | "Electric" | "Hybrid"
  bodyType?: string;                 // "SUV" | "Saloon" | "Estate" etc.
  price?: number;                    // Kaufpreis CHF
  leasingRate?: number;              // Monatliche Leasingrate CHF
  images?: { uri: string }[];
  energyEfficiencyClass?: string;   // "A" | "B" ... "G"
  badge?: string;
  // Detail fields
  equipment?: string[];
  description?: string;
  numberOfDoors?: number;
  numberOfSeats?: number;
  color?: string;
  co2Emission?: number;
  emissionSticker?: string;
  driveType?: string;               // "FWD" | "RWD" | "AWD" | "4WD"
  vehicleCondition?: string;        // "used" | "new" | "demonstration"
  vehicleIdentificationNumber?: string;
  // Phase 3: Media (TODO: verify field names against real API response)
  panorama?:      { uri: string };
  video?:         { uri: string };
  cardossierUrl?: string;
}

// Mapping AS24 bodyType → unsere VehicleBody
const BODY_MAP: Record<string, VehicleBody> = {
  SUV:         "SUV",
  Saloon:      "Limousine",
  Estate:      "Kombi",
  Cabriolet:   "Cabriolet",
  Convertible: "Cabriolet",
  Coupe:       "Coupé",
  MPV:         "Van",
  Van:         "Van",
  Minivan:     "Van",
};

const DRIVETRAIN_MAP: Record<string, string> = {
  FWD: "Frontantrieb",
  RWD: "Heckantrieb",
  AWD: "Allrad",
  "4WD": "Allrad",
};

const CONDITION_MAP: Record<string, string> = {
  used:          "Occasion",
  new:           "Neuwagen",
  demonstration: "Vorführfahrzeug",
};

function mapAS24ToVehicle(listing: AS24Listing, index: number): Vehicle {
  const yearFromDate = listing.firstRegistration
    ? parseInt(listing.firstRegistration.split("-")[0])
    : undefined;

  return {
    id:           index + 1,
    make:         listing.make ?? "Unbekannt",
    model:        listing.model ?? "",
    variant:      listing.version ?? "",
    year:         listing.year ?? yearFromDate ?? new Date().getFullYear(),
    mileage:      listing.mileage ?? 0,
    power:        listing.power ?? 0,
    transmission: listing.transmission === "Automatic" ? "Automat" : "Manuell",
    fuel:         listing.fuelType ?? undefined,
    price:        listing.price ?? 0,
    leasingPrice: listing.leasingRate ?? 0,
    image:        listing.images?.[0]?.uri ?? "/placeholder-car.jpg",
    energyLabel:  (listing.energyEfficiencyClass as EnergyLabel) ?? undefined,
    body:         BODY_MAP[listing.bodyType ?? ""] ?? undefined,
    badge:        listing.badge ?? undefined,
    as24Id:       listing.id,
    // Detail fields
    images:       listing.images?.map((img) => img.uri) ?? [],
    equipment:    listing.equipment ?? [],
    description:  listing.description ?? undefined,
    doors:        listing.numberOfDoors ?? undefined,
    seats:        listing.numberOfSeats ?? undefined,
    color:        listing.color ?? undefined,
    co2:          listing.co2Emission ?? undefined,
    emission:     listing.emissionSticker ?? undefined,
    drivetrain:   DRIVETRAIN_MAP[listing.driveType ?? ""] ?? undefined,
    condition:    CONDITION_MAP[listing.vehicleCondition ?? ""] ?? undefined,
    vin:          listing.vehicleIdentificationNumber ?? undefined,
    imageUrl360:   listing.panorama?.uri,
    videoUrl:      listing.video?.uri,
    cardossierUrl: listing.cardossierUrl,
  };
}

export const fetchVehicles = cache(async function fetchVehiclesImpl(): Promise<Vehicle[]> {
  if (!API_KEY || !DEALER_ID) {
    console.warn("[AS24] AS24_API_KEY oder AS24_DEALER_ID fehlt — Dummy-Daten werden verwendet");
    const { vehicles } = await import("@/lib/vehicles");
    return vehicles;
  }

  try {
    const res = await fetch(
      `${API_BASE}/dealers/${DEALER_ID}/listings`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          Accept: "application/json",
        },
        next: { revalidate: 3600 }, // ISR: stündlich aktualisieren
      }
    );

    if (!res.ok) {
      throw new Error(`AS24 API ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    // Feldname ggf. anpassen: data.listings | data.items | data.vehicles
    const listings: AS24Listing[] = data.listings ?? data.items ?? [];
    const vehicles = listings.map(mapAS24ToVehicle);
    // Batch salespitch generation (3 at a time) to avoid Anthropic rate limits
    const BATCH = 3;
    const enriched: Vehicle[] = [];
    for (let i = 0; i < vehicles.length; i += BATCH) {
      const batch = await Promise.all(
        vehicles.slice(i, i + BATCH).map(async (v) => ({
          ...v,
          salespitch: await generateSalespitch(v),
        }))
      );
      enriched.push(...batch);
    }
    return enriched;
  } catch (err) {
    console.error("[AS24] Fehler beim Laden:", err);
    // Fallback auf Dummy-Daten damit die Seite nicht crasht
    const { vehicles } = await import("@/lib/vehicles");
    return vehicles;
  }
});
