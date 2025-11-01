import type React from 'react';
import { SavingsInfoCards } from '@/components/feature/SavingsInfoCards';
import { Controls } from '@/components/subcomponents/Controls';
import { RecentActivity } from '@/components/subcomponents/RecentActivity';
import useIsMobile from '@/hooks/useIsMobile';
import Loading from '@/app/loading';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Dashboard = (): React.JSX.Element => {
  const { isMobile, isLoading } = useIsMobile();

  if (isLoading) return <Loading />;

  if (isMobile) {
    return (
      <Tabs className='w-full' defaultValue='dashboard'>
        <TabsList className='w-full h-10 sticky top-[65px]'>
          <TabsTrigger value='dashboard'>Dashboard</TabsTrigger>
          <TabsTrigger value='settings'>Settings</TabsTrigger>
        </TabsList>
        <TabsContent value='dashboard' className='px-4 pt-3 pb-5'>
          <div className='w-full grid gap-5'>
            {/* Left side */}
            <div className=''>
              {/* 1 - 2 - 3 */}
              <SavingsInfoCards />
            </div>

            {/* Right */}
            <div className='w-full gap-5 grid lg:grid-cols-12'>
              {/* 4 - Recent Transactions Card */}
              <div className='w-full lg:col-span-6'>
                <RecentActivity />
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent value='settings' className='px-4 pt-3 pb-5'>
          <div className='w-full grid gap-5'>
            {/* Right */}
            <div className='w-full gap-5 grid lg:grid-cols-12'>
              {/* 5 - Controls Card */}
              <div className='w-full lg:col-span-6'>
                <Controls />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  // Desktop View
  return (
    <div className=' max-w-[1080px] w-full px-4 py-5 lg:px-0 grid gap-5'>
      {/* Left side */}
      <div className=''>
        {/* 1 - 2 - 3 */}
        <SavingsInfoCards />
      </div>

      {/* Right */}
      <div className='w-full gap-5 grid lg:grid-cols-12'>
        {/* 4 - Recent Transactions Card */}
        <div className='w-full lg:col-span-6'>
          <RecentActivity />
        </div>

        {/* 5 - Controls Card */}
        <div className='w-full lg:col-span-6'>
          <Controls />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
