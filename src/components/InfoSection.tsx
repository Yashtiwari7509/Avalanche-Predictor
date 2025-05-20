
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskIndicator } from './RiskIndicator';

export const InfoSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-white/30">
        <CardHeader>
          <CardTitle className="text-lg">
            Understanding Avalanche Risk Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <RiskIndicator risk="low" className="mt-1" />
              <div>
                <p className="font-medium">Low Risk (1)</p>
                <p className="text-sm text-muted-foreground">
                  Generally safe conditions. Natural and human-triggered
                  avalanches unlikely except in isolated areas.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RiskIndicator risk="moderate" className="mt-1" />
              <div>
                <p className="font-medium">Moderate Risk (2)</p>
                <p className="text-sm text-muted-foreground">
                  Heightened avalanche conditions on specific terrain. Evaluate
                  snow and terrain carefully.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RiskIndicator risk="considerable" className="mt-1" />
              <div>
                <p className="font-medium">Considerable Risk (3)</p>
                <p className="text-sm text-muted-foreground">
                  Dangerous avalanche conditions. Careful snowpack evaluation
                  and conservative decision-making essential.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RiskIndicator risk="high" className="mt-1" />
              <div>
                <p className="font-medium">High Risk (4)</p>
                <p className="text-sm text-muted-foreground">
                  Very dangerous conditions. Travel in avalanche terrain
                  strongly discouraged.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <RiskIndicator risk="extreme" className="mt-1" />
              <div>
                <p className="font-medium">Extreme Risk (5)</p>
                <p className="text-sm text-muted-foreground">
                  Exceptionally dangerous conditions. Avoid all avalanche
                  terrain.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/30">
        <CardHeader>
          <CardTitle className="text-lg">Avalanche Safety Equipment</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li className="text-sm">
              <span className="font-medium">
                Avalanche Transceiver (Beacon)
              </span>
              <p className="text-muted-foreground">
                A digital device that transmits your location and can be used to
                locate buried victims.
              </p>
            </li>
            <li className="text-sm">
              <span className="font-medium">Avalanche Probe</span>
              <p className="text-muted-foreground">
                A collapsible pole used to pinpoint the exact location of a
                victim after the transceiver has narrowed down the search area.
              </p>
            </li>
            <li className="text-sm">
              <span className="font-medium">Avalanche Shovel</span>
              <p className="text-muted-foreground">
                A robust, collapsible shovel designed for digging through dense
                snow and debris.
              </p>
            </li>
            <li className="text-sm">
              <span className="font-medium">Avalanche Airbag</span>
              <p className="text-muted-foreground">
                A backpack system that deploys a large airbag to increase your
                volume, helping you stay on the surface during an avalanche.
              </p>
            </li>
            <li className="text-sm">
              <span className="font-medium">Communication Device</span>
              <p className="text-muted-foreground">
                A satellite phone or emergency beacon to call for rescue if
                needed.
              </p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};
