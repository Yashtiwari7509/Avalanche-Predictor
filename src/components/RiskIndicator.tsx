
import React from 'react';
import { cn } from '@/lib/utils';
import { RiskLevel } from '@/types/avalanche';
import { MountainSnow, AlertTriangle } from 'lucide-react';

interface RiskIndicatorProps {
  risk: RiskLevel;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

const getRiskColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'low':
      return 'bg-risk-low';
    case 'moderate':
      return 'bg-risk-moderate';
    case 'considerable':
      return 'bg-risk-considerable';
    case 'high':
      return 'bg-risk-high';
    case 'extreme':
      return 'bg-risk-extreme';
    default:
      return 'bg-gray-300';
  }
};

const getRiskTextColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'low':
      return 'text-risk-low';
    case 'moderate':
      return 'text-risk-moderate';
    case 'considerable':
      return 'text-risk-considerable';
    case 'high':
      return 'text-risk-high';
    case 'extreme':
      return 'text-risk-extreme';
    default:
      return 'text-gray-500';
  }
};

const getRiskLabel = (risk: RiskLevel): string => {
  return risk.charAt(0).toUpperCase() + risk.slice(1);
};

const getRiskIcon = (risk: RiskLevel) => {
  if (risk === 'high' || risk === 'extreme') {
    return <AlertTriangle className="h-3 w-3" />;
  }
  return <MountainSnow className="h-3 w-3" />;
};

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ 
  risk, 
  className,
  showLabel = true,
  size = 'md',
  animated = false
}) => {
  const sizeClasses = {
    'sm': 'h-4 w-4',
    'md': 'h-6 w-6',
    'lg': 'h-8 w-8'
  };

  const animationClass = animated ? 
    (risk === 'high' || risk === 'extreme' ? 'animate-pulse' : 'hover:scale-110 transition-transform') 
    : '';

  return (
    <div className={cn("flex items-center gap-2 !bg-transparent", className)}>
      <div className={cn(
        "rounded-full flex items-center justify-center", 
        sizeClasses[size], 
        getRiskColor(risk),
        animationClass
      )}>
        {(risk === 'high' || risk === 'extreme') && size === 'lg' && (
          <AlertTriangle className="h-4 w-4 text-white" />
        )}
      </div>
      {showLabel && (
        <div className="flex items-center">
          <span className={cn("font-medium", getRiskTextColor(risk))}>
            {getRiskLabel(risk)}
          </span>
          {(risk === 'high' || risk === 'extreme') && (
            <div className={cn("ml-1", getRiskTextColor(risk))}>
              {getRiskIcon(risk)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
