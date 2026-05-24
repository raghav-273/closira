// components/followups/FollowUpCard.jsx
// Task card for the Follow-ups screen. Shows due time, message preview,
// and a mark-as-done action that removes the card from the list.

import React, { useState } from "react";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING } from "../../utils/theme";
import ChannelBadge from "../common/ChannelBadge";
import { formatDateTime } from "../../utils/helpers";

export default function FollowUpCard({ enquiry, onDone }) {
  const [done, setDone] = useState(false);

  const handleDone = () => {
    setDone(true);
    onDone && onDone(enquiry.id);
  };

  if (done) return null;

  // Calculate how much time until the follow-up is due
  const dueDate = new Date(enquiry.followup_due_at);
  const now = new Date();
  const minutesUntil = Math.round((dueDate - now) / 60000);
  const isOverdue = minutesUntil < 0;
  const dueLabel = isOverdue
    ? `Overdue by ${Math.abs(minutesUntil)}m`
    : minutesUntil < 60
    ? `Due in ${minutesUntil}m`
    : `Due ${formatDateTime(enquiry.followup_due_at)}`;

  return (
    <View style={[styles.card, SHADOWS.sm, isOverdue && styles.cardOverdue]}>
      {/* Due time indicator */}
      <View style={[styles.dueRow, isOverdue ? styles.dueBgOverdue : styles.dueBgNormal]}>
        <Text style={[styles.dueLabel, { color: isOverdue ? COLORS.danger : COLORS.warning }]}>
          🕐 {dueLabel}
        </Text>
      </View>

      <View style={styles.body}>
        {/* Customer name + channel */}
        <View style={styles.header}>
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

        {/* Message preview */}
        <View style={styles.messageBox}>
          <Text style={styles.messageLabel}>Message preview</Text>
          <Text style={styles.messageText} numberOfLines={2}>
            {enquiry.followup_message}
          </Text>
        </View>

        {/* Mark as done */}
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.doneBtnText}>✓ Mark as Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    overflow: "hidden",
  },
  cardOverdue: {
    borderWidth: 1,
    borderColor: COLORS.dangerLight,
  },
  dueRow: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.xs + 2,
  },
  dueBgNormal: { backgroundColor: COLORS.warningLight },
  dueBgOverdue: { backgroundColor: COLORS.dangerLight },
  dueLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  body: {
    padding: SPACING.base,
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
    backgroundColor: COLORS.warningLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.warning,
  },
  nameBlock: {
    gap: 5,
  },
  customerName: {
    fontSize: FONT_SIZES.base,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  messageBox: {
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
  },
  messageLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  messageText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    fontStyle: "italic",
  },
  doneBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    paddingVertical: SPACING.sm,
    alignItems: "center",
  },
  doneBtnText: {
    color: COLORS.textInverse,
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
  },
});
