"use client";
import Link from 'next/link';

export default function ReloadPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Reload / Unload Forex Card</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-center py-16 px-8">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ⚡
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Feature Coming Soon</h2>
        <p className="text-gray-500 max-w-md mx-auto mb-8">
          We are currently working on integrating real-time card reloading and unloading. This feature will be available shortly.
        </p>
        <Link href="/dashboard" className="px-6 py-3 bg-blue-900 text-white font-bold rounded-lg hover:bg-blue-800 transition-colors">
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
