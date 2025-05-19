
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
import { CloudSnow, MountainSnow, Wind } from 'lucide-react';

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
    onSuccess: (data) => {
      if (data) {
        setPrediction(data);
        toast.success("Avalanche prediction loaded", {
          description: `Prediction data for ${data.location.name} is now available.`,
          icon: <CloudSnow className="h-4 w-4" />
        });
      }
    },
    onError: () => {
      toast.error("Failed to load prediction", {
        description: "There was an error retrieving the avalanche prediction data.",
        icon: <CloudSnow className="h-4 w-4" />
      });
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
          description: `Based on your inputs, the risk level is ${result.riskLevel.toUpperCase()}.`,
          icon: <MountainSnow className="h-4 w-4" />
        });
      }
    } catch (error) {
      toast.error("Failed to generate prediction", {
        description: "There was an error analyzing the avalanche risk.",
        icon: <CloudSnow className="h-4 w-4" />
      });
    } finally {
      setIsCustomPredicting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-snow-100 to-snow-200 relative">
      {/* Snow effect background */}
      <SnowBackground intensity="medium" />
      
      <div className="container mx-auto py-8 px-4 relative z-10">
        <header className="text-center mb-10 relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-full flex justify-center">
            <CloudSnow className="h-12 w-12 text-snow-400 animate-bounce opacity-70" />
          </div>
          <h1 className="text-5xl font-bold text-snow-800 mb-3 tracking-tight">
            Avalanche Risk Predictor
          </h1>
          <div className="flex items-center justify-center gap-2 mb-4">
            <MountainSnow className="h-6 w-6 text-snow-600" />
            <Wind className="h-5 w-5 text-snow-500" />
            <CloudSnow className="h-5 w-5 text-snow-500" />
          </div>
          <p className="text-snow-600 max-w-2xl mx-auto">
            Get accurate avalanche risk predictions based on location, weather conditions, 
            snowpack data, and terrain factors to stay safe in the mountains.
          </p>
        </header>

        <div className="max-w-4xl mx-auto space-y-8 backdrop-blur-sm bg-white/50 p-6 rounded-xl shadow-lg">
          <Tabs defaultValue="custom" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/70">
              <TabsTrigger value="custom" className="data-[state=active]:bg-blue-50">
                <div className="flex items-center gap-2">
                  <MountainSnow className="h-4 w-4" />
                  <span>Custom Prediction</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="info" className="data-[state=active]:bg-blue-50">
                <div className="flex items-center gap-2">
                  <CloudSnow className="h-4 w-4" />
                  <span>Safety Information</span>
                </div>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="custom" className="space-y-6">
              <PredictionForm 
                locations={locations} 
                onSubmit={handleCustomPrediction} 
                isLoading={isCustomPredicting || isLoadingLocations}
              />
              
              {/* Show skeleton while loading */}
              {(isCustomPredicting || isLoadingPrediction) && (
                <Card className="bg-white/80">
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
                      <Skeleton className="h-12 w-full pulse" />
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

      <footer className="bg-snow-800/80 py-6 mt-12 relative z-10 text-white backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <p className="text-snow-200">Avalanche Risk Predictor — Always verify with official forecasts.</p>
          <p className="mt-2 text-snow-300 text-sm">Data provided by avalanche.org and regional forecast centers.</p>
          <div className="flex justify-center gap-3 mt-4">
            <CloudSnow className="h-5 w-5 text-snow-400" />
            <MountainSnow className="h-5 w-5 text-snow-400" />
            <Wind className="h-5 w-5 text-snow-400" />
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
