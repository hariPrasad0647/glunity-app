import { useQuery } from '@tanstack/react-query';
import { Post } from '~/types';
import { apiClient } from '~/api/client';

export function useFeed() {
  return useQuery({
    queryKey: ['feed'],
    queryFn: async (): Promise<Post[]> => {
      // In the future:
      // const response = await apiClient.get('/feed');
      // return response.data;

      // Currently, backend is not connected. Simulate an API call that returns empty to demonstrate
      // the "no mock data" requirement with a proper empty state.
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([]); // Returning empty array to trigger EmptyState, as requested
        }, 1000);
      });
    },
  });
}
