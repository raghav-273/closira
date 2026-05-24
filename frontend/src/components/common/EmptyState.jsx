// components/common/EmptyState.jsx
// Displayed whenever a list has no items to show.
// A blank screen with no explanation is a poor UX — this gives context and
// reassures the user that the absence of data is intentional, not a bug.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_SIZES, SPACING } from "../../utils/theme";

/**
 * @param {string} icon    - Emoji or icon character to display large
 * @param {string} title   - Short heading
 * @param {string} message - Explanatory subtext
 */
export default function EmptyState({ icon = "📭", title, message }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    paddingHorizontal: SPACING.xl,
  },
  icon: {
    fontSize: 48,
    marginBottom: SPACING.base,
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  message: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
  },
});
