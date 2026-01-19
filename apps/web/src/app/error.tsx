'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className='w-full min-h-screen bg-background overflow-hidden relative'>
      {/* Background decoration */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-destructive/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-destructive/5 rounded-full blur-3xl' />
      </div>

      <div className='h-screen flex flex-col items-center justify-center gap-8 p-8 relative z-10'>
        {/* Error icon with animation */}
        <div className='relative'>
          <div className='w-32 h-32 rounded-full bg-destructive/10 flex items-center justify-center'>
            <div className='w-24 h-24 rounded-full bg-destructive/20 flex items-center justify-center animate-pulse'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='w-12 h-12 text-destructive'
                aria-labelledby='error-icon-title'
              >
                <title id='error-icon-title'>Error</title>
                <circle cx='12' cy='12' r='10' />
                <line x1='12' x2='12' y1='8' y2='12' />
                <line x1='12' x2='12.01' y1='16' y2='16' />
              </svg>
            </div>
          </div>
          {/* Decorative rings */}
          <div className='absolute inset-0 w-32 h-32 rounded-full border-2 border-destructive/20 animate-ping' />
        </div>

        {/* Content */}
        <div className='text-center space-y-4 max-w-md'>
          <h1 className='text-3xl md:text-4xl font-bold text-foreground'>Something Went Wrong</h1>
          <p className='text-muted-foreground text-lg'>We encountered an unexpected error.</p>
        </div>

        {/* Error details (collapsed by default) */}
        {error.digest && (
          <div className='bg-muted/50 rounded-xl px-4 py-2 text-sm text-muted-foreground font-mono'>
            Error ID: {error.digest}
          </div>
        )}

        {/* Action buttons */}
        <div className='flex flex-col sm:flex-row gap-4 mt-4'>
          <Button
            onClick={reset}
            className='bg-app-green hover:bg-app-green/90 text-app-green-dark font-semibold px-8 py-6 text-lg rounded-xl shadow-lg shadow-app-green/20 transition-all hover:shadow-xl hover:shadow-app-green/30 hover:-translate-y-0.5'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='w-5 h-5 mr-2'
              aria-labelledby='retry-icon-title'
            >
              <title id='retry-icon-title'>Retry</title>
              <path d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' />
              <path d='M21 3v5h-5' />
              <path d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' />
              <path d='M8 16H3v5' />
            </svg>
            Try Again
          </Button>
          <Button
            variant='outline'
            onClick={() => {
              window.location.href = '/';
            }}
            className='px-8 py-6 text-lg rounded-xl border-2 hover:bg-accent transition-all'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
              className='w-5 h-5 mr-2'
              aria-labelledby='home-icon-error-title'
            >
              <title id='home-icon-error-title'>Home</title>
              <path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
              <polyline points='9 22 9 12 15 12 15 22' />
            </svg>
            Go Home
          </Button>
        </div>

        {/* Help text */}
        <p className='mt-8 text-muted-foreground/70 text-sm text-center max-w-sm'>
          If this problem persists, please contact our team or try refreshing the page.
        </p>
      </div>
    </div>
  );
}
