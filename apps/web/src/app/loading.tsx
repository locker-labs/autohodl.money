import { LoaderPrimary } from '@/components/ui/loader';

const Loading = () => {
  return (
    <div className={'min-h-screen w-full flex flex-col items-center justify-center gap-4 p-8'}>
      <LoaderPrimary />
      <p>App is loading...</p>
    </div>
  );
};

export default Loading;
