
import { AvalanchePrediction, AvalancheFormData, Location } from "../types/avalanche";

// Mock data for demonstration purposes
// In a real app, this would be replaced with actual API calls
const LOCATIONS: Location[] = [
  { id: "1", name: "Whistler", region: "British Columbia", country: "Canada" },
  { id: "2", name: "Chamonix", region: "Mont Blanc", country: "France" },
  { id: "3", name: "Verbier", region: "Valais", country: "Switzerland" },
  { id: "4", name: "Jackson Hole", region: "Wyoming", country: "USA" },
  { id: "5", name: "Niseko", region: "Hokkaido", country: "Japan" }
];

const MOCK_PREDICTIONS: Record<string, AvalanchePrediction> = {
  "1": {
    location: LOCATIONS[0],
    date: new Date().toISOString(),
    riskLevel: "moderate",
    weatherCondition: {
      temperature: -5,
      precipitation: 2.5,
      windSpeed: 30,
      windDirection: "NW",
      visibility: "Good",
      forecast: "Light snowfall expected in the next 24 hours"
    },
    snowpack: {
      depth: 200,
      newSnow24h: 15,
      newSnow48h: 25,
      newSnow7d: 45,
      snowpackStability: "Moderate",
      weakLayers: true
    },
    terrainFactors: {
      elevation: 2200,
      slope: 35,
      aspect: "N",
      treeLineLevel: "near",
      vegetation: "Sparse"
    },
    warningDetails: "Recent wind loading on north-facing slopes has created potential slab formation. Use caution above 2000m on steep north aspects.",
    safetyRecommendations: [
      "Avoid steep north-facing slopes above 2000m",
      "Watch for signs of wind-loading",
      "Perform stability tests before committing to steep terrain",
      "Travel one-at-a-time in risky areas",
      "Maintain safe spacing when ascending or descending"
    ],
    validityPeriod: "November 10, 2025 - November 11, 2025",
    history: [
      {
        date: "2025-11-09",
        location: "Whistler West Bowl",
        riskLevel: "moderate",
        details: "Small slab avalanche triggered by skier, no injuries"
      },
      {
        date: "2025-11-07",
        location: "Whistler Symphony Bowl",
        riskLevel: "low",
        details: "No significant activity reported"
      }
    ]
  }
};

// In a real app, this would be an actual API call
export const fetchLocations = async (): Promise<Location[]> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(LOCATIONS), 500);
  });
};

export const fetchPrediction = async (locationId: string): Promise<AvalanchePrediction | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (MOCK_PREDICTIONS[locationId]) {
        resolve(MOCK_PREDICTIONS[locationId]);
      } else {
        // In case we don't have mock data for this location, create some based on the first item
        const basePrediction = {...MOCK_PREDICTIONS["1"]};
        const location = LOCATIONS.find(loc => loc.id === locationId);
        
        if (location) {
          basePrediction.location = location;
          resolve(basePrediction);
        } else {
          resolve(null);
        }
      }
    }, 1000);
  });
};

// Simulate API call with form data
export const getPredictionFromInputs = async (formData: AvalancheFormData): Promise<AvalanchePrediction | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const location = LOCATIONS.find(loc => loc.id === formData.locationId);
      if (!location) {
        resolve(null);
        return;
      }

      // In a real app, this would use the form data to calculate risk
      // This is just a simple simulation based on some of the input values
      let riskLevel: "low" | "moderate" | "considerable" | "high" | "extreme" = "low";
      
      // Very simplistic risk calculation - in real life this would be much more complex
      if (formData.newSnow24h > 30 || formData.slope > 35 || formData.windSpeed > 40) {
        riskLevel = "extreme";
      } else if (formData.newSnow24h > 20 || formData.slope > 30 || formData.windSpeed > 30) {
        riskLevel = "high";
      } else if (formData.newSnow24h > 10 || formData.slope > 25 || formData.windSpeed > 20) {
        riskLevel = "considerable";
      } else if (formData.newSnow24h > 5 || formData.slope > 20 || formData.windSpeed > 10) {
        riskLevel = "moderate";
      }

      const prediction: AvalanchePrediction = {
        location,
        date: new Date().toISOString(),
        riskLevel,
        weatherCondition: {
          temperature: formData.temperature,
          precipitation: formData.newSnow24h * 0.1, // Just a rough conversion for demo
          windSpeed: formData.windSpeed,
          windDirection: "Variable",
          visibility: formData.visibility,
          forecast: "Generated based on your inputs"
        },
        snowpack: {
          depth: 100 + formData.newSnow24h + formData.newSnow48h,
          newSnow24h: formData.newSnow24h,
          newSnow48h: formData.newSnow48h,
          newSnow7d: formData.newSnow48h + formData.newSnow24h + 10, // Just for demo
          snowpackStability: riskLevel === "low" ? "Good" : riskLevel === "moderate" ? "Moderate" : "Poor",
          weakLayers: riskLevel !== "low"
        },
        terrainFactors: {
          elevation: formData.elevation,
          slope: formData.slope,
          aspect: formData.aspect,
          treeLineLevel: formData.treeLineLevel,
          vegetation: "Unknown"
        },
        warningDetails: generateWarningDetails(riskLevel, formData),
        safetyRecommendations: generateSafetyRecommendations(riskLevel),
        validityPeriod: `${new Date().toDateString()} - ${new Date(new Date().getTime() + 86400000).toDateString()}`,
        history: []
      };
      
      resolve(prediction);
    }, 1500);
  });
};

function generateWarningDetails(riskLevel: "low" | "moderate" | "considerable" | "high" | "extreme", formData: AvalancheFormData): string {
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

function generateSafetyRecommendations(riskLevel: "low" | "moderate" | "considerable" | "high" | "extreme"): string[] {
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
