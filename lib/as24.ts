// lib/as24.ts
// AutoScout24 Switzerland API Client
// Auth:  OAuth2 Client Credentials (audience required) — token valid 24h
// Base:  https://api.autoscout24.ch
// Response: { content: AS24Listing[], totalElements, totalPages, ... }

import { cache } from "react";
import type { Vehicle, VehicleBody, EnergyLabel } from "@/lib/vehicles";

const API_BASE      = "https://api.autoscout24.ch";
const CLIENT_ID     = process.env.AS24_CLIENT_ID;
const CLIENT_SECRET = process.env.AS24_CLIENT_SECRET;
const SELLER_ID     = process.env.AS24_SELLER_ID;

// ─── OAuth2 Token Cache ───────────────────────────────────────────────────────

interface TokenCache {
  accessToken: string;
  expiresAt:   number;
}

let _token:       TokenCache | null = null;
let _tokenFlight: Promise<string> | null = null;

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
        audience:      API_BASE,
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

    _token = { accessToken: access_token, expiresAt: Date.now() + expires_in * 1000 };
    return access_token;
  })().finally(() => { _tokenFlight = null; });

  return _tokenFlight;
}

// ─── API Response Types (verifiziert gegen Live-Antwort 2026-03-03) ──────────

interface AS24Listing {
  id:                    number;
  makeKey:               string;           // z.B. "toyota", "bmw"
  modelKey:              string;           // z.B. "yaris-cross", "x1"
  versionFullName?:      string;           // z.B. "Yaris Cross 1.5 HEV Trend 4x4 e-CVT 130PS"
  firstRegistrationYear?: number;
  firstRegistrationDate?: string;
  mileage?:              number;
  kiloWatts?:            number;
  cubicCapacity?:        number;
  cylinders?:            number;
  transmissionType?:     string;           // "manual", "automatic", "automatic-stepless"
  fuelType?:             string;           // "petrol", "diesel", "electric", "hev-petrol", "phev-petrol"
  bodyType?:             string;           // "suv", "saloon", "estate", "cabriolet", "coupe"
  conditionType?:        string;           // "used", "new", "demonstration"
  driveType?:            string;           // "front", "rear", "all"
  price?:                number;
  listPrice?:            number;
  images?:               { url: string }[];
  doors?:                number;
  seats?:                number;
  live?:                 boolean;
  status?:               string;           // "active", "removed"
  sellerId?:             number;
  vehicleCategory?:      string;           // "car"
  certificationNumber?:  string;
  tuned?:                boolean;
  versionId?:            number;
  createdAt?:            string;           // ISO date when listing was created
}

// ─── Mappings ─────────────────────────────────────────────────────────────────

/** Capitalize make/model keys: "yaris-cross" → "Yaris Cross" */
function prettifyKey(key: string): string {
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Strip make+model prefix from versionFullName to avoid duplication.
 *  "Yaris Cross 1.5 HEV Trend 4x4" with model "Yaris Cross" → "1.5 HEV Trend 4x4" */
function stripModelFromVariant(variant: string, model: string): string {
  const lower = variant.toLowerCase();
  const modelLower = model.toLowerCase();
  if (lower.startsWith(modelLower)) {
    return variant.slice(model.length).trim();
  }
  return variant;
}

const BODY_MAP: Record<string, VehicleBody> = {
  suv:         "SUV",
  saloon:      "Limousine",
  estate:      "Kombi",
  cabriolet:   "Cabriolet",
  convertible: "Cabriolet",
  coupe:       "Coupé",
  mpv:         "Van",
  van:         "Van",
  minivan:     "Van",
  hatchback:   "Limousine",
  pickup:      "SUV",
};

const DRIVETRAIN_MAP: Record<string, string> = {
  front: "Frontantrieb",
  rear:  "Heckantrieb",
  all:   "Allrad",
};

const CONDITION_MAP: Record<string, string> = {
  used:          "Occasion",
  new:           "Neuwagen",
  demonstration: "Vorführfahrzeug",
};

const FUEL_MAP: Record<string, string> = {
  petrol:       "Benzin",
  diesel:       "Diesel",
  electric:     "Elektro",
  "hev-petrol": "Hybrid (Benzin)",
  "hev-diesel": "Hybrid (Diesel)",
  "phev-petrol":"Plug-in Hybrid",
  "phev-diesel":"Plug-in Hybrid",
  hydrogen:     "Wasserstoff",
  cng:          "CNG",
  lpg:          "LPG",
};

const TRANSMISSION_MAP: Record<string, string> = {
  manual:              "Manuell",
  automatic:           "Automat",
  "automatic-stepless":"Automat",
  "semi-automatic":    "Halbautomatik",
};

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapAS24ToVehicle(listing: AS24Listing, index: number): Vehicle {
  const firstImage = listing.images?.[0]?.url ?? "";
  const model = prettifyKey(listing.modelKey ?? "");
  const rawVariant = listing.versionFullName ?? "";
  const variant = stripModelFromVariant(rawVariant, model);

  return {
    id:           index + 1,
    make:         prettifyKey(listing.makeKey ?? "unbekannt"),
    model,
    variant,
    year:         listing.firstRegistrationYear ?? new Date().getFullYear(),
    mileage:      listing.mileage ?? 0,
    power:        listing.kiloWatts ? Math.round(listing.kiloWatts * 1.36) : 0,
    transmission: TRANSMISSION_MAP[listing.transmissionType ?? ""] ?? "Manuell",
    fuel:         FUEL_MAP[listing.fuelType ?? ""] ?? listing.fuelType ?? undefined,
    price:        listing.price ?? 0,
    leasingPrice: 0,
    image:        firstImage || "/placeholder-car.jpg",
    body:         BODY_MAP[listing.bodyType ?? ""] ?? undefined,
    as24Id:       String(listing.id),
    images:       listing.images?.map((img) => img.url).filter(Boolean) ?? [],
    equipment:    [],
    doors:        listing.doors ?? undefined,
    seats:        listing.seats ?? undefined,
    drivetrain:   DRIVETRAIN_MAP[listing.driveType ?? ""] ?? undefined,
    condition:    CONDITION_MAP[listing.conditionType ?? ""] ?? undefined,
    createdAt:    listing.createdAt ?? undefined,
    previousPrice: listing.listPrice && listing.listPrice > (listing.price ?? 0)
                     ? listing.listPrice
                     : undefined,
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

    // Alle Seiten laden (API liefert max. 100 pro Seite)
    const allListings: AS24Listing[] = [];
    let page = 0;
    let totalPages = 1;

    while (page < totalPages) {
      const res = await fetch(
        `${API_BASE}/public/v1/sellers/${SELLER_ID}/listings?page=${page}&size=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept:        "application/json",
          },
          next: { revalidate: 3600 },
        }
      );

      if (!res.ok) {
        throw new Error(`AS24 API ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      allListings.push(...(data.content ?? []));
      totalPages = data.totalPages ?? 1;
      page++;
    }

    // Nur aktive/live Inserate, neueste zuerst (höchste ID = neuestes Inserat)
    const listings = allListings
      .filter((l) => l.live === true)
      .sort((a, b) => b.id - a.id);

    if (listings.length === 0) {
      console.warn("[AS24] API hat 0 aktive Inserate — Dummy-Daten als Fallback");
      const { vehicles } = await import("@/lib/vehicles");
      return vehicles;
    }

    console.log(`[AS24] ${listings.length} aktive Inserate geladen (${allListings.length} total)`);

    return listings.map(mapAS24ToVehicle);

  } catch (err) {
    console.error("[AS24] Fehler beim Laden:", err);
    const { vehicles } = await import("@/lib/vehicles");
    return vehicles;
  }
});

// ─── Detail-Endpoint ──────────────────────────────────────────────────────────

interface AS24Detail {
  bodyColor?:             string;
  interiorColor?:         string;
  cubicCapacity?:         number;
  cylinders?:             number;
  co2Emission?:           number;
  energyLabel?:           string;
  consumption?:           { combined?: number };
  horsePower?:            number;
  kiloWatts?:             number;
  weightCurb?:            number;
  towingCapacityBraked?:  number;
  emissionStandard?:      string;
  description?:           string;
  vehicleIdentificationNumber?: string;
  leasing?:               { monthlyRate?: number; url?: string };
  images?:                { url: string }[];
}

const COLOR_MAP: Record<string, string> = {
  black: "Schwarz", white: "Weiss", silver: "Silber", gray: "Grau", grey: "Grau",
  red: "Rot", blue: "Blau", green: "Grün", brown: "Braun", beige: "Beige",
  orange: "Orange", yellow: "Gelb", gold: "Gold", violet: "Violett", purple: "Violett",
};

const EMISSION_MAP: Record<string, string> = {
  "euro-6d": "Euro 6d", "euro-6d-temp": "Euro 6d-TEMP", "euro-6c": "Euro 6c",
  "euro-6b": "Euro 6b", "euro-6": "Euro 6", "euro-5": "Euro 5",
};

function translateColor(c: string | undefined): string | undefined {
  if (!c) return undefined;
  return COLOR_MAP[c.toLowerCase()] ?? c.charAt(0).toUpperCase() + c.slice(1);
}

const VALID_ENERGY_LABELS = new Set(["A", "B", "C", "D", "E", "F", "G"]);

function toEnergyLabel(raw: string | undefined): EnergyLabel | undefined {
  if (!raw) return undefined;
  const upper = raw.toUpperCase();
  return VALID_ENERGY_LABELS.has(upper) ? (upper as EnergyLabel) : undefined;
}

/** Holt Detail-Daten für ein einzelnes Inserat (cached by as24Id for stable dedup) */
export async function fetchVehicleDetail(vehicle: Vehicle): Promise<Vehicle> {
  if (!CLIENT_ID || !CLIENT_SECRET || !vehicle.as24Id) return vehicle;
  const detail = await fetchDetailById(vehicle.as24Id);
  if (!detail) return vehicle;
  return applyDetail(vehicle, detail);
}

const fetchDetailById = cache(async function fetchDetailByIdImpl(
  as24Id: string
): Promise<AS24Detail | null> {
  try {
    const token = await getAccessToken();
    const res = await fetch(
      `${API_BASE}/public/v1/listings/${as24Id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept:        "application/json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) return null;
    return await res.json() as AS24Detail;
  } catch {
    return null;
  }
});

function applyDetail(vehicle: Vehicle, d: AS24Detail): Vehicle {
  return {
    ...vehicle,
    power:           d.horsePower ?? vehicle.power,
    color:           translateColor(d.bodyColor) ?? vehicle.color,
    interiorColor:   translateColor(d.interiorColor),
    cubicCapacity:   d.cubicCapacity ?? undefined,
    cylinders:       d.cylinders ?? undefined,
    co2:             d.co2Emission ?? undefined,
    energyLabel:     toEnergyLabel(d.energyLabel),
    consumption:     d.consumption?.combined ?? undefined,
    weightCurb:      d.weightCurb ?? undefined,
    towingCapacity:  d.towingCapacityBraked ?? undefined,
    emission:        EMISSION_MAP[d.emissionStandard ?? ""] ?? undefined,
    vin:             d.vehicleIdentificationNumber ?? vehicle.vin,
    description:     d.description ?? vehicle.description,
    leasingPrice:    d.leasing?.monthlyRate ?? vehicle.leasingPrice,
    leasingUrl:      d.leasing?.url ?? undefined,
    images:          d.images?.map((img) => img.url).filter(Boolean) ?? vehicle.images,
  };
}
