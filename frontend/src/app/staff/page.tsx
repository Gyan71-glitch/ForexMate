"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StaffRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/staff/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white font-sans">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">Redirecting to Staff Portal...</p>
      </div>
    </div>
  );
}
