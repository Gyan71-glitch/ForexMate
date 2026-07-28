"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import API_URL, { authFetch } from '@/lib/api';

export default function DealerDashboard() {
  const [positions, setPositions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPositions = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_URL}/treasury/positions`);
      const result = await res.json();
      
      if (res.ok) {
        setPositions(result.success ? result.data : result);
      } else {
        console.error('Failed to fetch positions:', res.statusText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Dealer Trading Desk</h1>
          <p className="text-slate-500">Live Net Open Positions (NOP) & Interbank Trades</p>
        </div>
        <Button onClick={fetchPositions} disabled={loading} className="bg-slate-900 text-white">
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {positions.map(pos => (
          <Card key={pos.id} className="border-l-4 border-l-orange-500 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between">
                <span>{pos.currency.code}</span>
                <span className={`text-sm ${pos.netOpenPosition >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {pos.netOpenPosition >= 0 ? 'LONG' : 'SHORT'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-mono font-bold mb-4">
                {Number(pos.netOpenPosition).toLocaleString()}
              </div>
              <div className="text-sm text-slate-500 flex justify-between">
                <span>Bought: {Number(pos.totalBought).toLocaleString()}</span>
                <span>Sold: {Number(pos.totalSold).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {positions.length === 0 && !loading && (
          <div className="col-span-4 text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed">
            <Building2 className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-700">No Positions Found</h3>
            <p className="text-slate-500">Execute interbank trades to open positions.</p>
          </div>
        )}
      </div>
    </div>
  );
}
