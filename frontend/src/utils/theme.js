// utils/theme.js
// Single source of truth for all colours, spacing, typography, and shadows.
// Change a value here and it updates everywhere in the app.

export const COLORS = {
  // Brand
  primary:        "#1A1F36",   // Deep navy — main brand colour
  primaryLight:   "#2D3561",   // Lighter navy for hover states
  accent:         "#6C63FF",   // Purple accent for highlights
  accentLight:    "#EEF0FF",   // Very light purple for tinted backgrounds

  // Semantic status colours
  success:        "#10B981",   // Green — qualified / resolved
  successLight:   "#D1FAE5",
  warning:        "#F59E0B",   // Amber — call channel / medium urgency
  warningLight:   "#FEF3C7",
  danger:         "#EF4444",   // Red — escalated / high urgency
  dangerLight:    "#FEE2E2",
  info:           "#3B82F6",   // Blue — email channel / new status
  infoLight:      "#DBEAFE",

  // Channel badge colours
  channelWhatsapp:      "#25D366",
  channelWhatsappLight: "#DCFCE7",
  channelEmail:         "#3B82F6",
  channelEmailLight:    "#DBEAFE",
  channelCall:          "#F59E0B",
  channelCallLight:     "#FEF3C7",

  // Neutrals
  background:     "#F8F9FD",   // Page background
  surface:        "#FFFFFF",   // Card / component background
  surfaceAlt:     "#F1F3F9",   // Slightly tinted surface
  border:         "#E2E8F0",
  borderLight:    "#F0F4F8",

  // Text
  textPrimary:    "#1A1F36",
  textSecondary:  "#64748B",
  textMuted:      "#94A3B8",
  textInverse:    "#FFFFFF",
};

export const FONTS = {
  regular:  "System",   // Falls back to SF Pro / Roboto
  medium:   "System",
  semiBold: "System",
  bold:     "System",
};

export const FONT_SIZES = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  30,
};

export const SPACING = {
  xs:  4,
  sm:  8,
  md:  12,
  base:16,
  lg:  20,
  xl:  24,
  xxl: 32,
};

export const RADIUS = {
  sm:   6,
  md:   10,
  lg:   14,
  xl:   20,
  full: 999,
};

export const SHADOWS = {
  sm: {
    shadowColor: "#1A1F36",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#1A1F36",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
