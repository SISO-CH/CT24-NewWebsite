import type { Vehicle } from "@/lib/vehicles";
import { kvGet, kvScan, kvMget } from "@/lib/kv";

export interface ArchivedVehicle extends Vehicle {
  archivedAt: string;
  status: "sold";
}

function sortByArchivedDesc(a: ArchivedVehicle, b: ArchivedVehicle): number {
  return new Date(b.archivedAt).getTime() - new Date(a.archivedAt).getTime();
}

export async function getSoldVehicles(): Promise<ArchivedVehicle[]> {
  const keys = await kvScan("archive:*");
  if (keys.length === 0) return [];

  const values = await kvMget<ArchivedVehicle>(...keys);
  const vehicles = values.filter(
    (v): v is ArchivedVehicle => v !== null,
  );
  return vehicles.sort(sortByArchivedDesc);
}

export async function getSoldVehicle(
  id: string,
): Promise<ArchivedVehicle | null> {
  return kvGet<ArchivedVehicle>(`archive:${id}`);
}
