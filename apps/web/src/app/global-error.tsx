'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  // Global error needs its own html/body since it replaces the root layout
  return (
    <html lang='en'>
      <body
        style={{
          margin: 0,
          padding: 0,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#0a0a0a',
          color: '#fafafa',
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            width: '100%',
            minHeight: '100vh',
            overflow: 'hidden',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          {/* Background decoration */}
          <div
            style={{
              position: 'absolute',
              top: '-10rem',
              right: '-10rem',
              width: '20rem',
              height: '20rem',
              background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(3rem)',
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-10rem',
              left: '-10rem',
              width: '20rem',
              height: '20rem',
              background: 'radial-gradient(circle, rgba(239,68,68,0.1) 0%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(3rem)',
              pointerEvents: 'none',
            }}
          />

          {/* Error icon */}
          <div
            style={{
              width: '8rem',
              height: '8rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(239,68,68,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '2rem',
            }}
          >
            <div
              style={{
                width: '6rem',
                height: '6rem',
                borderRadius: '50%',
                backgroundColor: 'rgba(239,68,68,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='#ef4444'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                style={{ width: '3rem', height: '3rem' }}
                aria-labelledby='critical-error-icon-title'
              >
                <title id='critical-error-icon-title'>Critical Error</title>
                <polygon points='7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2' />
                <line x1='12' x2='12' y1='8' y2='12' />
                <line x1='12' x2='12.01' y1='16' y2='16' />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                marginBottom: '1rem',
                background: 'linear-gradient(to right, #fafafa, #a3a3a3)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Critical Error
            </h1>
            <p
              style={{
                fontSize: '1.125rem',
                color: '#a3a3a3',
                lineHeight: '1.75',
                marginBottom: '1.5rem',
              }}
            >
              A critical error has occurred and the application could not recover. We apologize for the inconvenience.
            </p>
          </div>

          {/* Error ID */}
          {error.digest && (
            <div
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: '0.75rem',
                padding: '0.5rem 1rem',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                color: '#737373',
                marginBottom: '2rem',
              }}
            >
              Error ID: {error.digest}
            </div>
          )}

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              gap: '1rem',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              type='button'
              onClick={reset}
              style={{
                backgroundColor: '#78E76E',
                color: '#1A7411',
                fontWeight: '600',
                padding: '1rem 2rem',
                fontSize: '1.125rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 10px 25px rgba(120, 231, 110, 0.2)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(120, 231, 110, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(120, 231, 110, 0.2)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 30px rgba(120, 231, 110, 0.3)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(120, 231, 110, 0.2)';
              }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                style={{ width: '1.25rem', height: '1.25rem' }}
                aria-labelledby='global-retry-icon-title'
              >
                <title id='global-retry-icon-title'>Retry</title>
                <path d='M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8' />
                <path d='M21 3v5h-5' />
                <path d='M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16' />
                <path d='M8 16H3v5' />
              </svg>
              Try Again
            </button>
            <button
              type='button'
              onClick={() => {
                window.location.href = '/';
              }}
              style={{
                backgroundColor: 'transparent',
                color: '#fafafa',
                fontWeight: '500',
                padding: '1rem 2rem',
                fontSize: '1.125rem',
                borderRadius: '0.75rem',
                border: '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                style={{ width: '1.25rem', height: '1.25rem' }}
                aria-labelledby='global-home-icon-title'
              >
                <title id='global-home-icon-title'>Home</title>
                <path d='m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' />
                <polyline points='9 22 9 12 15 12 15 22' />
              </svg>
              Go Home
            </button>
          </div>

          {/* Footer text */}
          <p
            style={{
              marginTop: '3rem',
              fontSize: '0.875rem',
              color: 'rgba(163,163,163,0.7)',
              textAlign: 'center',
            }}
          >
            Error Code: 500 — Internal Server Error
          </p>
        </div>
      </body>
    </html>
  );
}
