// ASTRA CO2-Sanktionen für PKW-Importeure/Händler
export const CO2_TARGET = 118; // g/km Zielwert 2025
export const CO2_PENALTY_PER_GRAM = 108; // CHF pro g/km Überschreitung pro Fahrzeug

export interface FleetVehicle {
  label: string;
  co2: number;
}

export interface Co2Result {
  fleetAverage: number;
  target: number;
  excess: number;
  penaltyPerVehicle: number;
  totalPenalty: number;
  vehicleCount: number;
}

export function calculateFleetPenalty(vehicles: FleetVehicle[]): Co2Result {
  if (vehicles.length === 0) {
    return {
      fleetAverage: 0,
      target: CO2_TARGET,
      excess: 0,
      penaltyPerVehicle: 0,
      totalPenalty: 0,
      vehicleCount: 0,
    };
  }

  const avg = vehicles.reduce((s, v) => s + v.co2, 0) / vehicles.length;
  const excess = Math.max(0, avg - CO2_TARGET);
  const penalty = Math.round(excess * CO2_PENALTY_PER_GRAM);

  return {
    fleetAverage: Math.round(avg),
    target: CO2_TARGET,
    excess: Math.round(excess),
    penaltyPerVehicle: penalty,
    totalPenalty: penalty * vehicles.length,
    vehicleCount: vehicles.length,
  };
}
