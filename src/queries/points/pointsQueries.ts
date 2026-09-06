import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { apiClient } from "~/api/client";

// ==========================================
// TYPES
// ==========================================

export interface PointSummary {
  total_points: number;
  current_month_points: number;
}

export type ActivityType =
  | "PROFILE_SETUP"
  | "QUALITY_POST"
  | "RECEIVED_LIKE"
  | "COMMENT"
  | "REPOST"
  | "DAILY_ACTIVITY"
  | "CHAT_MESSAGE";

export interface PointTransaction {
  id: string;
  activityType: ActivityType;
  points: number;
  description: string;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}

export interface PointHistoryPage {
  transactions: PointTransaction[];
  total: number;
  page: number;
  limit: number;
}

export interface MonthlyPoints {
  year: number;
  month: number;
  label: string;
  points: number;
}

// ==========================================
// ACTIVITY DISPLAY CONFIG
// ==========================================

export const ACTIVITY_CONFIG: Record<
  ActivityType,
  { label: string; emoji: string; color: string }
> = {
  PROFILE_SETUP:  { label: "Profile Setup",   emoji: "??", color: "#8B5CF6" },
  QUALITY_POST:   { label: "Quality Post",    emoji: "??", color: "#3B82F6" },
  RECEIVED_LIKE:  { label: "Received Like",   emoji: "??",  color: "#EF4444" },
  COMMENT:        { label: "Comment",         emoji: "??", color: "#10B981" },
  REPOST:         { label: "Repost",          emoji: "??", color: "#06B6D4" },
  DAILY_ACTIVITY: { label: "Daily Activity",  emoji: "??", color: "#F59E0B" },
  CHAT_MESSAGE:   { label: "Chat Message",    emoji: "??",  color: "#6366F1" },
};

// ==========================================
// QUERIES
// ==========================================

export const usePointsSummaryQuery = () => {
  return useQuery({
    queryKey: ["pointsSummary"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: PointSummary }>("/api/points/summary");
      return data.data;
    },
    staleTime: 30_000,
  });
};

export const usePointsHistoryQuery = () => {
  return useInfiniteQuery({
    queryKey: ["pointsHistory"],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const { data } = await apiClient.get<{ data: PointHistoryPage }>(
        "/api/points/history",
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

export const useMonthlyPointsQuery = () => {
  return useQuery({
    queryKey: ["monthlyPoints"],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: { monthly: MonthlyPoints[] } }>(
        "/api/points/monthly"
      );
      return data.data.monthly;
    },
    staleTime: 60_000,
  });
};
