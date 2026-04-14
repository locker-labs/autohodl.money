import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { formatUnits } from 'viem';

// The GraphQL query string
const GET_USER_SAVING_STATE = `
  query GetUserSavingState($id: ID!) {
    userSavingState(id: $id) {
      id
      isActive
      nextSaving
      value
      token
    }
  }
`;

interface UserSavingState {
  id: string;
  isActive: boolean;
  nextSaving: string;
  value: string;
  token: string;
}

interface GraphResponse {
  data: {
    userSavingState: UserSavingState | null;
  };
}

interface UseMissedSavingResult {
  isMissed: boolean;
  amountFormatted: string;
  dateFormatted: string;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useMissedSaving(
  userAddress: string | undefined,
  subgraphUrl: string = "https://api.studio.thegraph.com/query/119719/schedule-hodl/version/latest", 
  tokenDecimals: number = 6
): UseMissedSavingResult {
  
  const normalizedAddress = userAddress?.toLowerCase();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userSavingState', normalizedAddress],
    queryFn: async () => {
      if (!normalizedAddress) return null;
      
      const response = await fetch(subgraphUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: GET_USER_SAVING_STATE,
          variables: { id: normalizedAddress },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from subgraph');
      }

      const result = await response.json() as GraphResponse;
      return result.data?.userSavingState || null;
    },
    enabled: !!normalizedAddress, // Only run the query if we have an address
    refetchInterval: 15000, // Optional: Poll every 15s to keep state fresh
  });

  return useMemo(() => {
    if (!data) {
      return {
        isMissed: false,
        amountFormatted: "",
        dateFormatted: "",
        isLoading,
        error,
        refetch
      };
    }

    // The Graph stores timestamps in seconds. Convert to milliseconds for JS Date.
    const nextSavingTimestampMs = Number(data.nextSaving) * 1000;
    const nextSavingDate = new Date(nextSavingTimestampMs);
    const now = Date.now();

    // Determine if the saving is missed.
    const isMissed = data.isActive && now > nextSavingTimestampMs;

    // Format the date (e.g., "Apr 14, 2026")
    const dateFormatted = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(nextSavingDate);

    // Format the token amount using viem
    const rawAmount = formatUnits(BigInt(data.value), tokenDecimals);
    const amountFormatted = `$${parseFloat(rawAmount).toFixed(2)}`;

    return {
      isMissed,
      amountFormatted,
      dateFormatted,
      isLoading,
      error,
      refetch
    };
  }, [data, isLoading, error, refetch, tokenDecimals]);
}