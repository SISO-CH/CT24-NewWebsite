import type { Metadata } from "next";
import VoiceAgent from "@/components/voice/VoiceAgent";

export const metadata: Metadata = {
  title: "Sprachassistent | Car Trade24",
  description:
    "Sprechen Sie mit unserem KI-Sprachassistenten und erhalten Sie sofort Antworten zu Fahrzeugen, Preisen und Services bei Car Trade24.",
};

interface Props {
  searchParams: Promise<{ vehicle?: string }>;
}

export default async function VoicePage({ searchParams }: Props) {
  const { vehicle } = await searchParams;

  const vehicleContext = vehicle
    ? `Der Kunde interessiert sich fuer Fahrzeug mit ID ${vehicle}. Beziehe dich in deinen Antworten auf dieses Fahrzeug, wenn moeglich.`
    : undefined;

  return <VoiceAgent vehicleContext={vehicleContext} />;
}
