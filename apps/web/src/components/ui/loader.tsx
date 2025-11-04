import { Loader2 } from 'lucide-react';

export const LoaderPrimary = (): React.JSX.Element => {
  return <Loader2 className='animate-spin size-8' color='#78E76E' />;
};

export const LoaderSecondary = (): React.JSX.Element => {
  return <Loader2 className={`animate-spin size-5`} color='#78E76E' />;
  //  text-gray-500
};
