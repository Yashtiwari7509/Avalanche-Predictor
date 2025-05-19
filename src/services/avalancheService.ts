
import { AvalanchePrediction, AvalancheFormData, Location, RiskLevel } from "../types/avalanche";

// Using the NWAC (Northwest Avalanche Center) API as one of our data sources
// We will also use the Swiss SLF and European EAWS data when available
const API_BASE_URL = "https://api.avalanche.org/v2";

export const fetchLocations = async (): Promise<Location[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/public/products/map-layer`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch locations');
    }
    
    const data = await response.json();
    
    // Transform the API response to match our Location interface
    return data.features.map((feature: any) => ({
      id: feature.id || String(feature.properties.id),
      name: feature.properties.name,
      region: feature.properties.center_name || feature.properties.state,
      country: "USA" // Most data from this API is US-based
    }));
  } catch (error) {
    console.error("Error fetching locations:", error);
    // Return some fallback locations in case the API fails
    return [
      { id: "NWAC", name: "Washington", region: "Pacific Northwest", country: "USA" },
      { id: "CAIC", name: "Colorado", region: "Rocky Mountains", country: "USA" },
      { id: "CBAC", name: "Crested Butte", region: "Colorado", country: "USA" },
      { id: "FAC", name: "Flathead", region: "Montana", country: "USA" },
      { id: "GNFAC", name: "Gallatin", region: "Montana", country: "USA" }
    ];
  }
};

export const fetchPrediction = async (locationId: string): Promise<AvalanchePrediction | null> => {
  try {
    // First fetch the forecast for the selected location
    const response = await fetch(`${API_BASE_URL}/public/product/${locationId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch prediction');
    }
    
    const data = await response.json();
    
    // Find the location details
    const locationsResponse = await fetch(`${API_BASE_URL}/public/products/map-layer`);
    const locationsData = await locationsResponse.json();
    const locationFeature = locationsData.features.find((feature: any) => 
      feature.id === locationId || String(feature.properties.id) === locationId
    );
    
    if (!locationFeature) {
      throw new Error('Location not found');
    }
    
    // Transform the API response to our AvalanchePrediction interface
    const location: Location = {
      id: locationId,
      name: locationFeature.properties.name,
      region: locationFeature.properties.center_name || locationFeature.properties.state,
      country: "USA"
    };

    // Parse the forecast data
    const forecastData = data.product?.forecast?.avalanche_forecast;
    if (!forecastData) {
      throw new Error('No forecast data available');
    }

    // Parse danger levels
    const dangerLevel = determineDangerLevel(forecastData);
    
    // Extract weather data from forecast
    const weatherData = forecastData.weather?.data?.[0] || {};
    
    // Extract avalanche problems
    const avalancheProblems = forecastData.avalanche_problems || [];

    // Transform to our prediction model
    const prediction: AvalanchePrediction = {
      location,
      date: new Date().toISOString(),
      riskLevel: mapDangerToRisk(dangerLevel),
      weatherCondition: {
        temperature: extractTemperature(weatherData),
        precipitation: extractPrecipitation(weatherData),
        windSpeed: extractWindSpeed(weatherData),
        windDirection: extractWindDirection(weatherData),
        visibility: "Variable", // Often not directly provided by APIs
        forecast: extractForecastSummary(weatherData, forecastData)
      },
      snowpack: {
        depth: extractSnowDepth(forecastData),
        newSnow24h: extractNewSnow(forecastData, 24),
        newSnow48h: extractNewSnow(forecastData, 48),
        newSnow7d: extractNewSnow(forecastData, 168), // 7 days in hours
        snowpackStability: extractSnowpackStability(forecastData, avalancheProblems),
        weakLayers: determineWeakLayers(avalancheProblems)
      },
      terrainFactors: {
        elevation: extractElevation(forecastData),
        slope: 30, // Default, usually not specified in forecasts
        aspect: extractAspect(avalancheProblems),
        treeLineLevel: "variable", // Not always available in forecasts
        vegetation: "Variable" // Not always specified
      },
      warningDetails: extractWarningDetails(forecastData),
      safetyRecommendations: extractSafetyRecommendations(forecastData, dangerLevel),
      validityPeriod: extractValidityPeriod(forecastData),
      history: [] // Historical data typically requires separate API calls
    };
    
    return prediction;
  } catch (error) {
    console.error("Error fetching prediction:", error);
    return null;
  }
};

export const getPredictionFromInputs = async (formData: AvalancheFormData): Promise<AvalanchePrediction | null> => {
  try {
    // First get the base prediction for the location
    const basePrediction = await fetchPrediction(formData.locationId);
    
    if (!basePrediction) {
      throw new Error('Failed to get base prediction');
    }
    
    // Enhance the prediction with user input data
    // This is where we would typically call a machine learning model or risk assessment API
    // For now, we'll simulate this by adjusting the risk level based on input parameters
    
    // Calculate modified risk level based on submitted parameters
    const riskLevel = calculateRiskFromInputs(formData, basePrediction.riskLevel);
    
    // Create an enhanced prediction with user inputs
    const enhancedPrediction: AvalanchePrediction = {
      ...basePrediction,
      riskLevel,
      weatherCondition: {
        ...basePrediction.weatherCondition,
        temperature: formData.temperature,
        windSpeed: formData.windSpeed,
        visibility: formData.visibility
      },
      snowpack: {
        ...basePrediction.snowpack,
        newSnow24h: formData.newSnow24h,
        newSnow48h: formData.newSnow48h,
      },
      terrainFactors: {
        ...basePrediction.terrainFactors,
        elevation: formData.elevation,
        slope: formData.slope,
        aspect: formData.aspect,
        treeLineLevel: formData.treeLineLevel
      },
      // Update warning details and safety recommendations based on new risk level
      warningDetails: generateWarningDetails(riskLevel, formData),
      safetyRecommendations: generateSafetyRecommendations(riskLevel)
    };
    
    return enhancedPrediction;
  } catch (error) {
    console.error("Error generating prediction from inputs:", error);
    return null;
  }
};

// Helper functions to parse and transform API data

function mapDangerToRisk(dangerLevel: number): RiskLevel {
  // Convert NWAC danger levels (1-5) to our risk levels
  switch (dangerLevel) {
    case 1: return "low";
    case 2: return "moderate";
    case 3: return "considerable";
    case 4: return "high";
    case 5: return "extreme";
    default: return "moderate";
  }
}

function determineDangerLevel(forecastData: any): number {
  // Extract danger ratings from forecast data
  const dangerRatings = forecastData.danger_ratings || [];
  
  if (!dangerRatings.length) return 2; // Default to moderate if no data
  
  // Get the highest danger rating for any elevation
  let highestDanger = 1;
  dangerRatings.forEach((rating: any) => {
    Object.values(rating.ratings || {}).forEach((value: any) => {
      const dangerValue = Number(value);
      if (dangerValue > highestDanger) {
        highestDanger = dangerValue;
      }
    });
  });
  
  return highestDanger;
}

function extractTemperature(weatherData: any): number {
  // Extract temperature from weather data
  return weatherData.temp_max || weatherData.temp_mid || weatherData.temp_min || -5;
}

function extractPrecipitation(weatherData: any): number {
  // Extract precipitation from weather data
  return weatherData.precip || weatherData.snow_water_equiv || 0;
}

function extractWindSpeed(weatherData: any): number {
  // Extract wind speed from weather data
  return weatherData.wind_speed || weatherData.wind_gust || 0;
}

function extractWindDirection(weatherData: any): string {
  // Extract wind direction from weather data
  return weatherData.wind_dir || "Variable";
}

function extractForecastSummary(weatherData: any, forecastData: any): string {
  // Extract forecast summary
  return forecastData.bottom_line || weatherData.weather || "No forecast available";
}

function extractSnowDepth(forecastData: any): number {
  // Extract snow depth
  return forecastData.snow_depth || forecastData.snow_height || 100;
}

function extractNewSnow(forecastData: any, hours: number): number {
  // Extract new snow over time period
  const snowData = forecastData.snow_data || {};
  if (hours === 24) return snowData.snow_24 || 0;
  if (hours === 48) return snowData.snow_48 || 0;
  if (hours === 168) return snowData.snow_7days || 0;
  return 0;
}

function extractSnowpackStability(forecastData: any, problems: any[]): string {
  // Determine snowpack stability based on forecast and problems
  if (problems.length > 2) return "Poor";
  if (problems.length > 0) return "Moderate";
  return "Good";
}

function determineWeakLayers(problems: any[]): boolean {
  // Check if weak layers are mentioned in avalanche problems
  for (const problem of problems) {
    const problemType = problem.type?.toLowerCase() || '';
    if (
      problemType.includes('persistent') || 
      problemType.includes('deep') || 
      problemType.includes('weak')
    ) {
      return true;
    }
  }
  return false;
}

function extractElevation(forecastData: any): number {
  // Extract elevation data, default to mid-mountain
  return forecastData.elevation_mid || 2000;
}

function extractAspect(problems: any[]): string {
  // Determine most concerning aspect from problems
  if (!problems.length) return "N";
  
  const aspectCounts: Record<string, number> = { N: 0, NE: 0, E: 0, SE: 0, S: 0, SW: 0, W: 0, NW: 0 };
  
  problems.forEach((problem: any) => {
    const aspects = problem.aspects || [];
    aspects.forEach((aspect: string) => {
      if (aspectCounts[aspect] !== undefined) {
        aspectCounts[aspect]++;
      }
    });
  });
  
  // Return the aspect with highest count
  let maxCount = 0;
  let maxAspect = "N";
  
  Object.entries(aspectCounts).forEach(([aspect, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxAspect = aspect;
    }
  });
  
  return maxAspect;
}

function extractWarningDetails(forecastData: any): string {
  // Extract warning details from forecast
  return forecastData.bottom_line || 
         forecastData.highlights || 
         "Check local forecast for detailed avalanche warnings.";
}

function extractSafetyRecommendations(forecastData: any, dangerLevel: number): string[] {
  // Base recommendations
  const commonRecs = [
    "Carry avalanche safety equipment (beacon, shovel, probe)",
    "Never travel alone in avalanche terrain",
    "Check the latest avalanche bulletin before heading out"
  ];
  
  // Add recommendations based on danger level
  const levelRecs = generateSafetyRecommendations(mapDangerToRisk(dangerLevel));
  
  // Add any specific recommendations from forecast
  const forecastRecs = [];
  if (forecastData.travel_advice) {
    forecastRecs.push(forecastData.travel_advice);
  }
  
  // Combine and deduplicate
  return [...new Set([...levelRecs, ...forecastRecs, ...commonRecs])];
}

function extractValidityPeriod(forecastData: any): string {
  // Extract validity period from forecast
  const startDate = forecastData.published_time ? new Date(forecastData.published_time) : new Date();
  const endDate = forecastData.expires_time ? new Date(forecastData.expires_time) : new Date(startDate.getTime() + 86400000);
  
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

function calculateRiskFromInputs(formData: AvalancheFormData, baseRisk: RiskLevel): RiskLevel {
  // Calculate risk based on a combination of base risk and user inputs
  // This would ideally use a proper risk model
  
  let riskScore = 0;
  
  // Base risk level contributes points
  switch (baseRisk) {
    case "low": riskScore += 1; break;
    case "moderate": riskScore += 2; break;
    case "considerable": riskScore += 3; break;
    case "high": riskScore += 4; break;
    case "extreme": riskScore += 5; break;
  }
  
  // New snow adds risk
  if (formData.newSnow24h > 30) riskScore += 3;
  else if (formData.newSnow24h > 20) riskScore += 2;
  else if (formData.newSnow24h > 10) riskScore += 1;
  
  // Steep slopes add risk
  if (formData.slope > 35) riskScore += 2;
  else if (formData.slope > 30) riskScore += 1;
  
  // High wind adds risk
  if (formData.windSpeed > 40) riskScore += 2;
  else if (formData.windSpeed > 20) riskScore += 1;
  
  // Temperature near freezing can add risk (wet avalanches)
  if (formData.temperature > -2 && formData.temperature < 2) riskScore += 1;
  
  // Map score back to risk level
  if (riskScore >= 8) return "extreme";
  if (riskScore >= 6) return "high";
  if (riskScore >= 4) return "considerable";
  if (riskScore >= 2) return "moderate";
  return "low";
}

function generateWarningDetails(riskLevel: RiskLevel, formData: AvalancheFormData): string {
  switch(riskLevel) {
    case "extreme":
      return "EXTREME DANGER: Natural and human-triggered avalanches are certain. Avoid all avalanche terrain.";
    case "high":
      return `HIGH DANGER: Natural avalanches likely and human-triggered avalanches very likely. Travel in avalanche terrain is not recommended. ${formData.newSnow24h > 20 ? "Heavy recent snowfall increases risk significantly." : ""} ${formData.windSpeed > 30 ? "High winds have created dangerous wind slabs." : ""}`;
    case "considerable":
      return `CONSIDERABLE DANGER: Natural avalanches possible and human-triggered avalanches likely. ${formData.slope > 30 ? `Be particularly careful on slopes over ${formData.slope}°.` : ""} Cautious route selection required.`;
    case "moderate":
      return `MODERATE DANGER: Natural avalanches unlikely but human-triggered avalanches possible. ${formData.newSnow24h > 5 ? "Recent snow may have created isolated instabilities." : ""} Use caution in steep terrain.`;
    case "low":
      return "LOW DANGER: Natural and human-triggered avalanches unlikely except in isolated pockets. Generally safe conditions but always practice standard safety protocols.";
  }
}

function generateSafetyRecommendations(riskLevel: RiskLevel): string[] {
  const common = [
    "Carry avalanche safety equipment (beacon, shovel, probe)",
    "Never travel alone in avalanche terrain",
    "Check the latest avalanche bulletin before heading out"
  ];

  switch(riskLevel) {
    case "extreme":
      return [
        "DO NOT travel in avalanche terrain",
        "Avoid being below avalanche terrain",
        "Consider postponing your trip",
        ...common
      ];
    case "high":
      return [
        "Avoid all avalanche terrain",
        "Stay on gentle slopes less than 25 degrees",
        "Maintain wide spacing between group members",
        ...common
      ];
    case "considerable":
      return [
        "Careful snowpack evaluation essential",
        "Select routes to avoid known avalanche terrain",
        "Travel one-at-a-time in risky areas",
        "Maintain safe spacing when ascending or descending",
        ...common
      ];
    case "moderate":
      return [
        "Use caution in steeper terrain",
        "Evaluate snow and terrain carefully",
        "Identify features of concern",
        ...common
      ];
    case "low":
      return [
        "Generally safe conditions, but remain vigilant",
        "Be aware of changing weather conditions",
        "Assess terrain traps and exposure",
        ...common
      ];
  }
}

