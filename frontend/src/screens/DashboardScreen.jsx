// screens/DashboardScreen.jsx
// Home screen — gives the business owner an at-a-glance summary of
// today's activity: key stats, quick actions, and a live activity feed.

import React from "react";
import {
  ScrollView, View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from "react-native";
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from "../utils/theme";
import { MOCK_STATS, MOCK_ACTIVITY } from "../mock/stats";
import StatCard from "../components/dashboard/StatCard";
import ActivityItem from "../components/dashboard/ActivityItem";

export default function DashboardScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ─────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning 👋</Text>
            <Text style={styles.businessName}>Closira Dashboard</Text>
          </View>
          {/* Notification dot — would be real in production */}
          <View style={styles.notifBtn}>
            <Text style={styles.notifIcon}>🔔</Text>
            <View style={styles.notifDot} />
          </View>
        </View>

        {/* ── Today's date ───────────────────────────────────────────── */}
        <Text style={styles.dateLabel}>
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long",
          })}
        </Text>

        {/* ── Stats grid ─────────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Today's Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            label="Leads Today"
            value={MOCK_STATS.total_leads_today}
            icon="📥"
            accent={COLORS.info}
            trend={MOCK_STATS.trends.total_leads_today}
          />
          <StatCard
            label="Missed"
            value={MOCK_STATS.missed_enquiries}
            icon="⚠️"
            accent={COLORS.danger}
            trend={MOCK_STATS.trends.missed_enquiries}
          />
          <StatCard
            label="Escalations"
            value={MOCK_STATS.open_escalations}
            icon="🔥"
            accent={COLORS.danger}
            trend={MOCK_STATS.trends.open_escalations}
          />
          <StatCard
            label="Follow-ups Due"
            value={MOCK_STATS.followups_due}
            icon="📅"
            accent={COLORS.warning}
            trend={MOCK_STATS.trends.followups_due}
          />
        </View>

        {/* ── Quick actions ──────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.dangerLight }]}
            onPress={() => navigation.navigate("Escalations")}
          >
            <Text style={styles.actionIcon}>🔥</Text>
            <Text style={[styles.actionLabel, { color: COLORS.danger }]}>Escalations</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.infoLight }]}
            onPress={() => navigation.navigate("Leads")}
          >
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={[styles.actionLabel, { color: COLORS.info }]}>All Leads</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: COLORS.warningLight }]}
            onPress={() => navigation.navigate("FollowUps")}
          >
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={[styles.actionLabel, { color: COLORS.warning }]}>Follow-ups</Text>
          </TouchableOpacity>
        </View>

        {/* ── Activity feed ──────────────────────────────────────────── */}
        <View style={styles.feedHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Leads")}>
            <Text style={styles.seeAll}>See all →</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.feedCard, SHADOWS.sm]}>
          {MOCK_ACTIVITY.map((item, index) => (
            <View key={item.id}>
              <ActivityItem item={item} />
              {index < MOCK_ACTIVITY.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        <View style={{ height: SPACING.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: { flex: 1 },
  content: { padding: SPACING.base },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  businessName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    ...SHADOWS.sm,
  },
  notifIcon: { fontSize: 18 },
  notifDot: {
    position: "absolute",
    top: 7,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },

  dateLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginBottom: SPACING.lg,
  },

  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },

  actionsRow: {
    flexDirection: "row",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.md,
    gap: SPACING.xs,
  },
  actionIcon: { fontSize: 22 },
  actionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
  },

  feedHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  seeAll: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.accent,
    fontWeight: "600",
  },

  feedCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.base,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
  },
});
