const ErrorDisplay = ({ error }: { error: Error | string | null }) => {
  const errorObj = typeof error === 'string' ? new Error(error) : error;

  return (
    <div>
      {errorObj && (
        <div className='p-4 bg-red-50 text-red-700 rounded-md break-all'>
          <p className='font-medium'>Error: {errorObj.message}</p>
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
