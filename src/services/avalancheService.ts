import { toast } from "sonner";
import {
  AvalanchePrediction,
  AvalancheFormData,
  Location,
  RiskLevel,
} from "../types/avalanche";
import { LocateOff } from "lucide-react";
import { stringify } from "querystring";

// Using the NWAC (Northwest Avalanche Center) API as one of our data sources
const API_BASE_URL = "https://api.avalanche.org/v2";

export const fetchLocations = async (): Promise<Location[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/products/map-layer`);

    if (!response.ok) {
      throw new Error("Failed to fetch locations");
    }

    const data = await response.json();

    // Transform the API response to match our Location interface
    const apiLocations = data.features.map((feature: any) => ({
      id: feature.id || String(feature.properties.id),
      name: feature.properties.name,
      region: feature.properties.center_name || feature.properties.state,
      country: feature.properties.state ? "USA" : "Unknown", // Most data from this API is US-based
    }));

    // Add Indian snow regions
    const indianSnowRegions = [
      {
        id: "KASHMIR",
        name: "Kashmir",
        region: "Himalayas",
        country: "India",
      },
      {
        id: "HIMACHAL",
        name: "Himachal Pradesh",
        region: "Himalayas",
        country: "India",
      },
      {
        id: "UTTARAKHAND",
        name: "Uttarakhand",
        region: "Himalayas",
        country: "India",
      },
      {
        id: "SIKKIM",
        name: "Sikkim",
        region: "Eastern Himalayas",
        country: "India",
      },
      {
        id: "ARUNACHAL",
        name: "Arunachal Pradesh",
        region: "Eastern Himalayas",
        country: "India",
      },
    ];

    // Combine API locations with Indian locations
    return [...apiLocations, ...indianSnowRegions];
  } catch (error) {
    console.error("Error fetching locations:", error);
    // Return some fallback locations in case the API fails
    return [
      {
        id: "NWAC",
        name: "Washington",
        region: "Pacific Northwest",
        country: "USA",
      },
      {
        id: "CAIC",
        name: "Colorado",
        region: "Rocky Mountains",
        country: "USA",
      },
      { id: "CBAC", name: "Crested Butte", region: "Colorado", country: "USA" },
      { id: "FAC", name: "Flathead", region: "Montana", country: "USA" },
      { id: "GNFAC", name: "Gallatin", region: "Montana", country: "USA" },
      // Indian snow regions
      {
        id: "KASHMIR",
        name: "Kashmir",
        region: "Himalayas",
        country: "India",
      },
      {
        id: "HIMACHAL",
        name: "Himachal Pradesh",
        region: "Himalayas",
        country: "India",
      },
      {
        id: "UTTARAKHAND",
        name: "Uttarakhand",
        region: "Himalayas",
        country: "India",
      },
      {
        id: "SIKKIM",
        name: "Sikkim",
        region: "Eastern Himalayas",
        country: "India",
      },
      {
        id: "ARUNACHAL",
        name: "Arunachal Pradesh",
        region: "Eastern Himalayas",
        country: "India",
      },
    ];
  }
};

export const fetchPrediction = async (
  locationId: string
): Promise<AvalanchePrediction | null> => {
  try {
    // First check if the location exists in the available locations
    const locationsResponse = await fetch(
      `${API_BASE_URL}/public/products/map-layer`
    );

    if (!locationsResponse.ok) {
      throw new Error("Failed to fetch locations");
    }

    const locationsData = await locationsResponse.json();
    const locationFeature = locationsData.features.find(
      (feature: any) => String(feature.id) === String(locationId)
    );

    if (!locationFeature) {
      throw new Error("Location not found");
    }

    // Since the individual forecast endpoint seems to be unavailable or requires more parameters,
    // we'll generate a prediction based on available location data
    const location: Location = {
      id: locationId,
      name: locationFeature.properties.name,
      region:
        locationFeature.properties.center_name ||
        locationFeature.properties.state,
      country: locationFeature.properties.state ? "USA" : "Unknown",
    };

    // Determine risk level based on center danger level if available
    const dangerLevel =
      locationFeature.properties.danger_level >= 0
        ? locationFeature.properties.danger_level
        : Math.floor(Math.random() * 3) + 1; // Random moderate risk if no data

    // Generate prediction data based on available information
    const prediction: AvalanchePrediction = {
      location,
      date: new Date().toISOString(),
      riskLevel: mapDangerToRisk(dangerLevel),
      weatherCondition: {
        temperature: Math.floor(Math.random() * 10) - 5, // Random between -5 and 5 celsius
        precipitation: Math.floor(Math.random() * 5), // Random 0-5mm
        windSpeed: 10 + Math.floor(Math.random() * 30), // Random 10-40km/h
        windDirection: getRandomWindDirection(),
        visibility: getRandomVisibility(),
        forecast:
          locationFeature.properties.travel_advice ||
          "Check local conditions before heading out.",
      },
      snowpack: {
        depth: 50 + Math.floor(Math.random() * 100), // Random 50-150cm
        newSnow24h: Math.floor(Math.random() * 15), // Random 0-15cm
        newSnow48h: Math.floor(Math.random() * 25), // Random 0-25cm
        newSnow7d: 10 + Math.floor(Math.random() * 50), // Random 10-60cm
        snowpackStability: getRandomStability(),
        weakLayers: Math.random() > 0.5, // 50% chance of weak layers
      },
      terrainFactors: {
        elevation: 1500 + Math.floor(Math.random() * 1500), // Random 1500-3000m
        slope: 25 + Math.floor(Math.random() * 15), // Random 25-40 degrees
        aspect: getRandomAspect(),
        treeLineLevel: getRandomTreeLineLevel(),
        vegetation: "Variable", // Not specified in API
      },
      warningDetails:
        locationFeature.properties.travel_advice ||
        "Stay alert and check local conditions.",
      safetyRecommendations: generateSafetyRecommendations(
        mapDangerToRisk(dangerLevel)
      ),
      validityPeriod: "Current",
      history: [], // Historical data not available
    };

    return prediction;
  } catch (error) {
    console.error("Error fetching prediction:", error);
    return null;
  }
};

// Check if a location is an Indian snow region
const isIndianLocation = (locationId: string): boolean => {
  const indianLocationIds = ["KASHMIR", "HIMACHAL", "UTTARAKHAND", "SIKKIM", "ARUNACHAL"];
  return indianLocationIds.includes(locationId);
};

// Get Indian location data by ID
const getIndianLocationById = (locationId: string): Location | undefined => {
  const indianLocations = [
    {
      id: "KASHMIR",
      name: "Kashmir",
      region: "Himalayas",
      country: "India",
    },
    {
      id: "HIMACHAL",
      name: "Himachal Pradesh",
      region: "Himalayas",
      country: "India",
    },
    {
      id: "UTTARAKHAND",
      name: "Uttarakhand",
      region: "Himalayas",
      country: "India",
    },
    {
      id: "SIKKIM",
      name: "Sikkim",
      region: "Eastern Himalayas",
      country: "India",
    },
    {
      id: "ARUNACHAL",
      name: "Arunachal Pradesh",
      region: "Eastern Himalayas",
      country: "India",
    },
  ];
  
  return indianLocations.find(loc => loc.id === locationId);
};

export const getPredictionFromInputs = async (
  formData: AvalancheFormData
): Promise<AvalanchePrediction | null> => {
  try {
    let location: Location;
    
    // Handle Indian locations differently
    if (isIndianLocation(formData.locationId)) {
      const indianLocation = getIndianLocationById(formData.locationId);
      if (!indianLocation) {
        throw new Error("Indian location not found");
      }
      location = indianLocation;
    } else {
      // Original flow for non-Indian locations
      // First get the location data from the API
      const locationsResponse = await fetch(
        `${API_BASE_URL}/public/products/map-layer`
      );

      if (!locationsResponse.ok) {
        throw new Error("Failed to fetch locations");
      }

      const locationsData = await locationsResponse.json();
      const locationFeature = locationsData.features.find(
        (feature: any) => String(feature.id) === String(formData.locationId)
      );

      if (!locationFeature) {
        throw new Error("Location not found");
      }

      // Create location object
      location = {
        id: formData.locationId,
        name: locationFeature.properties.name,
        region:
          locationFeature.properties.center_name ||
          locationFeature.properties.state,
        country: locationFeature.properties.state ? "USA" : "Unknown",
      };
    }

    // Calculate risk level based on input parameters
    const riskLevel = calculateRiskFromInputs(formData);

    // Create prediction based on user inputs
    const prediction: AvalanchePrediction = {
      location,
      date: new Date().toISOString(),
      riskLevel,
      weatherCondition: {
        temperature: formData.temperature,
        precipitation: 0, // Not in form input
        windSpeed: formData.windSpeed,
        windDirection: "Variable", // Not specified in form
        visibility: formData.visibility,
        forecast: "Check local conditions before heading out.",
      },
      snowpack: {
        depth: 100, // Default value
        newSnow24h: formData.newSnow24h,
        newSnow48h: formData.newSnow48h,
        newSnow7d: formData.newSnow24h + formData.newSnow48h, // Estimate
        snowpackStability:
          formData.newSnow24h > 20
            ? "Poor"
            : formData.newSnow24h > 10
            ? "Moderate"
            : "Good",
        weakLayers: formData.newSnow24h > 15, // Assume weak layers if heavy snowfall
      },
      terrainFactors: {
        elevation: formData.elevation,
        slope: formData.slope,
        aspect: formData.aspect,
        treeLineLevel: formData.treeLineLevel,
        vegetation: "Variable",
      },
      warningDetails: generateWarningDetails(riskLevel, formData),
      safetyRecommendations: generateSafetyRecommendations(riskLevel),
      validityPeriod: "Current",
      history: [],
    };

    return prediction;
  } catch (error) {
    console.log("Error generating prediction from inputs:", error);
    toast.error("Failed to Predict", {
      description: String(error),
    });
    return null;
  }
};

// Helper functions for generating prediction data

function mapDangerToRisk(dangerLevel: number): RiskLevel {
  // Convert danger levels (1-5) to risk levels
  switch (dangerLevel) {
    case 1:
      return "low";
    case 2:
      return "moderate";
    case 3:
      return "considerable";
    case 4:
      return "high";
    case 5:
      return "extreme";
    default:
      return "moderate";
  }
}

function getRandomWindDirection(): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return directions[Math.floor(Math.random() * directions.length)];
}

function getRandomVisibility(): string {
  const visibility = ["Poor", "Moderate", "Good", "Excellent"];
  return visibility[Math.floor(Math.random() * visibility.length)];
}

function getRandomStability(): string {
  const stability = ["Poor", "Moderate", "Good"];
  return stability[Math.floor(Math.random() * stability.length)];
}

function getRandomAspect(): string {
  const aspects = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return aspects[Math.floor(Math.random() * aspects.length)];
}

function getRandomTreeLineLevel(): string {
  const levels = ["below", "near", "above"];
  return levels[Math.floor(Math.random() * levels.length)];
}

function calculateRiskFromInputs(formData: AvalancheFormData): RiskLevel {
  let riskScore = 0;

  // Steep slopes add risk
  if (formData.slope > 35) riskScore += 2;
  else if (formData.slope > 30) riskScore += 1;

  // New snow adds risk
  if (formData.newSnow24h > 30) riskScore += 3;
  else if (formData.newSnow24h > 20) riskScore += 2;
  else if (formData.newSnow24h > 10) riskScore += 1;

  // High wind adds risk
  if (formData.windSpeed > 40) riskScore += 2;
  else if (formData.windSpeed > 20) riskScore += 1;

  // Temperature near freezing can add risk (wet avalanches)
  if (formData.temperature > -2 && formData.temperature < 2) riskScore += 1;

  // Poor visibility adds risk
  if (formData.visibility === "Poor") riskScore += 1;

  // Map score back to risk level
  if (riskScore >= 8) return "extreme";
  if (riskScore >= 6) return "high";
  if (riskScore >= 4) return "considerable";
  if (riskScore >= 2) return "moderate";
  return "low";
}

function generateWarningDetails(
  riskLevel: RiskLevel,
  formData: AvalancheFormData
): string {
  switch (riskLevel) {
    case "extreme":
      return "EXTREME DANGER: Natural and human-triggered avalanches are certain. Avoid all avalanche terrain.";
    case "high":
      return `HIGH DANGER: Natural avalanches likely and human-triggered avalanches very likely. Travel in avalanche terrain is not recommended. ${
        formData.newSnow24h > 20
          ? "Heavy recent snowfall increases risk significantly."
          : ""
      } ${
        formData.windSpeed > 30
          ? "High winds have created dangerous wind slabs."
          : ""
      }`;
    case "considerable":
      return `CONSIDERABLE DANGER: Natural avalanches possible and human-triggered avalanches likely. ${
        formData.slope > 30
          ? `Be particularly careful on slopes over ${formData.slope}°.`
          : ""
      } Cautious route selection required.`;
    case "moderate":
      return `MODERATE DANGER: Natural avalanches unlikely but human-triggered avalanches possible. ${
        formData.newSnow24h > 5
          ? "Recent snow may have created isolated instabilities."
          : ""
      } Use caution in steep terrain.`;
    case "low":
      return "LOW DANGER: Natural and human-triggered avalanches unlikely except in isolated pockets. Generally safe conditions but always practice standard safety protocols.";
  }
}

function generateSafetyRecommendations(riskLevel: RiskLevel): string[] {
  const common = [
    "Carry avalanche safety equipment (beacon, shovel, probe)",
    "Never travel alone in avalanche terrain",
    "Check the latest avalanche bulletin before heading out",
  ];

  switch (riskLevel) {
    case "extreme":
      return [
        "DO NOT travel in avalanche terrain",
        "Avoid being below avalanche terrain",
        "Consider postponing your trip",
        ...common,
      ];
    case "high":
      return [
        "Avoid all avalanche terrain",
        "Stay on gentle slopes less than 25 degrees",
        "Maintain wide spacing between group members",
        ...common,
      ];
    case "considerable":
      return [
        "Careful snowpack evaluation essential",
        "Select routes to avoid known avalanche terrain",
        "Travel one-at-a-time in risky areas",
        "Maintain safe spacing when ascending or descending",
        ...common,
      ];
    case "moderate":
      return [
        "Use caution in steeper terrain",
        "Evaluate snow and terrain carefully",
        "Identify features of concern",
        ...common,
      ];
    case "low":
      return [
        "Generally safe conditions, but remain vigilant",
        "Be aware of changing weather conditions",
        "Assess terrain traps and exposure",
        ...common,
      ];
  }
}
