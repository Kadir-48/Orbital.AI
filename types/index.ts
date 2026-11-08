export type NavigationSection =
  | 'home'
  | 'launches'
  | 'missions'
  | 'rockets'
  | 'spacecraft'
  | 'astronauts'
  | 'agencies'
  | 'comparisons'
  | 'astronomy'
  | 'news'
  | 'spaceweather'
  | 'satellites'
  | 'encyclopedia'
  | 'assistant';

export interface GroundingSource {
  title: string;
  uri: string;
  retrievedAt?: string;
  sourceType?: 'official' | 'web' | 'live_feed';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: GroundingSource[];
  isThinking?: boolean;
}





export interface SatelliteItem {
  id: string;
  name: string;
  noradId: number;
  type: 'Space Station' | 'Observatory' | 'Earth Observation' | 'Communications' | 'Navigation';
  operator: string;
  country: string;
  description: string;
  sourceUrl: string;
}



export interface NewsArticleItem {
  id: string;
  title: string;
  summary: string;
  newsSite: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
  category: 'All' | 'NASA' | 'ISRO' | 'SpaceX' | 'Launches' | 'Science' | 'Astronomy' | 'Industry';
}

export interface APODData {
  title: string;
  date: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: 'image' | 'video' | 'other';
  thumbnail_url?: string;
  copyright?: string;
}

export interface SpaceWeatherAlert {
  id: string;
  code: string;
  issued: string;
  headline: string;
  message: string;
}

export interface SpaceWeatherMetric {
  source: string;
  fetchedAt: string;
  kp?: { value: number; time: string; status: string };
  kpHistory?: Array<{ time: string; kp: number }>;
  solarWind?: { speedKmS: number; densityPcm3: number | null; time: string; spacecraft?: string };
  xray?: { currentClass?: string; latestFlareClass?: string; latestFlareTime?: string; satellite?: string };
  scales?: {
    current: { R: number; S: number; G: number };
    forecast: {
      date: string;
      radioBlackoutMinorProb: number | null;
      radioBlackoutMajorProb: number | null;
      radiationStormProb: number | null;
      geomagneticScale: number | null;
    } | null;
  };
  alerts?: SpaceWeatherAlert[];
}

export interface GlossaryTerm {
  term: string;
  acronymFor?: string;
  category: 'Orbital Mechanics' | 'Rocket Propulsion' | 'Flight Operations' | 'Astrodynamics' | 'Space Environment';
  definition: string;
  detailedExplanation: string;
  example: string;
}

