import React from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { LogIn } from 'lucide-react';

export function LoginPromptStep() {
  const router = useRouter();

  return (
    <>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl font-bold">Almost there!</CardTitle>
        <CardDescription>You need an account to lock in your live rate.</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-10 pb-12 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
          <LogIn size={40} />
        </div>
        
        <h3 className="text-lg font-semibold mb-2">Save your progress</h3>
        <p className="text-gray-500 max-w-sm mb-8">
          Please log in or create an account to secure this quote and proceed with your order.
        </p>
        
        <div className="flex gap-4">
          <Button 
            onClick={() => router.push('/login?redirect=/buy-forex')} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg"
          >
            Log In
          </Button>
          <Button 
            onClick={() => router.push('/register?redirect=/buy-forex')} 
            variant="outline" 
            className="px-8 py-2 rounded-lg"
          >
            Register
          </Button>
        </div>
      </CardContent>
    </>
  );
}
