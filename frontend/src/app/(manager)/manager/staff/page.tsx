"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagerStaffRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/manager/dashboard');
  }, [router]);

  return null;
}
