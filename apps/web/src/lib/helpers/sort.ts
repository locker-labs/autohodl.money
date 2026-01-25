import type { ITx } from '@/types/tx';

type SortItem = ITx;

export const sortByTimestampDesc = (a: SortItem, b: SortItem): number => {
  const timestampA = a.timestamp ? Number(a.timestamp) : 0;
  const timestampB = b.timestamp ? Number(b.timestamp) : 0;
  return timestampB - timestampA;
};
