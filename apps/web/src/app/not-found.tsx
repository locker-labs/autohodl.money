'use client';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className='w-full min-h-screen bg-background overflow-hidden relative'>
      {/* Background decoration */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-40 -right-40 w-80 h-80 bg-app-green/10 rounded-full blur-3xl' />
        <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-app-green/5 rounded-full blur-3xl' />
      </div>

      <div className='h-screen flex flex-col items-center justify-center gap-8 p-8 relative z-10'>
        {/* Large 404 text with gradient */}
        <div className='relative'>
          <h1 className='text-[12rem] md:text-[16rem] font-bold leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-foreground/20 to-foreground/5 select-none'>
            404
          </h1>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='w-24 h-24 rounded-full bg-app-green/20 flex items-center justify-center animate-pulse'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                className='w-12 h-12 text-app-green-dark'
                aria-labelledby='search-icon-title'
              >
                <title id='search-icon-title'>Search</title>
                <circle cx='11' cy='11' r='8' />
                <path d='m21 21-4.3-4.3' />
                <path d='M11 8v6' />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='text-center space-y-4 max-w-md'>
          <h2 className='text-2xl md:text-3xl font-semibold text-foreground'>Page Not Found</h2>
          <p className='text-muted-foreground text-lg'>
            Oops! The page you&apos;re looking for seems to have wandered off. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Action buttons */}
        <div className='flex flex-col sm:flex-row gap-4 mt-4'>
          <Button
            onClick={() => {
              window.location.href = '/';
            }}
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
              aria-labelledby='home-icon-title'
            >
              <title id='home-icon-title'>Home</title>
              <path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
              <polyline points='9 22 9 12 15 12 15 22' />
            </svg>
            Go Home
          </Button>
          <Button
            variant='outline'
            onClick={() => window.history.back()}
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
              aria-labelledby='back-icon-title'
            >
              <title id='back-icon-title'>Go back</title>
              <path d='m12 19-7-7 7-7' />
              <path d='M19 12H5' />
            </svg>
            Go Back
          </Button>
        </div>

        {/* Decorative element */}
        <div className='mt-8 text-muted-foreground/50 text-sm'>Error Code: 404 — Not Found</div>
      </div>
    </div>
  );
}
