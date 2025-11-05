import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { AUTOHODL_ADDRESS, AUTOHODL_SUPPORTED_TOKENS, TOKEN_DECIMALS } from '@/lib/constants';
import { fetchErc20Transfers } from '@/lib/data/fetchErc20Transfers';

export interface ISavingsTx {
  id: string;
  timestamp: string;
  to: string;
  from: string;
  value: bigint;
  txHash: string;
  purchaseValue: bigint;
}

let currentPageKey: string | undefined;

export function useSavingsTxs() {
  const [allTxs, setAllTxs] = useState<ISavingsTx[]>([]);
  const [pageKey, setPageKey] = useState<string>('0x0');
  const [txs, setTxs] = useState<ISavingsTx[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { address } = useAccount();

  function fetchNext() {
    setPageKey(currentPageKey || '0x0');
  }

  // Populate allTxs when txs change
  useEffect(() => {
    setAllTxs((prevTxs) => {
      const txSet = new Set(prevTxs.map((tx) => tx.id));
      const newTxs = txs.filter((tx) => !txSet.has(tx.id));
      return prevTxs.concat(newTxs);
    });
  }, [txs]);

  useEffect(() => {
    async function fetchTxs() {
      if (!address) {
        setTxs([]);
        setLoading(true);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetchErc20Transfers({
          fromAddress: address,
          toAddress: AUTOHODL_ADDRESS,
          contractAddresses: AUTOHODL_SUPPORTED_TOKENS,
          maxCount: 6,
          pageKey,
        });

        currentPageKey = response.pageKey;

        if (error) {
          console.error('Error fetching transactions:', error);
          setError(error);
          return;
        }

        setTxs(
          response.transfers.map((tx) => ({
            id: tx.uniqueId,
            timestamp: tx.metadata.blockTimestamp,
            to: tx.to,
            from: tx.from,
            value: BigInt(tx.value * 10 ** TOKEN_DECIMALS),
            txHash: tx.hash,
            purchaseValue: computeRoundUpAndSavings(
              BigInt(tx.value * 10 ** TOKEN_DECIMALS),
              BigInt(10 ** TOKEN_DECIMALS),
            ).savingsAmount,
          })),
        );
      } catch (error: unknown) {
        console.error('Error fetching transactions:', error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    }
    fetchTxs();
  }, [address, pageKey]);

  return {
    allTxs,
    error,
    fetchNext,
    hasNext: !!currentPageKey,
    loading,
    txs,
  };
}

export function computeRoundUpAndSavings(
  transferAmount: bigint,
  roundUpTo: bigint,
): { roundUpAmount: bigint; savingsAmount: bigint } {
  if (roundUpTo <= BigInt(0)) {
    throw new Error('roundUpTo must be > 0');
  }
  // Equivalent to: ((transferAmount + roundUpTo - 1) / roundUpTo) * roundUpTo
  const roundUpAmount = ((transferAmount + roundUpTo - BigInt(1)) / roundUpTo) * roundUpTo;

  const savingsAmount = roundUpAmount - transferAmount;

  return { roundUpAmount, savingsAmount };
}
