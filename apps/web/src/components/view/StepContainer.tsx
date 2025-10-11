'use client';
import { ReactNode } from 'react';

interface StepContainerProps {
  children: ReactNode;
}

export default function StepContainer({ children }: StepContainerProps) {
  return (
    <div className='min-w-6/12 my-10 h-4/6 p-6 border border-[#1CB01C] bg-[#F9FBED] rounded-lg shadow-sm flex flex-col justify-center'>
      <div>{children}</div>
    </div>
  );
}
