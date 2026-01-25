'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { LoaderSecondary } from '@/components/ui/loader';
import { ViemChainNameMap, type EChainId } from '@/lib/constants';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export type ChainSwitchFlow = 'has-config' | 'no-config';

export type ChainSwitchState = {
  step:
    | 'idle'
    | 'checking'
    | 'confirming'
    | 'deactivating'
    | 'switching'
    | 'approving'
    | 'activating'
    | 'complete'
    | 'error';
  error: string | null;
  targetChainId: EChainId | null;
  flow: ChainSwitchFlow | null;
  needsAllowanceApproval?: boolean;
};

interface ChainSwitchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetChainId: EChainId | null;
  flow: ChainSwitchFlow | null;
  state: ChainSwitchState;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ChainSwitchModal({
  open,
  onOpenChange,
  targetChainId,
  flow,
  state,
  onConfirm,
  onCancel,
}: ChainSwitchModalProps) {
  const targetChainName = targetChainId ? ViemChainNameMap[targetChainId] : null;
  const isExecuting = ['deactivating', 'switching', 'approving', 'activating'].includes(state.step);
  const isComplete = state.step === 'complete';
  const isError = state.step === 'error';
  const needsAllowanceApproval = state.needsAllowanceApproval ?? false;

  const getStepStatus = (step: 'deactivating' | 'switching' | 'approving' | 'activating') => {
    if (state.step === step) return 'current';
    const stepOrder = ['deactivating', 'switching', 'approving', 'activating'];
    const currentIndex = stepOrder.indexOf(state.step);
    const stepIndex = stepOrder.indexOf(step);
    if (currentIndex > stepIndex) return 'complete';
    return 'pending';
  };

  const handleCancel = () => {
    if (!isExecuting) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]' showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Switch Savings Chain</DialogTitle>
          <DialogDescription>
            {targetChainName ? `Switch to ${targetChainName}` : 'Switch your savings chain'}
          </DialogDescription>
        </DialogHeader>

        <div>
          {isComplete ? (
            <div className='flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg'>
              <CheckCircle2 className='w-5 h-5 text-green-600 flex-shrink-0' />
              <p className='text-sm text-green-800'>Successfully switched to {targetChainName}!</p>
            </div>
          ) : (
            <>
              {/* Info Message */}
              <div className='mb-4 p-4 bg-app-green/10 border border-app-green/30 rounded-lg'>
                <p className='text-sm text-app-green-dark font-medium mb-2'>
                  You will be prompted to complete these steps:
                </p>
                <ol className='text-sm text-app-green-dark/80 space-y-1 ml-4 list-decimal'>
                  <li>Mark current savings chain&apos;s config as inactive</li>
                  <li>Switch to {targetChainName}</li>
                  <li>Approve USDC spending allowance (if needed)</li>
                  <li>
                    {flow === 'has-config'
                      ? `Mark the ${targetChainName} config as active`
                      : `Create a new savings config on ${targetChainName} with same settings`}
                  </li>
                </ol>
              </div>

              {/* Warning */}
              <div className='p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
                <div className='flex items-start gap-3'>
                  <AlertCircle className='w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5' />
                  <p className='text-sm text-yellow-800'>
                    Make sure you have some balance on {targetChainName} for signing transactions.
                  </p>
                </div>
              </div>

              {/* Progress Steps */}
              {isExecuting && (
                <div className='mt-4 space-y-3'>
                  <div className='flex items-center gap-3'>
                    {getStepStatus('deactivating') === 'complete' ? (
                      <CheckCircle2 className='w-5 h-5 text-green-600' />
                    ) : getStepStatus('deactivating') === 'current' ? (
                      <LoaderSecondary />
                    ) : (
                      <div className='w-5 h-5 rounded-full border-2 border-gray-300' />
                    )}
                    <p className='text-sm'>Deactivating current config</p>
                  </div>
                  <div className='flex items-center gap-3'>
                    {getStepStatus('switching') === 'complete' ? (
                      <CheckCircle2 className='w-5 h-5 text-green-600' />
                    ) : getStepStatus('switching') === 'current' ? (
                      <LoaderSecondary />
                    ) : (
                      <div className='w-5 h-5 rounded-full border-2 border-gray-300' />
                    )}
                    <p className='text-sm'>Switching to {targetChainName}</p>
                  </div>
                  {needsAllowanceApproval && (
                    <div className='flex items-center gap-3'>
                      {getStepStatus('approving') === 'complete' ? (
                        <CheckCircle2 className='w-5 h-5 text-green-600' />
                      ) : getStepStatus('approving') === 'current' ? (
                        <LoaderSecondary />
                      ) : (
                        <div className='w-5 h-5 rounded-full border-2 border-gray-300' />
                      )}
                      <p className='text-sm'>Approving USDC allowance</p>
                    </div>
                  )}
                  <div className='flex items-center gap-3'>
                    {getStepStatus('activating') === 'complete' ? (
                      <CheckCircle2 className='w-5 h-5 text-green-600' />
                    ) : getStepStatus('activating') === 'current' ? (
                      <LoaderSecondary />
                    ) : (
                      <div className='w-5 h-5 rounded-full border-2 border-gray-300' />
                    )}
                    <p className='text-sm'>{flow === 'has-config' ? 'Activating config' : 'Creating new config'}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          {isComplete ? (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          ) : isError ? (
            <>
              <Button variant='outline' onClick={handleCancel}>
                Close
              </Button>
              <Button onClick={onConfirm}>Try again</Button>
            </>
          ) : (
            <>
              <Button variant='outline' onClick={handleCancel} disabled={isExecuting}>
                Cancel
              </Button>
              <Button onClick={onConfirm} disabled={isExecuting} autoFocus>
                {isExecuting ? 'Processing...' : 'Continue'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
