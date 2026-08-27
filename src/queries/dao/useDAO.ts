import { useQuery } from '@tanstack/react-query';

export interface Proposal {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'passed' | 'rejected' | 'expired';
  yesVotes: number;
  noVotes: number;
  totalVotes: number;
  endDate?: string;
}

export function useProposals() {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: async (): Promise<Proposal[]> => {
      // Backend not connected
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([]); // Returning empty array to trigger EmptyState
        }, 1000);
      });
    },
  });
}
