// components/dashboard/StatCard.jsx
// Summary metric card shown at the top of the Dashboard screen.
// Each card shows a label, value, trend indicator, and colour-coded accent.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from "../../utils/theme";

/**
 * @param {string} label    - Metric name, e.g. "Leads Today"
 * @param {number} value    - The number to display
 * @param {string} icon     - Emoji icon
 * @param {string} accent   - Hex colour for the left border accent
 * @param {number} trend    - Percentage change, positive = up, negative = down
 */
export default function StatCard({ label, value, icon, accent, trend }) {
  const trendIsGood = (label.toLowerCase().includes("missed") || label.toLowerCase().includes("escalat"))
    ? trend <= 0   // for bad metrics, down = good
    : trend >= 0;  // for good metrics, up = good

  const trendColor = trend === 0
    ? COLORS.textMuted
    : trendIsGood ? COLORS.success : COLORS.danger;

  const trendText = trend === 0
    ? "—"
    : `${trend > 0 ? "+" : ""}${trend}%`;

  return (
    <View style={[styles.card, SHADOWS.sm, { borderLeftColor: accent }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {trend !== undefined && (
        <Text style={[styles.trend, { color: trendColor }]}>{trendText} vs yesterday</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    borderLeftWidth: 3,
    flex: 1,
    minWidth: "47%",
  },
  icon: {
    fontSize: 22,
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginBottom: SPACING.xs,
  },
  trend: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
  },
});
