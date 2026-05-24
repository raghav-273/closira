// screens/EscalationsScreen.jsx
// Shows all active escalations, sorted by most recent first.
// Each card has a Resolve button that removes it from the list.

import React, { useState } from "react";
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
} from "react-native";
import { COLORS, FONT_SIZES, SPACING } from "../utils/theme";
import { ESCALATED_ENQUIRIES } from "../mock/enquiries";
import EscalationCard from "../components/escalations/EscalationCard";
import EmptyState from "../components/common/EmptyState";

export default function EscalationsScreen({ navigation }) {
  // Local state so we can remove cards when resolved without mutating mock data
  const [escalations, setEscalations] = useState(ESCALATED_ENQUIRIES);

  const handleResolve = (id) => {
    setEscalations(prev => prev.filter(e => e.id !== id));
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>Escalations</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{escalations.length} active</Text>
        </View>
      </View>

      {escalations.length > 0 && (
        <Text style={styles.hint}>
          These enquiries need human attention. Resolve them once handled.
        </Text>
      )}

      {/* ── Escalation list ─────────────────────────────────────────── */}
      <FlatList
        data={escalations}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <EscalationCard
            enquiry={item}
            onPress={() =>
              navigation.navigate("ConversationDetail", { enquiry: item })
            }
            onResolve={handleResolve}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="✅"
            title="All clear!"
            message="No active escalations right now. Your AI is handling everything smoothly."
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
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.base,
    paddingTop: SPACING.base,
    paddingBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  countBadge: {
    backgroundColor: COLORS.dangerLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 99,
  },
  countText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.danger,
    fontWeight: "700",
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
