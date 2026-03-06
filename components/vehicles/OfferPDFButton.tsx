"use client";
import { useState, useEffect, useRef } from "react";
import { FileDown } from "lucide-react";
import { LEASING_CHANGE_EVENT } from "@/components/ui/LeasingCalculator";

interface VehicleData {
  id: number;
  make: string;
  model: string;
  variant?: string;
  year: number;
  mileage: number;
  power: number;
  transmission: string;
  fuel?: string;
  drivetrain?: string;
  color?: string;
  interiorColor?: string;
  price: number;
  images?: string[];
  equipment?: string[];
  condition?: string;
  doors?: number;
  seats?: number;
  cubicCapacity?: number;
  cylinders?: number;
  consumption?: number;
  co2?: number;
  emission?: string;
  body?: string;
}

interface LeasingDetails {
  rate: number;
  down: number;
  months: number;
  residual: number;
  km: number;
}

interface Props {
  vehicle: VehicleData;
}

async function fetchImageAsDataUrl(src: string): Promise<string> {
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}`;
  const res = await fetch(proxyUrl);
  if (!res.ok) throw new Error("image proxy failed");
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fmt(n: number): string {
  return n.toLocaleString("de-CH");
}

// Colors
const CYAN = [0, 160, 227] as const;
const MAGENTA = [228, 0, 125] as const;
const DARK = [27, 27, 27] as const;
const GRAY = [107, 114, 128] as const;
const LIGHT_GRAY = [156, 163, 175] as const;
const LIGHT_BG = [244, 246, 248] as const;

export default function OfferPDFButton({ vehicle }: Props) {
  const [loading, setLoading] = useState(false);
  const leasingRef = useRef<LeasingDetails | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      leasingRef.current = (e as CustomEvent).detail;
    };
    window.addEventListener(LEASING_CHANGE_EVENT, handler);
    return () => window.removeEventListener(LEASING_CHANGE_EVENT, handler);
  }, []);

  async function generatePDF() {
    setLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const QRCode = await import("qrcode");

      const doc = new jsPDF("p", "mm", "a4");
      const w = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 15;
      const contentW = w - margin * 2;

      // Helper: check if we need a new page
      function checkPage(needed: number, yPos: number): number {
        if (yPos + needed > pageH - 25) {
          doc.addPage();
          return 20;
        }
        return yPos;
      }

      // ═══════════════════════════════════════════════════════════════
      // HEADER
      // ═══════════════════════════════════════════════════════════════
      // Cyan accent bar
      doc.setFillColor(...CYAN);
      doc.rect(0, 0, w, 3, "F");

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...CYAN);
      doc.text("Car Trade24", margin, 16);

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY);
      doc.text("Bremgartenstrasse 67 | 5610 Wohlen | +41 56 618 55 44 | info@cartrade24.ch", w - margin, 16, { align: "right" });

      // Separator
      doc.setDrawColor(...CYAN);
      doc.setLineWidth(0.4);
      doc.line(margin, 21, w - margin, 21);

      // ═══════════════════════════════════════════════════════════════
      // VEHICLE TITLE
      // ═══════════════════════════════════════════════════════════════
      const title = `${vehicle.make} ${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ""}`;
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      const titleLines = doc.splitTextToSize(title, contentW) as string[];
      doc.text(titleLines, margin, 30);
      const titleBottom = 30 + (titleLines.length - 1) * 6;

      // Subtitle
      const subtitle = [
        vehicle.condition ?? "Occasion",
        String(vehicle.year),
        vehicle.body,
      ].filter(Boolean).join(" · ");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY);
      doc.text(subtitle, margin, titleBottom + 6);

      let yPos = titleBottom + 12;

      // ═══════════════════════════════════════════════════════════════
      // IMAGE (right) + PRICE/LEASING (left) — side by side
      // ═══════════════════════════════════════════════════════════════
      const imgW = contentW * 0.55;
      const imgH = imgW * 0.75; // 4:3
      const imgX = w - margin - imgW;
      const leftW = contentW - imgW - 5; // gap 5mm
      const leasing = leasingRef.current;

      // Image right
      if (vehicle.images?.[0]) {
        try {
          const dataUrl = await fetchImageAsDataUrl(vehicle.images[0]);
          doc.addImage(dataUrl, "JPEG", imgX, yPos, imgW, imgH);
        } catch { /* no image */ }
      }

      // Price left
      const boxW = leftW;
      const boxH = 20;
      doc.setFillColor(...LIGHT_BG);
      doc.roundedRect(margin, yPos, boxW, boxH, 2, 2, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY);
      doc.text("KAUFPREIS", margin + 4, yPos + 6);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...DARK);
      doc.text(`CHF ${fmt(vehicle.price)}.-`, margin + 4, yPos + 15);

      // Leasing below price
      const leasingY = yPos + boxH + 3;
      doc.setFillColor(...LIGHT_BG);
      doc.roundedRect(margin, leasingY, boxW, boxH, 2, 2, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY);
      doc.text("LEASING AB", margin + 4, leasingY + 6);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...MAGENTA);
      const rateText = leasing && leasing.rate > 0
        ? `CHF ${fmt(leasing.rate)}.-/Mt.`
        : "Auf Anfrage";
      doc.text(rateText, margin + 4, leasingY + 15);

      // Small print below boxes
      const detailY = leasingY + boxH + 2;
      doc.setFontSize(5.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...LIGHT_GRAY);
      doc.text("inkl. 8.1% MwSt.", margin, detailY + 3);
      if (leasing && leasing.rate > 0) {
        doc.text(
          `${leasing.down}% Anz. | ${leasing.residual}% Restwert | ${leasing.months} Mt. | ${fmt(leasing.km)} km/J.`,
          margin, detailY + 7
        );
      }

      // yPos advances past the taller of image or price blocks
      yPos += Math.max(imgH, boxH * 2 + 15) + 8;

      // ═══════════════════════════════════════════════════════════════
      // TECHNISCHE DATEN (2-column grid)
      // ═══════════════════════════════════════════════════════════════
      yPos = checkPage(60, yPos);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...CYAN);
      doc.text("TECHNISCHE DATEN", margin, yPos);
      doc.setDrawColor(...CYAN);
      doc.setLineWidth(0.3);
      doc.line(margin, yPos + 1.5, margin + 38, yPos + 1.5);
      yPos += 7;

      const specs: [string, string][] = [
        ["Marke", vehicle.make],
        ["Modell", `${vehicle.model}${vehicle.variant ? ` ${vehicle.variant}` : ""}`],
        ["Baujahr", String(vehicle.year)],
        ["Kilometerstand", `${fmt(vehicle.mileage)} km`],
        ["Leistung", `${vehicle.power} PS`],
        ["Getriebe", vehicle.transmission],
        ["Treibstoff", vehicle.fuel ?? "–"],
        ["Antrieb", vehicle.drivetrain ?? "–"],
        ["Karosserie", vehicle.body ?? "–"],
        ["Farbe", vehicle.color ?? "–"],
      ];
      if (vehicle.interiorColor) specs.push(["Innenfarbe", vehicle.interiorColor]);
      if (vehicle.doors) specs.push(["Türen", String(vehicle.doors)]);
      if (vehicle.seats) specs.push(["Sitze", String(vehicle.seats)]);
      if (vehicle.cubicCapacity) specs.push(["Hubraum", `${fmt(vehicle.cubicCapacity)} cm³`]);
      if (vehicle.cylinders) specs.push(["Zylinder", String(vehicle.cylinders)]);
      if (vehicle.consumption) specs.push(["Verbrauch", `${vehicle.consumption} l/100km`]);
      if (vehicle.co2) specs.push(["CO₂", `${vehicle.co2} g/km`]);
      if (vehicle.emission) specs.push(["Abgasnorm", vehicle.emission]);

      const colW = contentW / 2;
      const labelW = 28;
      const valueMaxW = colW - labelW - 2;
      const rowH = 5.5;

      specs.forEach(([label, value], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = margin + col * colW;
        const y = yPos + row * rowH;

        // Alternating row background
        if (col === 0 && row % 2 === 0) {
          doc.setFillColor(249, 250, 251);
          doc.rect(margin, y - 3.5, contentW, rowH, "F");
        }

        doc.setFontSize(7.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GRAY);
        doc.text(label, x, y);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...DARK);
        // Truncate value if it exceeds column width
        let displayVal = value;
        while (doc.getTextWidth(displayVal) > valueMaxW && displayVal.length > 3) {
          displayVal = displayVal.slice(0, -2) + "…";
        }
        doc.text(displayVal, x + labelW, y);
      });

      yPos += Math.ceil(specs.length / 2) * rowH + 6;

      // ═══════════════════════════════════════════════════════════════
      // AUSSTATTUNG (multi-column list)
      // ═══════════════════════════════════════════════════════════════
      const equipment = vehicle.equipment?.filter(Boolean) ?? [];
      if (equipment.length > 0) {
        yPos = checkPage(30, yPos);

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...CYAN);
        doc.text("AUSSTATTUNG", margin, yPos);
        doc.setDrawColor(...CYAN);
        doc.line(margin, yPos + 1.5, margin + 28, yPos + 1.5);
        yPos += 7;

        const eqCols = 3;
        const eqColW = contentW / eqCols;
        const eqRowH = 4.5;

        doc.setFontSize(6.5);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...DARK);

        equipment.forEach((item, i) => {
          const col = i % eqCols;
          const row = Math.floor(i / eqCols);
          const x = margin + col * eqColW;
          const y = yPos + row * eqRowH;

          // Page break check every 10 rows
          if (col === 0) {
            const newY = checkPage(eqRowH, y);
            if (newY !== y) {
              yPos = newY - row * eqRowH;
            }
          }

          doc.setTextColor(...CYAN);
          doc.text("✓", x, yPos + row * eqRowH);
          doc.setTextColor(...DARK);
          // Truncate long items
          const truncated = item.length > 28 ? item.slice(0, 26) + "…" : item;
          doc.text(truncated, x + 4, yPos + row * eqRowH);
        });

        yPos += Math.ceil(equipment.length / eqCols) * eqRowH + 6;
      }

      // ═══════════════════════════════════════════════════════════════
      // VALIDITY + QR CODE
      // ═══════════════════════════════════════════════════════════════
      yPos = checkPage(30, yPos);

      // Separator
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, w - margin, yPos);
      yPos += 6;

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...GRAY);
      const validUntil = new Date(Date.now() + 14 * 86400000).toLocaleDateString("de-CH");
      doc.text(`Angebot gültig bis: ${validUntil}`, margin, yPos);
      doc.text("Dieses Angebot ist unverbindlich.", margin, yPos + 4);

      // QR code (right side)
      const url = `https://cartrade24.ch/autos/${vehicle.id}`;
      const qrDataUrl = await QRCode.toDataURL(url, { width: 150, margin: 1 });
      doc.addImage(qrDataUrl, "PNG", w - margin - 22, yPos - 5, 22, 22);
      doc.setFontSize(6);
      doc.setTextColor(...LIGHT_GRAY);
      doc.text("Online ansehen", w - margin - 22, yPos + 19);

      // ═══════════════════════════════════════════════════════════════
      // FOOTER
      // ═══════════════════════════════════════════════════════════════
      // Cyan accent bar at bottom
      doc.setFillColor(...CYAN);
      doc.rect(0, pageH - 12, w, 12, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text(
        "Car Trade24 GmbH  |  Bremgartenstrasse 67  |  5610 Wohlen  |  +41 56 618 55 44  |  www.cartrade24.ch",
        w / 2, pageH - 5,
        { align: "center" }
      );

      doc.save(`CarTrade24_Angebot_${vehicle.make}_${vehicle.model}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={generatePDF}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-[#e5e7eb]
                 text-sm font-semibold text-[#374151] hover:bg-ct-light transition-colors disabled:opacity-50"
    >
      <FileDown size={15} />
      {loading ? "PDF wird erstellt\u2026" : "Als PDF speichern"}
    </button>
  );
}
