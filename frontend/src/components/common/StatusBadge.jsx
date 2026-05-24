// components/common/StatusBadge.jsx
// Pill badge showing enquiry status: New, Qualified, Escalated, Resolved.
// Colour-coded and used consistently across Leads and Escalations screens.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getStatusConfig } from "../../utils/helpers";
import { FONT_SIZES, RADIUS, SPACING } from "../../utils/theme";

/**
 * @param {string} status - "pending"|"open"|"escalated"|"resolved"|"processing"
 */
export default function StatusBadge({ status }) {
  const config = getStatusConfig(status);

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.color }]} />
      <Text style={[styles.label, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
});
