// lib/as24.ts
// AutoScout24 Switzerland API Client
// Docs:  https://developers.autoscout24.ch/api-docs/api-reference.html
// Auth:  OAuth2 Client Credentials — token valid 24h
// Base:  https://api.autoscout24.ch
//
// Feldnamen nach Live-Integration ggf. mit curl prüfen:
//   curl -s -X GET \
//     "https://api.autoscout24.ch/public/v1/sellers/$AS24_SELLER_ID/listings?page=0&size=5" \
//     -H "Authorization: Bearer <token>" | jq '.listings[0]'

import { cache } from "react";
import type { Vehicle, VehicleBody, EnergyLabel } from "@/lib/vehicles";
import { generateSalespitch } from "@/lib/ai";

const API_BASE    = "https://api.autoscout24.ch";
const CLIENT_ID   = process.env.AS24_CLIENT_ID;
const CLIENT_SECRET = process.env.AS24_CLIENT_SECRET;
const SELLER_ID   = process.env.AS24_SELLER_ID;

// ─── OAuth2 Token Cache ───────────────────────────────────────────────────────

interface TokenCache {
  accessToken: string;
  expiresAt:   number;        // Date.now() ms
}

let _token:        TokenCache | null = null;
let _tokenFlight:  Promise<string> | null = null;

async function getAccessToken(): Promise<string> {
  if (_token && Date.now() < _token.expiresAt - 60_000) return _token.accessToken;
  if (_tokenFlight) return _tokenFlight;

  _tokenFlight = (async () => {
    const res = await fetch(`${API_BASE}/public/v1/clients/oauth/token`, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    new URLSearchParams({
        grant_type:    "client_credentials",
        client_id:     CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`AS24 OAuth2 ${res.status}: ${res.statusText}`);
    }

    const { access_token, expires_in } = await res.json() as {
      access_token: string;
      expires_in:   number;
      token_type:   string;
    };

    // expires_in = 86400 s (24h) — refresh 1 min before expiry
    _token = { accessToken: access_token, expiresAt: Date.now() + expires_in * 1000 };
    return access_token;
  })().finally(() => { _tokenFlight = null; });

  return _tokenFlight;
}

// ─── API Response Types ───────────────────────────────────────────────────────
// Field names verified against: https://developers.autoscout24.ch/migration-guides/hci-json.html

interface AS24Listing {
  id:                   string;
  make:                 { key: string; name: string };
  model:                { key: string; name: string; group?: { key: string; name: string } };
  versionFullName?:     string;
  firstRegistrationYear?: number;
  mileage?:             number;
  horsePower?:          number;
  kiloWatts?:           number;
  transmissionType?:    string;             // "Automatic" | "Manual"
  fuelType?:            string;             // "Petrol" | "Diesel" | "Electric" | "Hybrid"
  bodyType?:            string;             // "SUV" | "Saloon" | "Estate" etc.
  conditionType?:       string;             // "used" | "new" | "demonstration"
  driveType?:           string;             // "FWD" | "RWD" | "AWD" | "4WD"
  price?:               number;
  leasingRate?:         number;
  co2Emission?:         number;
  // Images: each entry may be { url } or { uri } — we check both
  images?:              ({ url?: string; uri?: string } | string)[];
  teaser?:              { url?: string; uri?: string } | string;
  energyEfficiencyClass?: string;
  numberOfDoors?:       number;
  numberOfSeats?:       number;
  color?:               string;
  description?:         string;
  equipment?:           string[];
  emissionSticker?:     string;
  vehicleIdentificationNumber?: string;
  // Media (Phase 3 — field names to verify against live response)
  panorama?:            { url?: string; uri?: string };
  video?:               { url?: string; uri?: string };
  cardossierUrl?:       string;
}

// ─── Mappings ─────────────────────────────────────────────────────────────────

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
  FWD:  "Frontantrieb",
  RWD:  "Heckantrieb",
  AWD:  "Allrad",
  "4WD": "Allrad",
};

const CONDITION_MAP: Record<string, string> = {
  used:          "Occasion",
  new:           "Neuwagen",
  demonstration: "Vorführfahrzeug",
};

/** Extrahiert die URL aus einem Image-Objekt oder String (API-Varianten) */
function extractImageUrl(img: { url?: string; uri?: string } | string | undefined): string {
  if (!img) return "";
  if (typeof img === "string") return img;
  return img.url ?? img.uri ?? "";
}

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapAS24ToVehicle(listing: AS24Listing, index: number): Vehicle {
  const firstImage = extractImageUrl(listing.images?.[0] ?? listing.teaser);

  return {
    id:           index + 1,
    make:         listing.make?.name ?? "Unbekannt",
    model:        listing.model?.name ?? "",
    variant:      listing.versionFullName ?? "",
    year:         listing.firstRegistrationYear ?? new Date().getFullYear(),
    mileage:      listing.mileage ?? 0,
    power:        listing.horsePower ?? (listing.kiloWatts ? Math.round(listing.kiloWatts * 1.36) : 0),
    transmission: listing.transmissionType === "Automatic" ? "Automat" : "Manuell",
    fuel:         listing.fuelType ?? undefined,
    price:        listing.price ?? 0,
    leasingPrice: listing.leasingRate ?? 0,
    image:        firstImage || "/placeholder-car.jpg",
    energyLabel:  (listing.energyEfficiencyClass as EnergyLabel) ?? undefined,
    body:         BODY_MAP[listing.bodyType ?? ""] ?? undefined,
    as24Id:       listing.id,
    // Detail fields
    images:       listing.images?.map((img) => extractImageUrl(img)).filter(Boolean) ?? [],
    equipment:    listing.equipment ?? [],
    description:  listing.description ?? undefined,
    doors:        listing.numberOfDoors ?? undefined,
    seats:        listing.numberOfSeats ?? undefined,
    color:        listing.color ?? undefined,
    co2:          listing.co2Emission ?? undefined,
    emission:     listing.emissionSticker ?? undefined,
    drivetrain:   DRIVETRAIN_MAP[listing.driveType ?? ""] ?? undefined,
    condition:    CONDITION_MAP[listing.conditionType ?? ""] ?? undefined,
    vin:          listing.vehicleIdentificationNumber ?? undefined,
    imageUrl360:  extractImageUrl(listing.panorama) || undefined,
    videoUrl:     extractImageUrl(listing.video) || undefined,
    cardossierUrl: listing.cardossierUrl,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const fetchVehicles = cache(async function fetchVehiclesImpl(): Promise<Vehicle[]> {
  if (!CLIENT_ID || !CLIENT_SECRET || !SELLER_ID) {
    console.warn("[AS24] AS24_CLIENT_ID / AS24_CLIENT_SECRET / AS24_SELLER_ID fehlen — Dummy-Daten");
    const { vehicles } = await import("@/lib/vehicles");
    return vehicles;
  }

  try {
    const token = await getAccessToken();

    // Alle Inserate laden (max. 100 pro Seite; bei >100 Fahrzeugen Pagination ergänzen)
    const res = await fetch(
      `${API_BASE}/public/v1/sellers/${SELLER_ID}/listings?page=0&size=100`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept:        "application/json",
        },
        next: { revalidate: 3600 }, // ISR: stündlich aktualisieren
      }
    );

    if (!res.ok) {
      throw new Error(`AS24 API ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    // Feldname des Arrays ggf. nach erster Live-Antwort prüfen
    const listings: AS24Listing[] = data.listings ?? data.items ?? data.results ?? [];

    if (listings.length === 0) {
      console.warn("[AS24] API hat 0 Inserate zurückgegeben — Dummy-Daten als Fallback");
      const { vehicles } = await import("@/lib/vehicles");
      return vehicles;
    }

    const vehicles = listings.map(mapAS24ToVehicle);

    // Salespitch in Batches (3 parallel) um Anthropic Rate-Limits zu respektieren
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
    const { vehicles } = await import("@/lib/vehicles");
    return vehicles;
  }
});
