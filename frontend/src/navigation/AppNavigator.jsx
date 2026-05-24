// navigation/AppNavigator.jsx
// Root navigation setup.
// Bottom tab navigator with 4 tabs + a stack navigator for ConversationDetail.
// The detail screen opens on top of the tabs, full-screen, without the tab bar.

import React from "react";
import { Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import DashboardScreen from "../screens/DashboardScreen";
import LeadsScreen from "../screens/LeadsScreen";
import EscalationsScreen from "../screens/EscalationsScreen";
import FollowUpsScreen from "../screens/FollowUpsScreen";
import ConversationDetailScreen from "../screens/ConversationDetailScreen";

import { COLORS, FONT_SIZES } from "../utils/theme";
import { ESCALATED_ENQUIRIES, ENQUIRIES_WITH_FOLLOWUP } from "../mock/enquiries";

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Tab icon map — using emojis keeps it dependency-free
const TAB_ICONS = {
  Home:        "🏠",
  Leads:       "👥",
  Escalations: "🔥",
  FollowUps:   "📅",
};

// The bottom tabs live inside this component so the stack can render
// ConversationDetail on top without the tab bar showing.
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderLight,
          borderTopWidth: 1,
          paddingBottom: 6,
          paddingTop: 6,
          height: 62,
        },
        tabBarActiveTintColor:   COLORS.accent,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: "Home" }}
      />
      <Tab.Screen
        name="Leads"
        component={LeadsScreen}
        options={{ tabBarLabel: "Leads" }}
      />
      <Tab.Screen
        name="Escalations"
        component={EscalationsScreen}
        options={{
          tabBarLabel: "Escalations",
          // Show a red badge with the count of active escalations
          tabBarBadge: ESCALATED_ENQUIRIES.length > 0 ? ESCALATED_ENQUIRIES.length : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.danger, fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="FollowUps"
        component={FollowUpsScreen}
        options={{
          tabBarLabel: "Follow-ups",
          tabBarBadge: ENQUIRIES_WITH_FOLLOWUP.length > 0 ? ENQUIRIES_WITH_FOLLOWUP.length : undefined,
          tabBarBadgeStyle: { backgroundColor: COLORS.warning, fontSize: 10 },
        }}
      />
    </Tab.Navigator>
  );
}

// Root stack — tabs are the default screen; ConversationDetail slides in on top
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen
          name="ConversationDetail"
          component={ConversationDetailScreen}
          options={{
            animation: "slide_from_right",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
