export type BoundaryMode = "geographic" | "limited";
export type BoundarySource = "preloaded" | "shapefile" | "excel";

export interface BoundaryPolygon {
  id: string;
  name: string;
  level: string; // hierarchy level name (e.g. "Sub-council")
  parentId?: string;
  // Lat/Lng pairs for Leaflet
  coords: [number, number][];
}

export interface BoundaryHierarchy {
  id: string;
  name: string;
  source: BoundarySource;
  mode: BoundaryMode;
  isDefault: boolean;
  levels: string[]; // e.g. ["Municipality", "Sub-council", "Ward"]
  operationalLevel: string;
  usedByServiceCount: number;
  polygons: BoundaryPolygon[];
}

// Cape Town centred sample polygons (hand-authored, simplified)
const capeTownMunicipality: BoundaryPolygon = {
  id: "muni-1",
  name: "City of Cape Town Metropolitan Municipality",
  level: "Municipality",
  coords: [
    [-33.78, 18.36],
    [-33.78, 18.72],
    [-34.12, 18.72],
    [-34.36, 18.55],
    [-34.18, 18.36],
  ],
};

const subCouncils: BoundaryPolygon[] = [
  {
    id: "sc-16",
    name: "Sub-council 16 (Table Bay)",
    level: "Sub-council",
    parentId: "muni-1",
    coords: [
      [-33.84, 18.40],
      [-33.84, 18.55],
      [-33.96, 18.55],
      [-33.96, 18.40],
    ],
  },
  {
    id: "sc-17",
    name: "Sub-council 17 (South Peninsula)",
    level: "Sub-council",
    parentId: "muni-1",
    coords: [
      [-33.96, 18.36],
      [-33.96, 18.50],
      [-34.20, 18.50],
      [-34.30, 18.40],
    ],
  },
  {
    id: "sc-15",
    name: "Sub-council 15 (Tygerberg)",
    level: "Sub-council",
    parentId: "muni-1",
    coords: [
      [-33.84, 18.55],
      [-33.84, 18.70],
      [-33.98, 18.70],
      [-33.98, 18.55],
    ],
  },
];

const wards: BoundaryPolygon[] = [
  { id: "w-1", name: "Ward 1", level: "Ward", parentId: "sc-16", coords: [[-33.86,18.42],[-33.86,18.48],[-33.91,18.48],[-33.91,18.42]] },
  { id: "w-2", name: "Ward 2", level: "Ward", parentId: "sc-16", coords: [[-33.91,18.42],[-33.91,18.48],[-33.95,18.48],[-33.95,18.42]] },
  { id: "w-3", name: "Ward 3", level: "Ward", parentId: "sc-17", coords: [[-33.98,18.38],[-33.98,18.46],[-34.08,18.46],[-34.08,18.38]] },
  { id: "w-4", name: "Ward 4", level: "Ward", parentId: "sc-17", coords: [[-34.08,18.38],[-34.08,18.46],[-34.20,18.46],[-34.20,18.38]] },
  { id: "w-5", name: "Ward 5", level: "Ward", parentId: "sc-15", coords: [[-33.85,18.56],[-33.85,18.62],[-33.91,18.62],[-33.91,18.56]] },
  { id: "w-6", name: "Ward 6", level: "Ward", parentId: "sc-15", coords: [[-33.91,18.56],[-33.91,18.62],[-33.97,18.62],[-33.97,18.56]] },
];

export const SAMPLE_POLYGONS: BoundaryPolygon[] = [
  capeTownMunicipality,
  ...subCouncils,
  ...wards,
];

export const SEED_HIERARCHIES: BoundaryHierarchy[] = [
  {
    id: "h-admin",
    name: "Administrative Hierarchy",
    source: "preloaded",
    mode: "geographic",
    isDefault: true,
    levels: ["Municipality", "Sub-council", "Ward"],
    operationalLevel: "Ward",
    usedByServiceCount: 4,
    polygons: SAMPLE_POLYGONS,
  },
  {
    id: "h-revenue",
    name: "Revenue Hierarchy",
    source: "shapefile",
    mode: "geographic",
    isDefault: false,
    levels: ["Municipality", "Revenue Zone"],
    operationalLevel: "Revenue Zone",
    usedByServiceCount: 1,
    polygons: [capeTownMunicipality, ...subCouncils],
  },
  {
    id: "h-service",
    name: "Service-specific Hierarchy",
    source: "excel",
    mode: "limited",
    isDefault: false,
    levels: ["Municipality", "Zone", "Block"],
    operationalLevel: "Block",
    usedByServiceCount: 1,
    polygons: [],
  },
];

export const DEFAULT_JURISDICTION = {
  name: "City of Cape Town Metropolitan Municipality",
  full: "City of Cape Town Metropolitan Municipality, Western Cape, South Africa",
  adminLevel: 4,
  areaKm2: 2461,
};
