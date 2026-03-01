export type EnergyLabel = "A" | "B" | "C" | "D" | "E" | "F" | "G";

export type VehicleBody =
  | "Limousine"
  | "SUV"
  | "Kombi"
  | "Cabriolet"
  | "Van"
  | "Coupé";

export interface Vehicle {
  id: number;
  make: string;
  model: string;
  variant: string;
  year: number;
  mileage: number;
  power: number;
  transmission: string;
  leasingPrice: number;
  price: number;
  badge?: string;
  fuel?: string;
  image: string;
  energyLabel?: EnergyLabel;
  body?: VehicleBody;
  // --- Detail fields (Task 0B) ---
  as24Id?: string;
  images?: string[];
  equipment?: string[];
  description?: string;
  doors?: number;
  seats?: number;
  color?: string;
  co2?: number;
  emission?: string;
  drivetrain?: string;
  condition?: string;
  vin?: string;
  // --- Phase 3 fields ---
  imageUrl360?:   string;   // equirectangular 360-Foto-URL (aus AS24)
  videoUrl?:      string;   // YouTube / Vimeo URL (aus AS24)
  cardossierUrl?: string;   // cardossier.ch Report-Link (aus AS24)
  salespitch?: string;
}

const DUMMY_IMAGE =
  "https://images.autoscout24.ch/public/listing/106/20233106/376934348.png";

export const vehicles: Vehicle[] = [
  {
    id: 1,
    make: "VW",
    model: "Golf Variant",
    variant: "1.5 eTSI",
    year: 2024,
    mileage: 16950,
    power: 150,
    transmission: "Automatik",
    leasingPrice: 447,
    price: 33900,
    badge: "Toppreis",
    fuel: "Hybrid",
    image: DUMMY_IMAGE,
    energyLabel: "B",
    body: "Kombi",
    images: [
      "https://images.autoscout24.ch/public/listing/106/20233106/376934348.png",
      "https://images.autoscout24.ch/public/listing/106/20233106/376934348.png",
      "https://images.autoscout24.ch/public/listing/106/20233106/376934348.png",
    ],
    equipment: [
      "Klimaautomatik",
      "Navigationssystem",
      "Rückfahrkamera",
      "Sitzheizung",
      "LED-Scheinwerfer",
      "Apple CarPlay",
      "PDC hinten",
      "Totwinkelassistent",
    ],
    description:
      "Gepflegtes Fahrzeug mit voller Servicehistorie. Immer im Autohaus gewartet. Kein Unfallfahrzeug.",
    doors: 5,
    seats: 5,
    color: "Schwarz",
    co2: 118,
    emission: "Euro 6d",
    drivetrain: "Frontantrieb",
    condition: "Occasion",
    as24Id: "376934348",
    vin: "WVWZZZ1KZAP123456",
    imageUrl360: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Camponotus_flavomarginatus_ant.jpg/320px-Camponotus_flavomarginatus_ant.jpg",
    videoUrl:    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    cardossierUrl: "https://www.cardossier.ch/de/",
    salespitch:
      "Der Golf Variant 1.5 eTSI ist eine ausgezeichnete Wahl für alle, die Effizienz und Komfort vereinen möchten. Mit nur 16'950 km ist er quasi neuwertig und überzeugt mit moderner Hybrid-Technologie der Energieklasse B. Die umfangreiche Ausstattung mit Navigationssystem, Klimaautomatik und Totwinkelassistent macht jeden Kilometer zum Vergnügen. Ein gepflegtes Fahrzeug mit voller Servicehistorie — hier kaufen Sie sorglos.",
  },
  {
    id: 2,
    make: "Land Rover",
    model: "Range Rover Evoque",
    variant: "",
    year: 2022,
    mileage: 51500,
    power: 200,
    transmission: "Automatik",
    leasingPrice: 513,
    price: 38900,
    badge: "-30%",
    fuel: "Benzin",
    image: DUMMY_IMAGE,
    energyLabel: "E",
    body: "SUV",
  },
  {
    id: 3,
    make: "Hyundai",
    model: "Kona",
    variant: "EV 65.4 kWh",
    year: 2024,
    mileage: 11500,
    power: 217,
    transmission: "Automatik",
    leasingPrice: 341,
    price: 25900,
    badge: "Toppreis",
    fuel: "Elektro",
    image: DUMMY_IMAGE,
    energyLabel: "A",
    body: "SUV",
  },
  {
    id: 4,
    make: "VW",
    model: "T-Roc",
    variant: "1.5 TSI R-Line",
    year: 2025,
    mileage: 13900,
    power: 150,
    transmission: "Automatik",
    leasingPrice: 407,
    price: 30900,
    badge: "Neu",
    fuel: "Benzin",
    image: DUMMY_IMAGE,
    energyLabel: "C",
    body: "SUV",
  },
];
