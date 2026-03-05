import type { Metadata } from "next";
import MerklisteContent from "@/components/vehicles/MerklisteContent";

export const metadata: Metadata = {
  title: "Merkliste",
  description: "Ihre gemerkten Fahrzeuge bei Car Trade24.",
};

export default function MerklistePage() {
  return (
    <section className="pt-24 pb-16 min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-ct-dark mb-8">Ihre Merkliste</h1>
        <MerklisteContent />
      </div>
    </section>
  );
}
