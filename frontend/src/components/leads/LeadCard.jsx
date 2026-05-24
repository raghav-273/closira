// components/leads/LeadCard.jsx
// Tappable card showing a single inbound lead.
// Used in the Leads screen list. Tapping opens the ConversationDetail screen.

import React from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from "../../utils/theme";
import ChannelBadge from "../common/ChannelBadge";
import StatusBadge from "../common/StatusBadge";
import { formatRelativeTime } from "../../utils/helpers";

/**
 * @param {object}   enquiry  - Enquiry data object from mock data
 * @param {function} onPress  - Called when the card is tapped
 */
export default function LeadCard({ enquiry, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.sm]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {/* Top row: avatar + name + time */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {enquiry.customer_name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.customerName}>{enquiry.customer_name}</Text>
          <Text style={styles.time}>{formatRelativeTime(enquiry.created_at)}</Text>
        </View>

        <StatusBadge status={enquiry.status} />
      </View>

      {/* Message preview */}
      <Text style={styles.message} numberOfLines={2}>
        {enquiry.message}
      </Text>

      {/* Bottom row: channel badge + SOP match */}
      <View style={styles.footer}>
        <ChannelBadge channel={enquiry.channel} size="sm" />
        {enquiry.matched_sop && (
          <View style={styles.sopTag}>
            <Text style={styles.sopText}>🧩 {enquiry.matched_sop}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.accent,
  },
  nameBlock: {
    flex: 1,
  },
  customerName: {
    fontSize: FONT_SIZES.base,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  time: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  message: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    flexWrap: "wrap",
  },
  sopTag: {
    backgroundColor: COLORS.accentLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  sopText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.accent,
    fontWeight: "600",
  },
});
