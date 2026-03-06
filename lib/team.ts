export interface TeamMember {
  name: string;
  initials: string;
  role: string;
  phone?: string;
  image?: string;
}

export const TEAM: TeamMember[] = [
  { name: "Besnik Rulani",    initials: "BR", role: "Geschäftsführer",  phone: "+41 56 618 55 44" },
  { name: "Ligia Apolinatio", initials: "LA", role: "Administration" },
  { name: "Patry Trybek",    initials: "PT", role: "Verkaufsberater" },
  { name: "Claire Dubler",   initials: "CD", role: "Administration" },
  { name: "Mitarbeiter 5",   initials: "M5", role: "Verkaufsberater" },
];

// Backward compat
export const SALES_TEAM = TEAM;

export function getSalesperson(vehicleId: number): TeamMember {
  return TEAM[vehicleId % TEAM.length];
}
