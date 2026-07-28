"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

export const WORKFORCE_API_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
).replace(/\/$/, '');

interface WorkforceEmployee {
  id: string;
  employeeCode: string;
  name: string;
  role: 'BRANCH_MANAGER' | 'DELIVERY_PARTNER' | 'CENTRAL_STAFF' | 'BRANCH_CASHIER';
  branchId: string;
  branchName: string;
  phone: string;
  email: string | null;
  mustChangePassword: boolean;
}

interface WorkforceAuthContextType {
  employee: WorkforceEmployee | null;
  token: string | null;
  loading: boolean;
  login: (token: string, employee: WorkforceEmployee) => void;
  logout: () => void;
}

const WorkforceAuthContext = createContext<WorkforceAuthContextType | undefined>(undefined);

export const WorkforceAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employee, setEmployee] = useState<WorkforceEmployee | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // Start loading=true; only set false once we've checked localStorage + backend
  const [loading, setLoading] = useState(true);

  const login = (accessToken: string, emp: WorkforceEmployee) => {
    setToken(accessToken);
    setEmployee(emp);
    localStorage.setItem('workforce_token', accessToken);
    localStorage.setItem('workforce_employee', JSON.stringify(emp));
  };

  const logout = () => {
    setToken(null);
    setEmployee(null);
    localStorage.removeItem('workforce_token');
    localStorage.removeItem('workforce_employee');
    window.location.href = '/workforce/login';
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('workforce_token');
    const savedEmployee = localStorage.getItem('workforce_employee');

    if (!savedToken || !savedEmployee) {
      // No stored session — immediately done loading, no redirect needed
      setLoading(false);
      return;
    }

    // Optimistically hydrate from localStorage first
    try {
      const parsedEmp = JSON.parse(savedEmployee) as WorkforceEmployee;
      setToken(savedToken);
      setEmployee(parsedEmp);
    } catch (_) {
      localStorage.removeItem('workforce_token');
      localStorage.removeItem('workforce_employee');
      setLoading(false);
      return;
    }

    // Validate with backend — keep loading=true until this resolves
    fetch(`${WORKFORCE_API_URL}/workforce/me`, {
      headers: { Authorization: `Bearer ${savedToken}` },
    })
      .then(async (res) => {
        if (res.ok) {
          const json = await res.json();
          const freshEmp = json.data ?? json;
          const merged = { ...JSON.parse(savedEmployee!), ...freshEmp };
          setEmployee(merged);
          localStorage.setItem('workforce_employee', JSON.stringify(merged));
        } else {
          // Token expired or invalid — clear session
          setToken(null);
          setEmployee(null);
          localStorage.removeItem('workforce_token');
          localStorage.removeItem('workforce_employee');
        }
      })
      .catch(() => {
        // Network error: keep the optimistic employee so user isn't logged out on flaky network
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <WorkforceAuthContext.Provider value={{ employee, token, loading, login, logout }}>
      {children}
    </WorkforceAuthContext.Provider>
  );
};

export const useWorkforceAuth = () => {
  const ctx = useContext(WorkforceAuthContext);
  if (!ctx) throw new Error('useWorkforceAuth must be used within WorkforceAuthProvider');
  return ctx;
};
