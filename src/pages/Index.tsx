
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchLocations, fetchPrediction, getPredictionFromInputs } from '@/services/avalancheService';
import { AvalanchePrediction, AvalancheFormData } from '@/types/avalanche';
import { PredictionForm } from '@/components/PredictionForm';
import { PredictionResult } from '@/components/PredictionResult';
import { InfoSection } from '@/components/InfoSection';
import { SnowBackground } from '@/components/SnowBackground';
import { toast } from 'sonner';

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<AvalanchePrediction | null>(null);
  const [isCustomPredicting, setIsCustomPredicting] = useState(false);

  // Fetch available locations
  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  });

  // Fetch prediction for selected location
  const { 
    data: locationPrediction, 
    isLoading: isLoadingPrediction,
    refetch: refetchPrediction
  } = useQuery({
    queryKey: ['prediction', selectedLocation],
    queryFn: () => selectedLocation ? fetchPrediction(selectedLocation) : null,
    enabled: !!selectedLocation,
    onSettled: (data) => {
      if (data) {
        setPrediction(data);
        toast.success("Avalanche prediction loaded", {
          description: `Prediction data for ${data.location.name} is now available.`
        });
      }
    },
    meta: {
      onError: () => {
        toast.error("Failed to load prediction", {
          description: "There was an error retrieving the avalanche prediction data."
        });
      }
    }
  });

  // Handle location selection
  const handleLocationSelect = (locationId: string) => {
    setSelectedLocation(locationId);
  };

  // Handle custom prediction form submission
  const handleCustomPrediction = async (formData: AvalancheFormData) => {
    setIsCustomPredicting(true);
    try {
      const result = await getPredictionFromInputs(formData);
      if (result) {
        setPrediction(result);
        toast.success("Avalanche risk analyzed", {
          description: `Based on your inputs, the risk level is ${result.riskLevel.toUpperCase()}.`
        });
      }
    } catch (error) {
      toast.error("Failed to generate prediction", {
        description: "There was an error analyzing the avalanche risk."
      });
    } finally {
      setIsCustomPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-snow-100 relative">
      {/* Snow effect background */}
      <SnowBackground intensity="light" />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-snow-800 mb-2">Avalanche Risk Predictor</h1>
          <p className="text-snow-600 max-w-2xl mx-auto">
            Get accurate avalanche risk predictions based on location, weather conditions, 
            snowpack data, and terrain factors to stay safe in the mountains.
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-8">
          <Tabs defaultValue="custom" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="custom">Custom Prediction</TabsTrigger>
              <TabsTrigger value="info">Safety Information</TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom" className="space-y-6">
              <PredictionForm 
                locations={locations} 
                onSubmit={handleCustomPrediction} 
                isLoading={isCustomPredicting || isLoadingLocations}
              />
              
              {/* Show skeleton while loading */}
              {(isCustomPredicting || isLoadingPrediction) && (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <Skeleton className="h-8 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-full" />
                      </div>
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-12 w-full" />
                      <div className="grid grid-cols-2 gap-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Show prediction results */}
              {!isCustomPredicting && !isLoadingPrediction && prediction && (
                <PredictionResult prediction={prediction} />
              )}
            </TabsContent>
            
            <TabsContent value="info">
              <InfoSection />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <footer className="bg-snow-200 py-4 mt-12 relative z-10">
        <div className="container mx-auto text-center text-snow-600 text-sm">
          <p>Avalanche Risk Predictor — Always verify with official forecasts.</p>
          <p className="mt-1">Data provided by avalanche.org and regional forecast centers.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
