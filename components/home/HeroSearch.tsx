"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

const MAKES = [
  "Audi", "BMW", "Ford", "Hyundai", "Land Rover",
  "Mercedes", "Renault", "Skoda", "Toyota", "VW",
];
const BODIES = ["Cabriolet", "Coupé", "Kombi", "Limousine", "SUV", "Van"];

export default function HeroSearch() {
  const [make, setMake] = useState("");
  const [body, setBody] = useState("");
  const router = useRouter();

  function handleSearch() {
    const params = new URLSearchParams();
    if (make) params.set("make", make);
    if (body) params.set("body", body);
    router.push(`/autos${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="bg-white border-2 border-[#e5e7eb] rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-lg border border-[#e5e7eb] text-[#374151] text-sm bg-white focus:outline-none focus:border-[#00a0e3] cursor-pointer"
        >
          <option value="">Marke wählen</option>
          {MAKES.map((m) => (
            <option key={m}>{m}</option>
          ))}
        </select>
        <select
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 px-3 py-2.5 rounded-lg border border-[#e5e7eb] text-[#374151] text-sm bg-white focus:outline-none focus:border-[#00a0e3] cursor-pointer"
        >
          <option value="">Karosserie</option>
          {BODIES.map((b) => (
            <option key={b}>{b}</option>
          ))}
        </select>
        <button
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm text-white whitespace-nowrap transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--ct-cyan)" }}
        >
          <Search size={15} />
          Fahrzeuge suchen
        </button>
      </div>
    </div>
  );
}
