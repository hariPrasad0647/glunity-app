import { useQuery } from '@tanstack/react-query';
import client from '~/api/client';

export interface ReferralStats {
  referral_code: string;
  referral_link: string;
  total_referrals: number;
  successful_referrals: number;
  pending_referrals: number;
  points_earned: number;
}

export interface ReferralHistoryItem {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FLAGGED';
  points_awarded: number;
  created_at: string;
  completed_at: string | null;
}

export interface ReferralHistoryResponse {
  referrals: ReferralHistoryItem[];
  total: number;
  page: number;
  limit: number;
}

export const useMyReferral = () => {
  return useQuery({
    queryKey: ['myReferral'],
    queryFn: async () => {
      const response = await client.get<{ success: boolean; data: ReferralStats }>('/referrals/me');
      return response.data.data;
    },
  });
};

export const useReferralHistory = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['referralHistory', page, limit],
    queryFn: async () => {
      const response = await client.get<{ success: boolean; data: ReferralHistoryResponse }>(
        `/referrals/history?page=${page}&limit=${limit}`
      );
      return response.data.data;
    },
  });
};
