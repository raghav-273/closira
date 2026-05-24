// screens/ConversationDetailScreen.jsx
// Full conversation view for a single enquiry.
// Shows: message thread, SOP match label, AI summary, and status timeline.
// Opened as a stack screen from Leads or Escalations.

import React from "react";
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity,
} from "react-native";
import {
  COLORS, FONT_SIZES, RADIUS, SHADOWS, SPACING,
} from "../utils/theme";
import ChannelBadge from "../components/common/ChannelBadge";
import StatusBadge from "../components/common/StatusBadge";
import { formatDateTime, formatRelativeTime } from "../utils/helpers";

// Map event types to human-readable labels and icons for the timeline
const EVENT_DISPLAY = {
  created:             { icon: "📥", label: "Enquiry Received" },
  processing_started:  { icon: "⚙️", label: "Processing Started" },
  sop_matched:         { icon: "🧩", label: "SOP Matched" },
  escalated:           { icon: "🔥", label: "Escalated" },
  follow_up_scheduled: { icon: "📅", label: "Follow-up Scheduled" },
  resolved:            { icon: "✅", label: "Resolved" },
  note:                { icon: "📝", label: "Note Added" },
};

export default function ConversationDetailScreen({ route, navigation }) {
  const { enquiry } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Custom back header ──────────────────────────────────────── */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle} numberOfLines={1}>
          {enquiry.customer_name}
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Customer info card ──────────────────────────────────────── */}
        <View style={[styles.card, SHADOWS.sm]}>
          <View style={styles.customerRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {enquiry.customer_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.customerInfo}>
              <Text style={styles.customerName}>{enquiry.customer_name}</Text>
              <Text style={styles.timeText}>
                {formatRelativeTime(enquiry.created_at)} · {formatDateTime(enquiry.created_at)}
              </Text>
            </View>
          </View>
          <View style={styles.badgeRow}>
            <ChannelBadge channel={enquiry.channel} />
            <StatusBadge status={enquiry.status} />
          </View>
        </View>

        {/* ── Original message ────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Customer Message</Text>
        <View style={[styles.card, SHADOWS.sm, styles.messageCard]}>
          <Text style={styles.messageText}>{enquiry.message}</Text>
        </View>

        {/* ── SOP match section ───────────────────────────────────────── */}
        {enquiry.matched_sop ? (
          <>
            <Text style={styles.sectionLabel}>AI Response</Text>
            <View style={[styles.card, SHADOWS.sm]}>
              <View style={styles.sopRow}>
                <Text style={styles.sopIcon}>🧩</Text>
                <View style={styles.sopInfo}>
                  <Text style={styles.sopLabel}>SOP Matched</Text>
                  <Text style={styles.sopName}>{enquiry.matched_sop}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.responseLabel}>Suggested Response</Text>
              <Text style={styles.responseText}>{enquiry.suggested_response}</Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.sectionLabel}>AI Response</Text>
            <View style={[styles.card, styles.noMatchCard]}>
              <Text style={styles.noMatchIcon}>🤔</Text>
              <Text style={styles.noMatchTitle}>No SOP Match</Text>
              <Text style={styles.noMatchText}>
                The AI couldn't match this message to a known SOP. This enquiry has been
                automatically escalated for human review.
              </Text>
            </View>
          </>
        )}

        {/* ── Escalation reason (if escalated) ────────────────────────── */}
        {enquiry.escalation_reason && (
          <>
            <Text style={styles.sectionLabel}>Escalation Reason</Text>
            <View style={[styles.card, styles.escalationCard, SHADOWS.sm]}>
              <Text style={styles.escalationIcon}>⚠️</Text>
              <Text style={styles.escalationText}>{enquiry.escalation_reason}</Text>
            </View>
          </>
        )}

        {/* ── Follow-up (if scheduled) ────────────────────────────────── */}
        {enquiry.followup_due_at && (
          <>
            <Text style={styles.sectionLabel}>Follow-up Scheduled</Text>
            <View style={[styles.card, styles.followupCard, SHADOWS.sm]}>
              <Text style={styles.followupTime}>
                📅 {formatDateTime(enquiry.followup_due_at)}
              </Text>
              <Text style={styles.followupMsg}>{enquiry.followup_message}</Text>
            </View>
          </>
        )}

        {/* ── Status timeline ─────────────────────────────────────────── */}
        <Text style={styles.sectionLabel}>Status Timeline</Text>
        <View style={[styles.card, SHADOWS.sm]}>
          {enquiry.events.map((event, index) => {
            const display = EVENT_DISPLAY[event.event_type] ?? { icon: "•", label: event.event_type };
            const isLast = index === enquiry.events.length - 1;

            return (
              <View key={event.id} style={styles.timelineRow}>
                {/* Vertical line connector */}
                <View style={styles.timelineLeft}>
                  <View style={styles.timelineDot}>
                    <Text style={styles.timelineIcon}>{display.icon}</Text>
                  </View>
                  {!isLast && <View style={styles.timelineLine} />}
                </View>

                <View style={styles.timelineContent}>
                  <Text style={styles.timelineLabel}>{display.label}</Text>
                  <Text style={styles.timelineDesc}>{event.description}</Text>
                  <Text style={styles.timelineTime}>
                    {formatDateTime(event.created_at)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        <View style={{ height: SPACING.xl * 2 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backBtn: { width: 60 },
  backText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.accent,
    fontWeight: "600",
  },
  navTitle: {
    fontSize: FONT_SIZES.base,
    fontWeight: "700",
    color: COLORS.textPrimary,
    flex: 1,
    textAlign: "center",
  },

  scroll: { flex: 1 },
  content: { padding: SPACING.base },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.base,
    marginBottom: SPACING.sm,
  },

  // Customer info
  customerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: "700",
    color: COLORS.accent,
  },
  customerInfo: { flex: 1 },
  customerName: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  timeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  badgeRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },

  sectionLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: "700",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },

  messageCard: {
    backgroundColor: COLORS.surfaceAlt,
  },
  messageText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textPrimary,
    lineHeight: 24,
  },

  // SOP match
  sopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  sopIcon: { fontSize: 24 },
  sopInfo: {},
  sopLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  sopName: {
    fontSize: FONT_SIZES.base,
    fontWeight: "700",
    color: COLORS.accent,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginBottom: SPACING.sm,
  },
  responseLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
  },
  responseText: {
    fontSize: FONT_SIZES.base,
    color: COLORS.textSecondary,
    lineHeight: 22,
    fontStyle: "italic",
  },

  // No SOP match
  noMatchCard: {
    backgroundColor: COLORS.warningLight,
    alignItems: "center",
  },
  noMatchIcon: { fontSize: 36, marginBottom: SPACING.xs },
  noMatchTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: "700",
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  noMatchText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },

  // Escalation
  escalationCard: {
    backgroundColor: COLORS.dangerLight,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.sm,
  },
  escalationIcon: { fontSize: 18, marginTop: 2 },
  escalationText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.danger,
    lineHeight: 20,
    fontWeight: "500",
  },

  // Follow-up
  followupCard: { backgroundColor: COLORS.warningLight },
  followupTime: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  followupMsg: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },

  // Timeline
  timelineRow: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  timelineLeft: {
    alignItems: "center",
    width: 32,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineIcon: { fontSize: 14 },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: 3,
    minHeight: 16,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: SPACING.base,
  },
  timelineLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  timelineDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 3,
  },
  timelineTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
