import SetScheduledSavingConfig from "../subcomponents/SetScheduleSaving";

const ScheduleOnboarding = () => {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center px-3 lg:px-4 py-3 lg:py-5">
      <div className="lg:min-w-[698px] min-h-[500px] my-4 pt-2 lg:p-6 flex flex-col justify-center">
        <div className="flex flex-col items-center gap-8">
          <SetScheduledSavingConfig />
        </div>
      </div>
    </div>
  );
};

export default ScheduleOnboarding;
