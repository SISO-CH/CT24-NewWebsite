// lib/tracking.ts
"use client";

import { hasConsent } from "@/lib/consent";

/* ── Event Definitions ── */

interface VehicleViewEvent {
  event: "vehicle_view";
  vehicle_id: number;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_price: number;
}

interface VehicleListFilterEvent {
  event: "vehicle_list_filter";
  filter_type:
    | "search" | "make" | "body" | "priceMin" | "priceMax"
    | "sort" | "fuel" | "transmission" | "yearMin" | "yearMax"
    | "kmMax" | "color" | "drivetrain" | "monthlyRateMax";
  filter_value: string;
}

interface LeadFormSubmitEvent {
  event: "lead_form_submit";
  form_type: "vdp_contact" | "test_drive" | "general_contact" | "service" | "firmenkunden" | "ankauf" | "price_alert" | "sourcing";
  vehicle_id?: number;
  value: number;
}

interface PhoneClickEvent {
  event: "phone_click";
  source_page: string;
  vehicle_id?: number;
  value: number;
}

interface WhatsAppClickEvent {
  event: "whatsapp_click";
  source_page: string;
  vehicle_id?: number;
  value: number;
}

interface TestDriveRequestEvent {
  event: "test_drive_request";
  vehicle_id?: number;
  value: number;
}

interface CTAClickEvent {
  event: "cta_click";
  cta_type: "phone" | "whatsapp" | "test_drive" | "appointment" | "inquiry" | "other";
  source_page: string;
}

interface BlogReadEvent {
  event: "blog_read";
  post_slug: string;
  post_category: string;
}

interface ShareClickEvent {
  event: "share_click";
  vehicle_id: number;
  platform: string;
}

type TrackingEvent =
  | VehicleViewEvent
  | VehicleListFilterEvent
  | LeadFormSubmitEvent
  | PhoneClickEvent
  | WhatsAppClickEvent
  | TestDriveRequestEvent
  | CTAClickEvent
  | BlogReadEvent
  | ShareClickEvent;

/* ── Helpers ── */

/** Calculate dynamic conversion value: 1% of vehicle price, fallback CHF 50 */
export function conversionValue(vehiclePrice?: number): number {
  if (vehiclePrice && vehiclePrice > 0) {
    return Math.round(vehiclePrice * 0.01);
  }
  return 50;
}

/* ── Push to dataLayer ── */

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Push a typed event to GTM dataLayer.
 * Only fires if analytics consent is granted.
 */
export function trackEvent(event: TrackingEvent): void {
  if (typeof window === "undefined") return;
  if (!hasConsent("analytics")) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(event as unknown as Record<string, unknown>);
}
