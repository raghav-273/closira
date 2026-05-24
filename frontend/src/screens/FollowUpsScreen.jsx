// screens/FollowUpsScreen.jsx
// Task list of scheduled follow-ups, sorted by due time (soonest first).
// Cards can be marked as done and disappear from the list.

import React, { useState } from "react";
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
} from "react-native";
import { COLORS, FONT_SIZES, SPACING } from "../utils/theme";
import { ENQUIRIES_WITH_FOLLOWUP } from "../mock/enquiries";
import FollowUpCard from "../components/followups/FollowUpCard";
import EmptyState from "../components/common/EmptyState";

export default function FollowUpsScreen() {
  const [followups, setFollowups] = useState(
    // Sort by due time — most urgent first
    [...ENQUIRIES_WITH_FOLLOWUP].sort(
      (a, b) => new Date(a.followup_due_at) - new Date(b.followup_due_at)
    )
  );

  const handleDone = (id) => {
    setFollowups(prev => prev.filter(e => e.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>Follow-ups</Text>
        <Text style={styles.subtitle}>{followups.length} pending</Text>
      </View>

      <Text style={styles.hint}>
        These customers are expecting a follow-up. Tap "Mark as Done" once sent.
      </Text>

      {/* ── Follow-up list ──────────────────────────────────────────── */}
      <FlatList
        data={followups}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FollowUpCard enquiry={item} onDone={handleDone} />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🎉"
            title="All caught up!"
            message="No follow-ups pending. Nice work keeping on top of your leads."
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  listContent: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.xl,
  },
});
