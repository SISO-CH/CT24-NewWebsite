export interface TeamMember {
  name: string;
  initials: string;
  role: string;
}

export const SALES_TEAM: TeamMember[] = [
  { name: "Besnik Rulani",     initials: "BR", role: "Geschäftsführer"  },
  { name: "Ligia Apolinatio",  initials: "LA", role: "Administration"   },
  { name: "Patry Trybek",      initials: "PT", role: "Verkäufer"        },
  { name: "Claire Dubler",     initials: "CD", role: "Administration"   },
];

export function getSalesperson(vehicleId: number): TeamMember {
  return SALES_TEAM[vehicleId % SALES_TEAM.length];
}
