'use client';

import type { ReactNode } from 'react';

interface StepContainerProps {
  children: ReactNode;
}

export default function StepContainer({ children }: StepContainerProps) {
  return (
    <div className='lg:min-w-[698px] my-4 min-h-[500px] p-4 lg:p-6 border border-[#1CB01C] bg-[#F9FBED] rounded-lg shadow-sm flex flex-col justify-center'>
      <div>{children}</div>
    </div>
  );
}
