"use client";
import { useState } from "react";
import { FileDown } from "lucide-react";

interface VehicleData {
  id: number;
  make: string;
  model: string;
  year: number;
  mileage: number;
  power: number;
  transmission: string;
  fuel?: string;
  drivetrain?: string;
  color?: string;
  price: number;
  images?: string[];
  leasingPrice?: number;
}

interface Props {
  vehicle: VehicleData;
  leasingRate?: number;
}

function loadImageAsDataUrl(src: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = reject;
    img.src = src;
  });
}

export default function OfferPDFButton({ vehicle, leasingRate }: Props) {
  const [loading, setLoading] = useState(false);

  async function generatePDF() {
    setLoading(true);
    try {
      const { jsPDF } = await import("jspdf");
      const QRCode = await import("qrcode");

      const doc = new jsPDF("p", "mm", "a4");
      const w = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 160, 227); // ct-cyan
      doc.text("Car Trade24", 15, 20);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("Bremgartenstrasse 67 | 5610 Wohlen | +41 56 618 55 44 | info@cartrade24.ch", 15, 27);

      // Line
      doc.setDrawColor(0, 160, 227);
      doc.setLineWidth(0.5);
      doc.line(15, 31, w - 15, 31);

      // Title
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(27, 27, 27); // ct-dark
      doc.text(`${vehicle.make} ${vehicle.model}`, 15, 42);

      let yPos = 52;

      // Vehicle image (via canvas to handle CORS)
      if (vehicle.images?.[0]) {
        try {
          const dataUrl = await loadImageAsDataUrl(vehicle.images[0]);
          const imgW = w - 30;
          const imgH = imgW * 0.75;
          doc.addImage(dataUrl, "JPEG", 15, yPos, imgW, imgH);
          yPos += imgH + 10;
        } catch { yPos += 5; }
      }

      // Specs table
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(27, 27, 27);
      doc.text("Technische Daten", 15, yPos);
      yPos += 8;

      doc.setFontSize(9);
      const specs: [string, string][] = [
        ["Marke / Modell", `${vehicle.make} ${vehicle.model}`],
        ["Baujahr", String(vehicle.year)],
        ["Kilometerstand", `${vehicle.mileage.toLocaleString("de-CH")} km`],
        ["Leistung", `${vehicle.power} PS`],
        ["Getriebe", vehicle.transmission],
        ["Treibstoff", vehicle.fuel ?? "\u2013"],
        ["Antrieb", vehicle.drivetrain ?? "\u2013"],
        ["Farbe", vehicle.color ?? "\u2013"],
      ];

      specs.forEach(([label, value]) => {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text(label, 15, yPos);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(27, 27, 27);
        doc.text(value, 80, yPos);
        yPos += 6;
      });

      // Price
      yPos += 8;
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(27, 27, 27);
      doc.text(`CHF ${vehicle.price.toLocaleString("de-CH")}.-`, 15, yPos);
      yPos += 6;
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("Preis inkl. 8.1% MwSt. | Preisänderungen vorbehalten", 15, yPos);

      // Leasing
      const displayRate = leasingRate ?? vehicle.leasingPrice;
      if (displayRate && displayRate > 0) {
        yPos += 8;
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(228, 0, 125); // ct-magenta
        doc.text(`Leasing ab CHF ${displayRate.toLocaleString("de-CH")}.-/Mt.`, 15, yPos);
        yPos += 5;
        doc.setFontSize(7);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("inkl. MwSt., vorbehaltlich Bonitätsprüfung", 15, yPos);
      }

      // Validity
      yPos += 12;
      const validUntil = new Date(Date.now() + 14 * 86400000).toLocaleDateString("de-CH");
      doc.setFontSize(8);
      doc.text(`Angebot gültig bis: ${validUntil}`, 15, yPos);

      // QR code
      const url = `https://cartrade24.ch/autos/${vehicle.id}`;
      const qrDataUrl = await QRCode.toDataURL(url, { width: 120, margin: 1 });
      doc.addImage(qrDataUrl, "PNG", w - 40, yPos - 15, 25, 25);
      doc.setFontSize(7);
      doc.text("QR-Code scannen", w - 40, yPos + 12);

      // Footer
      const pageH = doc.internal.pageSize.getHeight();
      doc.setDrawColor(0, 160, 227);
      doc.line(15, pageH - 15, w - 15, pageH - 15);
      doc.setFontSize(7);
      doc.setTextColor(156, 163, 175);
      doc.text("Car Trade24 GmbH | Bremgartenstrasse 67 | 5610 Wohlen | www.cartrade24.ch", 15, pageH - 10);

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
