import { APYCard } from '@/components/dashboard/APYCard';
import { LifetimeSavingsCard } from '@/components/dashboard/LifetimeSavingsCard';
import { TotalSavingsCard } from '@/components/dashboard/TotalSavingsCard';

export function SavingsInfoCards(): React.JSX.Element {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5'>
      <TotalSavingsCard />
      <LifetimeSavingsCard />
      <APYCard />
    </div>
  );
}
