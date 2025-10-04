import type { SavingsConfig } from '@/types/autohodl';

const ConfigDisplay = ({ config }: { config: null | SavingsConfig }) => {
  if (!config) return <div>No configuration found.</div>;

  return (
    <div>
      Your savings configuration is set up!
      {/* Add more details about the configuration if needed */}
    </div>
  );
};

export default ConfigDisplay;
