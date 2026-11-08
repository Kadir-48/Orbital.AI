export interface Launch {
  id: string;
  name: string;
  net: string;
  netPrecision?: string;
  status: string;
  statusAbbrev: string;
  statusDescription: string;
  failReason: string;
  provider: string;
  providerAbbrev: string;
  providerType: string;
  rocket: string;
  rocketId?: number;
  missionName: string;
  missionType: string;
  missionDescription: string;
  orbit: string;
  pad: string;
  location: string;
  country: string;
  image?: string;
  thumb?: string;
  webcast?: string;
  webcastLive: boolean;
  programs: string[];
}

export interface Rocket {
  id: number;
  name: string;
  shortName: string;
  variant: string;
  families: string[];
  manufacturer: string;
  manufacturerAbbrev: string;
  country: string;
  active: boolean;
  reusable: boolean;
  image?: string;
  thumb?: string;
  description: string;
  length: number | null;
  diameter: number | null;
  launchMass: number | null;
  leo: number | null;
  gto: number | null;
  sso: number | null;
  geo: number | null;
  thrust: number | null;
  launchCost: number | null;
  minStage: number | null;
  maxStage: number | null;
  maidenFlight: string | null;
  total: number;
  success: number;
  failed: number;
  pending: number;
  landingsAttempted: number;
  landingsSuccess: number;
  wiki: string;
  info: string;
}

export interface Spacecraft {
  id: number;
  name: string;
  type: string;
  agency: string;
  agencyAbbrev: string;
  inUse: boolean;
  image?: string;
  thumb?: string;
  capability: string;
  description: string;
  maidenFlight: string | null;
  height: number | null;
  diameter: number | null;
  humanRated: boolean;
  crewCapacity: number | null;
  payloadCapacity: number | null;
  payloadReturn: number | null;
  flightLife: string;
  flown: number;
  total: number;
  success: number;
  failed: number;
  landingsSuccess: number;
  wiki: string;
}

export interface Astronaut {
  id: number;
  name: string;
  status: string;
  agency: string;
  agencyAbbrev: string;
  type: string;
  image?: string;
  thumb?: string;
  inSpace: boolean;
  daysInSpace: number;
  evaHours: number;
  age: number | null;
  born: string | null;
  died: string | null;
  nationality: string;
  bio: string;
  wiki: string;
  firstFlight: string | null;
  lastFlight: string | null;
  flights: number;
  spacewalks: number;
}

export interface Agency {
  id: number;
  name: string;
  abbrev: string;
  type: string;
  featured: boolean;
  country: string;
  description: string;
  administrator: string;
  founded: number | null;
  launchers: string;
  spacecraft: string;
  image?: string;
  logo?: string;
  total: number;
  success: number;
  failed: number;
  pending: number;
  landingsSuccess: number;
  wiki: string;
  info: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  syncing?: boolean;
}
