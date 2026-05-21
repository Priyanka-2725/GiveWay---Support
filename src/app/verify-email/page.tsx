
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function VerifyEmailPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to discover since email verification is no longer needed
    router.push('/discover');
  }, [router]);

  return (
    <div className="container mx-auto flex items-center justify-center py-20 px-4">
      <div className="text-center">
        <p>Redirecting...</p>
      </div>
    </div>
  );
}
