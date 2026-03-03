import type { MetadataRoute } from "next";
import { fetchVehicles } from "@/lib/as24";
import { getAllPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://cartrade24.ch";
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base,                   lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${base}/autos`,        lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${base}/blog`,         lastModified: now, changeFrequency: "daily",   priority: 0.8 },
    { url: `${base}/finanzierung`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/firmenkunden`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/ankauf`,       lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/garantie`,     lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`,          lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/ueber-uns`,    lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/kontakt`,      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/news`,         lastModified: now, changeFrequency: "weekly",  priority: 0.5 },
    { url: `${base}/agb`,          lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${base}/datenschutz`,  lastModified: now, changeFrequency: "yearly",  priority: 0.2 },
  ];

  let vehicleRoutes: MetadataRoute.Sitemap = [];
  try {
    const vehicles = await fetchVehicles();
    vehicleRoutes = vehicles.map((v) => ({
      url: `${base}/autos/${v.id}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch {
    // Fehler ignorieren — Sitemap ohne Fahrzeuge
  }

  const blogRoutes: MetadataRoute.Sitemap = getAllPosts().map((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...vehicleRoutes, ...blogRoutes];
}
