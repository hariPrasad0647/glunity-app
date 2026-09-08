import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { apiClient } from '~/api/client';

export interface TrustScoreComponents {
  onChain: number;
  smartFollowers: number;
  engagement: number;
  longevity: number;
  reports: number;
}

export interface TrustScoreData {
  score: number;
  tier: string;
  monetizationEligible: boolean;
  components: TrustScoreComponents;
  weights: TrustScoreComponents;
  calculatedAt: string;
}

export interface TrustScoreHistoryItem {
  finalScore: number;
  tier: string;
  calculationReason: string;
  calculatedAt: string;
}

export interface TrustScoreHistoryResponse {
  history: TrustScoreHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export const useMyTrustScore = () => {
  return useQuery({
    queryKey: ['myTrustScore'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: TrustScoreData }>('/api/trust-score/me');
      return data.data;
    },
  });
};

export const useMyTrustScoreHistory = () => {
  return useInfiniteQuery({
    queryKey: ['myTrustScoreHistory'],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<{ data: TrustScoreHistoryResponse }>(
        '/api/trust-score/history',
        { params: { page: pageParam, limit: 20 } }
      );
      return data.data;
    },
    getNextPageParam: (lastPage) => {
      const maxPages = Math.ceil(lastPage.total / lastPage.limit);
      return lastPage.page < maxPages ? lastPage.page + 1 : undefined;
    },
  });
};
