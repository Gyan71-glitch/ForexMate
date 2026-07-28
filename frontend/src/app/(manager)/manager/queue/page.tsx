"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagerQueueRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/manager/dashboard');
  }, [router]);

  return null;
}
