
import React from 'react';
import { cn } from '@/lib/utils';
import { RiskLevel } from '@/types/avalanche';

interface RiskIndicatorProps {
  risk: RiskLevel;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
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

const getRiskLabel = (risk: RiskLevel): string => {
  return risk.charAt(0).toUpperCase() + risk.slice(1);
};

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ 
  risk, 
  className,
  showLabel = true,
  size = 'md'
}) => {
  const sizeClasses = {
    'sm': 'h-4 w-4',
    'md': 'h-6 w-6',
    'lg': 'h-8 w-8'
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className={cn("rounded-full", sizeClasses[size], getRiskColor(risk))} />
      {showLabel && (
        <span className="font-medium">{getRiskLabel(risk)}</span>
      )}
    </div>
  );
};
