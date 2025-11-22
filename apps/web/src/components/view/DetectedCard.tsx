'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';

interface DetectedCardProps {
  title: string;
  description: string;
  image: string;
  children?: ReactNode;
}

const DetectedCard: React.FC<DetectedCardProps> = ({ title, description, image, children }) => {
  return (
    <div className='flex flex-col items-center gap-6'>
      <div className={`max-h-[300px]`}>
        <Image className='p-4 h-[300px] w-auto aspect-auto' width={300} height={300} src={image} alt={title} priority />
      </div>
      <div className='flex flex-col w-full items-center justify-center gap-4'>
        <h2 className='mt-2 text-center text-2xl font-bold'>{title}</h2>
        <p className='text-center md:w-[450px] text-gray-600'>{description}</p>
        {children}
      </div>
    </div>
  );
};

export default DetectedCard;
