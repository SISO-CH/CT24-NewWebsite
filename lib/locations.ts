export interface Location {
  name: string;
  slug: string;
  kanton: string;
  distanceKm: number;
  lat: number;
  lng: number;
}

export const locations: Location[] = [
  { name: "Wohlen",      slug: "wohlen",      kanton: "AG", distanceKm: 0,   lat: 47.3522, lng: 8.2786 },
  { name: "Bremgarten",  slug: "bremgarten",  kanton: "AG", distanceKm: 7,   lat: 47.3517, lng: 8.3298 },
  { name: "Muri",        slug: "muri",        kanton: "AG", distanceKm: 10,  lat: 47.2749, lng: 8.3397 },
  { name: "Lenzburg",    slug: "lenzburg",    kanton: "AG", distanceKm: 15,  lat: 47.3866, lng: 8.1753 },
  { name: "Aarau",       slug: "aarau",       kanton: "AG", distanceKm: 25,  lat: 47.3925, lng: 8.0444 },
  { name: "Baden",       slug: "baden",       kanton: "AG", distanceKm: 20,  lat: 47.4734, lng: 8.3066 },
  { name: "Brugg",       slug: "brugg",       kanton: "AG", distanceKm: 25,  lat: 47.4847, lng: 8.2082 },
  { name: "Zürich",      slug: "zuerich",     kanton: "ZH", distanceKm: 30,  lat: 47.3769, lng: 8.5417 },
  { name: "Luzern",      slug: "luzern",      kanton: "LU", distanceKm: 40,  lat: 47.0502, lng: 8.3093 },
  { name: "Zug",         slug: "zug",         kanton: "ZG", distanceKm: 30,  lat: 47.1724, lng: 8.5173 },
  { name: "Dietikon",    slug: "dietikon",    kanton: "ZH", distanceKm: 20,  lat: 47.4044, lng: 8.3981 },
  { name: "Olten",       slug: "olten",       kanton: "SO", distanceKm: 35,  lat: 47.3521, lng: 7.9077 },
  { name: "Solothurn",   slug: "solothurn",   kanton: "SO", distanceKm: 45,  lat: 47.2088, lng: 7.5370 },
  { name: "Bern",        slug: "bern",        kanton: "BE", distanceKm: 90,  lat: 46.9480, lng: 7.4474 },
  { name: "Basel",       slug: "basel",       kanton: "BS", distanceKm: 80,  lat: 47.5596, lng: 7.5886 },
  { name: "Winterthur",  slug: "winterthur",  kanton: "ZH", distanceKm: 55,  lat: 47.5003, lng: 8.7241 },
  { name: "St. Gallen",  slug: "st-gallen",   kanton: "SG", distanceKm: 100, lat: 47.4245, lng: 9.3767 },
  { name: "Thun",        slug: "thun",        kanton: "BE", distanceKm: 110, lat: 46.7580, lng: 7.6280 },
];

export function getLocation(slug: string): Location | undefined {
  return locations.find((l) => l.slug === slug);
}
