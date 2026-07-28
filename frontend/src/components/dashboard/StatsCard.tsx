import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export function StatsCard({ title, value, description, icon: Icon, trend, className }: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden border-gray-200 shadow-sm transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest">
          {title}
        </CardTitle>
        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-black text-gray-900 tracking-tight">{value}</div>
        
        {trend && (
          <div className="flex items-center mt-3 text-sm">
            <span 
              className={cn(
                "font-bold flex items-center", 
                trend.value >= 0 ? "text-emerald-600" : "text-red-600"
              )}
            >
              {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
            <span className="text-gray-500 ml-2 font-medium">{trend.label}</span>
          </div>
        )}
        
        {description && !trend && (
          <p className="text-sm text-gray-500 mt-2 font-medium">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
