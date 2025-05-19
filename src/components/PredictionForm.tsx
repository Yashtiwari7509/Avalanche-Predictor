
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Location, AvalancheFormData } from '@/types/avalanche';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

const formSchema = z.object({
  locationId: z.string({ required_error: "Please select a location" }),
  elevation: z.coerce.number().min(500, "Elevation must be at least 500m").max(5000, "Elevation must be less than 5000m"),
  slope: z.coerce.number().min(0, "Slope must be at least 0°").max(90, "Slope must be less than 90°"),
  aspect: z.string().min(1, "Please select an aspect"),
  treeLineLevel: z.string().min(1, "Please select tree line position"),
  newSnow24h: z.coerce.number().min(0, "Cannot be negative"),
  newSnow48h: z.coerce.number().min(0, "Cannot be negative"),
  temperature: z.coerce.number().min(-50, "Temperature must be above -50°C").max(20, "Temperature must be below 20°C"),
  windSpeed: z.coerce.number().min(0, "Wind speed cannot be negative"),
  visibility: z.string()
});

interface PredictionFormProps {
  locations: Location[];
  onSubmit: (data: AvalancheFormData) => void;
  isLoading: boolean;
}

export const PredictionForm: React.FC<PredictionFormProps> = ({ 
  locations, 
  onSubmit,
  isLoading
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationId: "",
      elevation: 2000,
      slope: 30,
      aspect: "N",
      treeLineLevel: "near",
      newSnow24h: 0,
      newSnow48h: 0,
      temperature: -5,
      windSpeed: 20,
      visibility: "good"
    }
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    if (isLoading) return;
    onSubmit(data as AvalancheFormData);
    toast.success("Prediction requested", {
      description: "Analyzing avalanche risk based on your inputs..."
    });
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="locationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a location" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {locations.map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}, {location.region}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="elevation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Elevation (m)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slope"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slope (°)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aspect"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aspect</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an aspect" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["N", "NE", "E", "SE", "S", "SW", "W", "NW"].map((aspect) => (
                          <SelectItem key={aspect} value={aspect}>
                            {aspect}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="treeLineLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tree Line</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["below", "near", "above"].map((level) => (
                          <SelectItem key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)} tree line
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newSnow24h"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Snow - 24h (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="newSnow48h"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Snow - 48h (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="windSpeed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wind Speed (km/h)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {["poor", "moderate", "good", "excellent"].map((visibility) => (
                          <SelectItem key={visibility} value={visibility}>
                            {visibility.charAt(0).toUpperCase() + visibility.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <CardFooter className="px-0 pt-2">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Analyzing..." : "Get Avalanche Prediction"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
