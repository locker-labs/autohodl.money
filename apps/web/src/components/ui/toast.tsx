'use client';

import { X } from 'lucide-react';
import { toast } from 'sonner';

export function toastCustom(message: string, description?: string) {
  return toast.custom((t) => (
    <div className='w-full flex justify-center'>
      <div className='w-fit bg-white outline outline-gray-300 rounded-md px-[8px] py-[6px] font-sans grid grid-cols-[auto_1fr] gap-2 items-start'>
        <div>
          <h1 className='leading-none'>{message}</h1>
          {description && <h3 className='mt-1 text-sm text-gray-600'>{description}</h3>}
        </div>

        <X
          className='cursor-pointer text-gray-500 hover:text-black hover:font-bold transition-all'
          size={14}
          onClick={() => toast.dismiss(t)}
        />
      </div>
    </div>
  ));
}
