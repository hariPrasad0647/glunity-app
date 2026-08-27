import { useQuery } from '@tanstack/react-query';

export interface LaunchpadProject {
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  status: 'ongoing' | 'upcoming' | 'completed';
  raisedAmount: number;
  targetAmount: number;
  endDate?: string;
  chain?: string;
}

export function useLaunchpad() {
  return useQuery({
    queryKey: ['launchpad'],
    queryFn: async (): Promise<LaunchpadProject[]> => {
      // Backend not connected
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([]); // Returning empty array to trigger EmptyState
        }, 1000);
      });
    },
  });
}
