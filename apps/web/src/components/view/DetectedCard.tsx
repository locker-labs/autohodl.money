"use client";
import Image from "next/image";
import { ReactNode } from "react";

interface DetectedCardProps {
  title: string;
  description: string;
    image: string;
    children?: ReactNode;
    imageWidth?: number;
    imageHeight?: number;
}

const DetectedCard: React.FC<DetectedCardProps> = ({
  title,
  description,
    image,
    children,
    imageWidth = 300,
    imageHeight = 200,
}) => {
  return (
    <>
      <Image
        className="p-4"
        src={image}
        alt="MetaMask Setup"
        width={imageWidth}
        height={imageHeight}
      />
      <div className="flex flex-col w-full items-center justify-center gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-center w-2/3 text-gray-600">{description}</p>
        {children}
      </div>
    </>
  );
};

export default DetectedCard;
