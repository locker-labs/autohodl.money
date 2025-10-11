'use client';

import Image from 'next/image';
import type { ReactNode } from 'react';
import Button from '@/components/subcomponents/Button';

interface DetectedCardProps {
  title: string;
  description: string;
  image: string;
  children?: ReactNode;
  imageWidth?: number;
  imageHeight?: number;
  buttonTitle: string;
  handleButtonClick: () => void;
}

const DetectedCard: React.FC<DetectedCardProps> = ({
  title,
  description,
  image,
  children,
  imageWidth = 300,
  imageHeight = 200,
  buttonTitle,
  handleButtonClick,
}) => {
  return (
    <div className='flex flex-col items-center gap-8'>
      <Image className='p-4' src={image} alt='MetaMask Setup' width={imageWidth} height={imageHeight} />
      <div className='flex flex-col w-full items-center justify-center gap-4'>
        <h2 className='text-2xl font-bold'>{title}</h2>
        <p className='text-center w-2/3 text-gray-600'>{description}</p>
        {children}
      </div>

      <Button title={buttonTitle} onAction={handleButtonClick} />
    </div>
  );
};

export default DetectedCard;
