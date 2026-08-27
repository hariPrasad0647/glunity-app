import { useQuery } from '@tanstack/react-query';

export interface MarketData {
  price: number;
  priceChange24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export function useMarketData(symbol: string) {
  return useQuery({
    queryKey: ['marketData', symbol],
    queryFn: async (): Promise<MarketData | null> => {
      // Backend not connected
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(null); // Simulate empty/error state
        }, 1000);
      });
    },
  });
}
