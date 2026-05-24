// screens/LeadsScreen.jsx
// Shows all inbound leads with filter tabs (All / New / Qualified / Escalated).
// Tapping a card navigates to the ConversationDetail stack screen.

import React, { useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
} from "react-native";
import { COLORS, FONT_SIZES, RADIUS, SPACING } from "../utils/theme";
import { MOCK_ENQUIRIES } from "../mock/enquiries";
import LeadCard from "../components/leads/LeadCard";
import EmptyState from "../components/common/EmptyState";

const FILTERS = ["All", "New", "Qualified", "Escalated"];

// Map filter label → status values that qualify
const STATUS_MAP = {
  All:       null,
  New:       ["pending", "processing"],
  Qualified: ["open"],
  Escalated: ["escalated"],
};

export default function LeadsScreen({ navigation }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = STATUS_MAP[activeFilter]
    ? MOCK_ENQUIRIES.filter(e => STATUS_MAP[activeFilter].includes(e.status))
    : MOCK_ENQUIRIES;

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header ──────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.title}>Leads</Text>
        <Text style={styles.subtitle}>{MOCK_ENQUIRIES.length} total today</Text>
      </View>

      {/* ── Filter tabs ─────────────────────────────────────────────── */}
      <View style={styles.filtersWrapper}>
        <View style={styles.filters}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterTab, activeFilter === f && styles.filterTabActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f && styles.filterTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Lead list ───────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <LeadCard
            enquiry={item}
            onPress={() =>
              navigation.navigate("ConversationDetail", { enquiry: item })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="🔍"
            title={`No ${activeFilter.toLowerCase()} leads`}
            message="When customers reach out, their enquiries will appear here."
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
    paddingBottom: SPACING.sm,
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

  filtersWrapper: {
    paddingHorizontal: SPACING.base,
    marginBottom: SPACING.sm,
  },
  filters: {
    flexDirection: "row",
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    padding: 3,
    gap: 2,
  },
  filterTab: {
    flex: 1,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.sm,
    alignItems: "center",
  },
  filterTabActive: {
    backgroundColor: COLORS.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: COLORS.textPrimary,
    fontWeight: "700",
  },

  listContent: {
    paddingHorizontal: SPACING.base,
    paddingBottom: SPACING.xl,
  },
});
