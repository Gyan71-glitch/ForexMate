"use client";

import React from 'react';
import { WorkforceAuthProvider } from '@/context/WorkforceAuthContext';
import { AuthProvider } from '@/context/AuthContext';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WorkforceAuthProvider>
        {children}
      </WorkforceAuthProvider>
    </AuthProvider>
  );
}
