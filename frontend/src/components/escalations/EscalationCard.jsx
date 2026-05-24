// components/escalations/EscalationCard.jsx
// Card for the Escalations screen. Shows escalation reason, urgency indicator,
// and a Resolve button. Tapping the card opens the ConversationDetail screen.

import React, { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet, Alert } from "react-native";
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from "../../utils/theme";
import ChannelBadge from "../common/ChannelBadge";
import { formatRelativeTime, getUrgencyConfig } from "../../utils/helpers";

/**
 * @param {object}   enquiry  - Escalated enquiry object
 * @param {function} onPress  - Open conversation detail
 * @param {function} onResolve - Mark as resolved callback
 */
export default function EscalationCard({ enquiry, onPress, onResolve }) {
  const [resolved, setResolved] = useState(false);
  const urgency = getUrgencyConfig(enquiry.created_at);

  const handleResolve = () => {
    Alert.alert(
      "Resolve Escalation",
      `Mark ${enquiry.customer_name}'s escalation as resolved?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Resolve",
          style: "destructive",
          onPress: () => {
            setResolved(true);
            onResolve && onResolve(enquiry.id);
          },
        },
      ]
    );
  };

  if (resolved) return null; // Remove from list once resolved

  return (
    <TouchableOpacity
      style={[styles.card, SHADOWS.sm]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      {/* Urgency strip at the top */}
      <View style={[styles.urgencyStrip, { backgroundColor: urgency.bg }]}>
        <Text style={[styles.urgencyText, { color: urgency.color }]}>
          ⚡ {urgency.label} Priority
        </Text>
        <Text style={styles.timeAgo}>{formatRelativeTime(enquiry.created_at)}</Text>
      </View>

      {/* Customer name + channel */}
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {enquiry.customer_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={styles.customerName}>{enquiry.customer_name}</Text>
          <ChannelBadge channel={enquiry.channel} size="sm" />
        </View>
      </View>

      {/* Escalation reason */}
      <View style={styles.reasonBox}>
        <Text style={styles.reasonLabel}>Reason</Text>
        <Text style={styles.reasonText} numberOfLines={2}>
          {enquiry.escalation_reason ?? "No reason provided."}
        </Text>
      </View>

      {/* Resolve button */}
      <TouchableOpacity style={styles.resolveBtn} onPress={handleResolve}>
        <Text style={styles.resolveBtnText}>✓ Mark Resolved</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: "hidden",
  },
  urgencyStrip: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs + 2,
  },
  urgencyText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  timeAgo: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    padding: SPACING.base,
    paddingBottom: SPACING.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.dangerLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.danger,
  },
  nameBlock: {
    gap: 5,
  },
  customerName: {
    fontSize: FONT_SIZES.base,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  reasonBox: {
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  reasonLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  reasonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  resolveBtn: {
    margin: SPACING.base,
    marginTop: SPACING.xs,
    backgroundColor: COLORS.success,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    alignItems: "center",
  },
  resolveBtnText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
  },
});
