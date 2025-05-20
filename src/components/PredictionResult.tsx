
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AvalanchePrediction } from '@/types/avalanche';
import { RiskIndicator } from './RiskIndicator';
import { Separator } from '@/components/ui/separator';
import { CloudSnow, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PredictionResultProps {
  prediction: AvalanchePrediction;
}

export const PredictionResult: React.FC<PredictionResultProps> = ({ prediction }) => {
  if (!prediction) return null;

  const { 
    location, 
    date, 
    riskLevel, 
    weatherCondition, 
    snowpack, 
    terrainFactors,
    warningDetails,
    safetyRecommendations,
    history
  } = prediction;

  // Background color based on risk level
  const getBgColor = () => {
    switch (riskLevel) {
      case 'low': return 'bg-sky-200';
      case 'moderate': return 'bg-yellow-50';
      case 'considerable': return 'bg-orange-50';
      case 'high': return 'bg-red-50';
      case 'extreme': return 'bg-red-100';
      default: return 'bg-white';
    }
  };

  return (
    <Card className={`w-full ${getBgColor()}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl mb-2">{location.name}, {location.region}</CardTitle>
            <CardDescription>
              {new Date(date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end">
            <RiskIndicator risk={riskLevel} size="lg" />
            <span className="text-sm text-muted-foreground mt-1">Avalanche Risk</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Warning alert for high and extreme risk */}
        {(riskLevel === 'high' || riskLevel === 'extreme') && (
          <div className={`p-4 rounded-md ${riskLevel === 'extreme' ? 'bg-red-200' : 'bg-red-100'} flex gap-3`}>
            <AlertTriangle className={`h-6 w-6 ${riskLevel === 'extreme' ? 'text-red-700' : 'text-red-500'}`} />
            <div>
              <h4 className={`font-bold ${riskLevel === 'extreme' ? 'text-red-700' : 'text-red-500'}`}>Warning</h4>
              <p className="text-sm">{warningDetails}</p>
            </div>
          </div>
        )}

        {/* General warning details for other risk levels */}
        {riskLevel !== 'high' && riskLevel !== 'extreme' && (
          <div className="text-sm">{warningDetails}</div>
        )}

        <Separator />

        {/* Detailed information */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="weather">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <CloudSnow className="h-5 w-5" />
                <span>Weather Conditions</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <div className="text-sm text-muted-foreground">Temperature</div>
                  <div className="font-medium">{weatherCondition.temperature}°C</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Precipitation</div>
                  <div className="font-medium">{weatherCondition.precipitation} mm</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Wind</div>
                  <div className="font-medium">{weatherCondition.windSpeed} km/h {weatherCondition.windDirection}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Visibility</div>
                  <div className="font-medium">{weatherCondition.visibility}</div>
                </div>
              </div>
              {weatherCondition.forecast && (
                <div className="mt-3">
                  <div className="text-sm text-muted-foreground">Forecast</div>
                  <div className="text-sm">{weatherCondition.forecast}</div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="snowpack">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <CloudSnow className="h-5 w-5" />
                <span>Snowpack Information</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <div className="text-sm text-muted-foreground">Total Depth</div>
                  <div className="font-medium">{snowpack.depth} cm</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">New Snow (24h)</div>
                  <div className="font-medium">{snowpack.newSnow24h} cm</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">New Snow (48h)</div>
                  <div className="font-medium">{snowpack.newSnow48h} cm</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">New Snow (7 days)</div>
                  <div className="font-medium">{snowpack.newSnow7d} cm</div>
                </div>
              </div>
              <div className="mt-3">
                <div className="text-sm text-muted-foreground">Stability</div>
                <div className="text-sm">{snowpack.snowpackStability}</div>
              </div>
              {snowpack.weakLayers && (
                <div className="mt-2">
                  <Badge variant="outline" className="bg-amber-100 text-amber-700 hover:bg-amber-100">
                    Weak layers present
                  </Badge>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="terrain">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <CloudSnow className="h-5 w-5" />
                <span>Terrain Factors</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-4 py-2">
                <div>
                  <div className="text-sm text-muted-foreground">Elevation</div>
                  <div className="font-medium">{terrainFactors.elevation} m</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Slope</div>
                  <div className="font-medium">{terrainFactors.slope}°</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Aspect</div>
                  <div className="font-medium">{terrainFactors.aspect}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tree Line</div>
                  <div className="font-medium">{terrainFactors.treeLineLevel.charAt(0).toUpperCase() + terrainFactors.treeLineLevel.slice(1)}</div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="safety">
            <AccordionTrigger>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Safety Recommendations</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-5 space-y-1">
                {safetyRecommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm">{recommendation}</li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {history && history.length > 0 && (
            <AccordionItem value="history">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <CloudSnow className="h-5 w-5" />
                  <span>Recent Avalanche History</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {history.map((event, index) => (
                    <div key={index} className="border-b pb-2 last:border-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {new Date(event.date).toLocaleDateString()}
                        </span>
                        <RiskIndicator risk={event.riskLevel} size="sm" showLabel={false} />
                      </div>
                      <div className="text-sm text-muted-foreground">{event.location}</div>
                      <div className="text-sm mt-1">{event.details}</div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};
