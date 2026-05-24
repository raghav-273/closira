// components/common/ChannelBadge.jsx
// Small pill badge showing the inbound channel (WhatsApp / Email / Call).
// Consistent colour coding across every screen in the app.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { getChannelConfig } from "../../utils/helpers";
import { FONT_SIZES, RADIUS, SPACING } from "../../utils/theme";

/**
 * @param {string} channel - "whatsapp" | "email" | "call"
 * @param {string} size    - "sm" | "md" (default "md")
 */
export default function ChannelBadge({ channel, size = "md" }) {
  const config = getChannelConfig(channel);
  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: config.bg },
        isSmall && styles.badgeSm,
      ]}
    >
      <Text style={isSmall ? styles.iconSm : styles.icon}>{config.icon}</Text>
      <Text
        style={[
          styles.label,
          { color: config.color },
          isSmall && styles.labelSm,
        ]}
      >
        {config.label}
      </Text>
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
    gap: 4,
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  icon: {
    fontSize: 12,
  },
  iconSm: {
    fontSize: 10,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "600",
  },
  labelSm: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "600",
  },
});
