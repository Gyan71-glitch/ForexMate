"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RedirectToCrm() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/ops/tasks');
  }, [router]);
  return (
    <div className="flex items-center justify-center min-h-[400px] gap-2 text-sm text-gray-500 font-semibold">
      <Loader2 className="w-5 h-5 animate-spin text-indigo-600" /> Redirecting to CRM Lead Workspace...
    </div>
  );
}
