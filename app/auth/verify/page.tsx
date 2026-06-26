'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Extract the token from the URL (e.g., ?token=e16e86ee-...)
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    // If there is no token in the URL, show an error immediately
    if (!token) {
      setStatus('error');
      setMessage('Invalid link: No verification token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {

        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        
        const response = await fetch(`${apiUrl}/api/auth/verify?token=${token}`, {
          method: 'GET', // Change to 'POST' if your backend expects a POST request
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Success case
          setStatus('success');
          setMessage('Email verified successfully! Redirecting to login...');
          
          // Wait 3 seconds, then redirect to the login page
          setTimeout(() => {
            router.push('/');
          }, 3000);
          
        } else {
          // Backend returned an error (e.g., token expired or invalid)
          const data = await response.json().catch(() => null);
          setStatus('error');
          setMessage(data?.message || 'Verification failed. The link might be invalid or expired.');
        }
      } catch (error) {
        // Network or fetch error
        setStatus('error');
        setMessage('An error occurred during verification. Please check your connection and try again.');
      }
    };

    // Ensure the function only runs once when the component mounts and the token is ready
    verifyEmail();
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, router]); 

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-xl text-center border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Email Verification</h1>
        
        {/* Loading State */}
        {status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">{message}</p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <p className="text-green-600 font-medium">{message}</p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="flex flex-col items-center">
            <svg className="w-12 h-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            <p className="text-red-600 font-medium mb-6">{message}</p>
            <button
              onClick={() => router.push('/login')}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Next.js requires components using useSearchParams to be wrapped in a Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><p>Loading...</p></div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}