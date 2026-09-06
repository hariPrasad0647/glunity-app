import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { 
  ChevronLeft, 
  Gift, 
  User, 
  FileText, 
  Heart, 
  MessageCircle, 
  Repeat, 
  Calendar, 
  MessageSquare, 
  Sparkles 
} from "lucide-react-native";
import { useTheme } from "~/hooks/useTheme";
import { typography } from "~/theme/typography";
import { spacing } from "~/theme/spacing";
import { RootStackParamList } from "~/navigation/RootNavigator";
import {
  usePointsSummaryQuery,
  usePointsHistoryQuery,
  useMonthlyPointsQuery,
  ACTIVITY_CONFIG,
  PointTransaction,
} from "~/queries/points/pointsQueries";
import { AnimatedNumber } from "~/components/AnimatedNumber";

type Props = NativeStackScreenProps<RootStackParamList, "AirdropPoints">;

export function AirdropPointsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"history" | "monthly">("history");

  const getActivityIcon = (type: string, color: string, size = 24) => {
    switch (type) {
      case "PROFILE_SETUP": return <User size={size} color={color} />;
      case "QUALITY_POST": return <FileText size={size} color={color} />;
      case "RECEIVED_LIKE": return <Heart size={size} color={color} />;
      case "COMMENT": return <MessageCircle size={size} color={color} />;
      case "REPOST": return <Repeat size={size} color={color} />;
      case "DAILY_ACTIVITY": return <Calendar size={size} color={color} />;
      case "CHAT_MESSAGE": return <MessageSquare size={size} color={color} />;
      default: return <Sparkles size={size} color={color} />;
    }
  };

  const {
    data: summary,
    isLoading: isLoadingSummary,
    refetch: refetchSummary,
  } = usePointsSummaryQuery();

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch: refetchHistory,
    isRefetching: isRefetchingHistory,
  } = usePointsHistoryQuery();

  const {
    data: monthlyData,
    isLoading: isLoadingMonthly,
    refetch: refetchMonthly,
    isRefetching: isRefetchingMonthly,
  } = useMonthlyPointsQuery();

  const isLoading = isLoadingSummary || isLoadingHistory || isLoadingMonthly;
  const isRefreshing = isRefetchingHistory || isRefetchingMonthly;

  const handleRefresh = async () => {
    await Promise.all([
      refetchSummary(),
      refetchHistory(),
      refetchMonthly(),
    ]);
  };

  const renderHistoryItem = ({ item }: { item: PointTransaction }) => {
    const config = ACTIVITY_CONFIG[item.activityType] || {
      label: item.description || "Points Awarded",
      emoji: "?",
      color: theme.primary,
    };

    const date = new Date(item.createdAt);
    const dateStr = date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={[styles.transactionItem, { borderBottomColor: theme.border }]}>
        <View style={[styles.iconCircle, { backgroundColor: `${config.color}20` }]}>
          {getActivityIcon(item.activityType, config.color)}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionTitle, { color: theme.textPrimary }]}>
            {config.label}
          </Text>
          <Text style={[styles.transactionDate, { color: theme.textSecondary }]}>
            {dateStr}
          </Text>
        </View>
        <Text style={[styles.pointsValue, { color: theme.success }]}>
          +{item.points}
        </Text>
      </View>
    );
  };

  const renderMonthlyItem = ({ item }: { item: any }) => {
    return (
      <View style={[styles.transactionItem, { borderBottomColor: theme.border }]}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.primary}20` }]}>
          <Calendar size={24} color={theme.primary} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionTitle, { color: theme.textPrimary }]}>
            {item.label}
          </Text>
        </View>
        <Text style={[styles.pointsValue, { color: theme.primary }]}>
          {item.points.toLocaleString()} pts
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={[styles.summaryCard, { backgroundColor: theme.surfaceSecondary }]}>
        <Gift size={40} color={theme.primary} style={styles.summaryIcon} />
        <Text style={[styles.totalPointsLabel, { color: theme.textSecondary }]}>
          Total Airdrop Points
        </Text>
        <AnimatedNumber 
          value={summary?.total_points || 0} 
          style={[styles.totalPoints, { color: theme.textPrimary }]} 
        />
        <View style={styles.monthlySummary}>
          <Text style={[styles.monthlyLabel, { color: theme.textSecondary }]}>
            This Month:
          </Text>
          <AnimatedNumber 
            value={summary?.current_month_points || 0} 
            style={[styles.monthlyValue, { color: theme.success }]} 
            formatter={(val) => `+${val.toLocaleString()}`}
          />
        </View>
      </View>

      <View style={[styles.tabContainer, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabText, { color: activeTab === "history" ? theme.primary : theme.textSecondary }]}>
            Recent History
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "monthly" && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab("monthly")}
        >
          <Text style={[styles.tabText, { color: activeTab === "monthly" ? theme.primary : theme.textSecondary }]}>
            Monthly Overview
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const transactions = historyData?.pages.flatMap((p) => p.transactions) || [];
  const monthly = monthlyData || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
      <View style={[styles.navBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.textPrimary }]}>
          Airdrop Points
        </Text>
        <View style={styles.iconBtn} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={activeTab === "history" ? transactions : monthly}
          keyExtractor={(item, index) =>
            activeTab === "history" ? (item as PointTransaction).id : `${(item as any).year}-${(item as any).month}-${index}`
          }
          renderItem={activeTab === "history" ? renderHistoryItem : renderMonthlyItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.primary}
            />
          }
          onEndReached={() => {
            if (activeTab === "history" && hasNextPage && !isFetchingNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <ActivityIndicator style={{ margin: spacing.md }} color={theme.primary} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                {activeTab === "history"
                  ? "No points earned yet. Start posting, liking, and chatting to earn points!"
                  : "No monthly data available yet."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    height: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  iconBtn: { padding: 8, width: 40 },
  navTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  headerContent: {
    padding: spacing.md,
  },
  summaryCard: {
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  summaryIcon: {
    marginBottom: spacing.sm,
  },
  totalPointsLabel: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xs,
  },
  totalPoints: {
    fontSize: 48,
    fontWeight: "bold",
    marginBottom: spacing.md,
  },
  monthlySummary: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  monthlyLabel: {
    fontSize: typography.sizes.sm,
    marginRight: spacing.xs,
  },
  monthlyValue: {
    fontSize: typography.sizes.md,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  tabText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  emoji: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: typography.sizes.sm,
  },
  pointsValue: {
    fontSize: typography.sizes.lg,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: "center",
    marginTop: spacing.xl,
  },
  emptyText: {
    textAlign: "center",
    fontSize: typography.sizes.md,
    lineHeight: 24,
  },
});
