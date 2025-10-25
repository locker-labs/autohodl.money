import type React from 'react';
import { SavingsInfoCards } from '@/components/feature/SavingsInfoCards';
import { Controls } from '@/components/subcomponents/Controls';
import { RecentActivity } from '@/components/subcomponents/RecentActivity';

const Dashboard = (): React.JSX.Element => {
  return (
    <div className='max-w-[1080px] w-full px-2 sm:px-5 py-5 grid grid-cols-12 gap-5'>
      {/* Left side */}
      <div className='col-span-12 grid sm:grid-cols-3 gap-5'>
        {/* 1 - 2 - 3 */}
        <SavingsInfoCards />
      </div>

      {/* Right */}
      <div className='col-span-12 w-full flex flex-col md:flex-row gap-5'>
        {/* 4 - Recent Transactions Card */}
        <RecentActivity />

        {/* 5 - Controls Card */}
        <Controls />
      </div>
    </div>
  );
};

export default Dashboard;
