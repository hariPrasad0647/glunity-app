import { useQuery } from '@tanstack/react-query';

export interface WalletBalance {
  symbol: string;
  amount: number;
  usdValue: number;
}

export function useWallet() {
  return useQuery({
    queryKey: ['wallet'],
    queryFn: async (): Promise<WalletBalance[]> => {
      // Backend not connected
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([]); // Returning empty array to trigger EmptyState
        }, 1000);
      });
    },
  });
}
