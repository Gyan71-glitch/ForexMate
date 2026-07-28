import BookingWizard from '@/components/BookingWizard';
import Link from 'next/link';
import { Suspense } from 'react';
import Navbar from '@/components/Navbar';

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <Navbar />

      <main className="max-w-6xl mx-auto py-10 px-4">
        <Suspense fallback={<div className="text-center p-10 font-bold text-gray-500">Loading your secure booking...</div>}>
          <BookingWizard />
        </Suspense>
      </main>
    </div>
  );
}
