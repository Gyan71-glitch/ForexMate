"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface DevFlags {
  skipOtp: boolean;
  skipOcr: boolean;
  skipAml: boolean;
  skipLrs: boolean;
  skipPayment: boolean;
}

interface DevContextType {
  devFlags: DevFlags;
  latency: number;
  mockTime: string | null;
  setFlag: (flagName: keyof DevFlags, state: boolean) => void;
  setLatency: (ms: number) => void;
  setMockTime: (dateStr: string | null) => void;
}

const DevContext = createContext<DevContextType | undefined>(undefined);

export const DevProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devFlags, setDevFlags] = useState<DevFlags>({
    skipOtp: false,
    skipOcr: false,
    skipAml: false,
    skipLrs: false,
    skipPayment: false,
  });
  const [latency, setLatencyState] = useState<number>(0);
  const [mockTime, setMockTimeState] = useState<string | null>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const storedFlags = localStorage.getItem('dev_feature_flags');
      if (storedFlags) {
        setDevFlags(JSON.parse(storedFlags));
      }

      const storedLatency = localStorage.getItem('dev_network_delay');
      if (storedLatency) {
        setLatencyState(parseInt(storedLatency, 10));
      }

      const storedMockTime = localStorage.getItem('dev_mock_time');
      if (storedMockTime) {
        setMockTimeState(storedMockTime);
      }
    } catch (e) {
      console.error('Failed to load dev flags from localStorage', e);
    }
  }, []);

  const setFlag = (flagName: keyof DevFlags, state: boolean) => {
    setDevFlags(prev => {
      const updated = { ...prev, [flagName]: state };
      localStorage.setItem('dev_feature_flags', JSON.stringify(updated));
      return updated;
    });
  };

  const setLatency = (ms: number) => {
    setLatencyState(ms);
    localStorage.setItem('dev_network_delay', ms.toString());
  };

  const setMockTime = (dateStr: string | null) => {
    setMockTimeState(dateStr);
    if (dateStr) {
      localStorage.setItem('dev_mock_time', dateStr);
      // Synchronize with backend
      fetch('/api/v1/dev/mock-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr })
      }).catch(err => console.error('Failed to sync mock time with backend:', err));
    } else {
      localStorage.removeItem('dev_mock_time');
      fetch('/api/v1/dev/mock-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: null })
      }).catch(err => console.error('Failed to sync mock time with backend:', err));
    }
  };

  return (
    <DevContext.Provider value={{ devFlags, latency, mockTime, setFlag, setLatency, setMockTime }}>
      {children}
    </DevContext.Provider>
  );
};

export const useDev = () => {
  const context = useContext(DevContext);
  if (context === undefined) {
    throw new Error('useDev must be used within a DevProvider');
  }
  return context;
};
