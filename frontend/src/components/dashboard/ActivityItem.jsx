// components/dashboard/ActivityItem.jsx
// A single row in the dashboard activity feed.
// Shows a colour-coded dot, activity description, and timestamp.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_SIZES, RADIUS, SPACING } from "../../utils/theme";
import ChannelBadge from "../common/ChannelBadge";

// Map activity type → accent colour for the leading dot
const TYPE_COLORS = {
  escalation: COLORS.danger,
  new_lead:   COLORS.info,
  followup:   COLORS.warning,
  resolved:   COLORS.success,
};

export default function ActivityItem({ item }) {
  const dotColor = TYPE_COLORS[item.type] ?? COLORS.textMuted;

  return (
    <View style={styles.row}>
      {/* Coloured dot indicates event type at a glance */}
      <View style={[styles.dot, { backgroundColor: dotColor }]} />

      <View style={styles.content}>
        <Text style={styles.customerName}>{item.customer_name}</Text>
        <Text style={styles.description} numberOfLines={1}>
          {item.description}
        </Text>
      </View>

      <View style={styles.right}>
        <ChannelBadge channel={item.channel} size="sm" />
        <Text style={styles.time}>{item.time}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  content: {
    flex: 1,
  },
  customerName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  description: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  right: {
    alignItems: "flex-end",
    gap: 4,
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
