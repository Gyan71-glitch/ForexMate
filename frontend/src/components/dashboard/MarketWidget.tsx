"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock live rates
const MOCK_RATES = [
  { currency: 'USD', flag: '🇺🇸', buy: 83.52, sell: 84.10, trend: 0.12 },
  { currency: 'EUR', flag: '🇪🇺', buy: 90.21, sell: 91.05, trend: -0.05 },
  { currency: 'GBP', flag: '🇬🇧', buy: 105.40, sell: 106.80, trend: 0.22 },
  { currency: 'AED', flag: '🇦🇪', buy: 22.75, sell: 23.10, trend: 0.01 },
];

export function MarketWidget() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
    // Simulate live ticking
    const interval = setInterval(() => {
      setLastUpdated(new Date().toLocaleTimeString());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="border-gray-200 shadow-sm h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-100">
        <div>
          <CardTitle className="text-lg font-extrabold text-gray-900">Live Market Rates</CardTitle>
          <p className="text-xs font-semibold text-green-600 mt-1 flex items-center gap-1 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-green-500"></span> Live (Updated: {lastUpdated})
          </p>
        </div>
        <Button variant="outline" size="sm" className="font-bold text-xs uppercase tracking-wider">
          View All <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col justify-between">
        <div className="divide-y divide-gray-100">
          {MOCK_RATES.map((rate) => (
            <div key={rate.currency} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{rate.flag}</span>
                <div>
                  <div className="font-bold text-gray-900">{rate.currency}/INR</div>
                  <div className={cn("text-xs font-bold flex items-center mt-0.5", rate.trend >= 0 ? "text-green-600" : "text-red-600")}>
                    {rate.trend >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {Math.abs(rate.trend)}%
                  </div>
                </div>
              </div>
              
              <div className="flex gap-6 text-right">
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">We Buy</div>
                  <div className="font-semibold text-gray-900">₹{rate.buy.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">We Sell</div>
                  <div className="font-semibold text-gray-900">₹{rate.sell.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
