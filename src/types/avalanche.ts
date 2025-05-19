
export type RiskLevel = 'low' | 'moderate' | 'considerable' | 'high' | 'extreme';

export interface Location {
  id: string;
  name: string;
  region: string;
  country: string;
}

export interface WeatherCondition {
  temperature: number; // in Celsius
  precipitation: number; // in mm
  windSpeed: number; // in km/h
  windDirection: string;
  visibility: string;
  forecast: string;
}

export interface Snowpack {
  depth: number; // in cm
  newSnow24h: number; // in cm
  newSnow48h: number; // in cm
  newSnow7d: number; // in cm
  snowpackStability: string;
  weakLayers: boolean;
}

export interface TerrainFactor {
  elevation: number; // in meters
  slope: number; // in degrees
  aspect: string; // N, NE, E, SE, S, SW, W, NW
  treeLineLevel: string; // below, near, above
  vegetation: string;
}

export interface AvalancheHistory {
  date: string;
  location: string;
  riskLevel: RiskLevel;
  details: string;
}

export interface AvalanchePrediction {
  location: Location;
  date: string;
  riskLevel: RiskLevel;
  weatherCondition: WeatherCondition;
  snowpack: Snowpack;
  terrainFactors: TerrainFactor;
  warningDetails: string;
  safetyRecommendations: string[];
  validityPeriod: string;
  history: AvalancheHistory[];
}

export interface AvalancheFormData {
  locationId: string;
  elevation: number;
  slope: number;
  aspect: string;
  treeLineLevel: string;
  newSnow24h: number;
  newSnow48h: number;
  temperature: number;
  windSpeed: number;
  visibility: string;
}
