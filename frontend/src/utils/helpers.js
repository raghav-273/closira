// utils/helpers.js
// Small utility functions used across multiple screens.
// Keeping them here prevents copy-pasting and makes testing straightforward.

import { COLORS } from "./theme";

/**
 * Returns the colour config for a given channel string.
 * Used consistently across every screen that shows a channel badge.
 */
export function getChannelConfig(channel) {
  switch (channel?.toLowerCase()) {
    case "whatsapp":
      return { label: "WhatsApp", color: COLORS.channelWhatsapp, bg: COLORS.channelWhatsappLight, icon: "💬" };
    case "email":
      return { label: "Email", color: COLORS.channelEmail, bg: COLORS.channelEmailLight, icon: "✉️" };
    case "call":
      return { label: "Call", color: COLORS.channelCall, bg: COLORS.channelCallLight, icon: "📞" };
    default:
      return { label: channel ?? "Unknown", color: COLORS.textSecondary, bg: COLORS.surfaceAlt, icon: "💬" };
  }
}

/**
 * Returns the colour config for a given enquiry status.
 */
export function getStatusConfig(status) {
  switch (status?.toLowerCase()) {
    case "new":
    case "pending":
      return { label: "New", color: COLORS.info, bg: COLORS.infoLight };
    case "open":
    case "qualified":
      return { label: "Qualified", color: COLORS.success, bg: COLORS.successLight };
    case "escalated":
      return { label: "Escalated", color: COLORS.danger, bg: COLORS.dangerLight };
    case "resolved":
      return { label: "Resolved", color: COLORS.success, bg: COLORS.successLight };
    case "processing":
      return { label: "Processing", color: COLORS.warning, bg: COLORS.warningLight };
    default:
      return { label: status ?? "Unknown", color: COLORS.textSecondary, bg: COLORS.surfaceAlt };
  }
}

/**
 * Formats a UTC ISO date string into a human-readable relative time.
 * e.g. "2025-05-20T09:14:00Z" → "2h ago"
 */
export function formatRelativeTime(isoString) {
  if (!isoString) return "";
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/**
 * Formats a UTC ISO date string into a short clock time.
 * e.g. "2025-05-20T09:14:00Z" → "9:14 AM"
 */
export function formatTime(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Formats a UTC ISO string to a full readable date-time.
 * e.g. "20 May 2025, 9:14 AM"
 */
export function formatDateTime(isoString) {
  if (!isoString) return "";
  return new Date(isoString).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Returns urgency config for escalations based on how long ago they were created.
 * < 30 min = high urgency, else medium.
 */
export function getUrgencyConfig(createdAt) {
  const diffMin = (new Date() - new Date(createdAt)) / 60000;
  if (diffMin < 30) {
    return { label: "High", color: COLORS.danger, bg: COLORS.dangerLight };
  }
  return { label: "Medium", color: COLORS.warning, bg: COLORS.warningLight };
}

/**
 * Returns a shortened version of a name (first name + last initial).
 * "Sarah Mitchell" → "Sarah M."
 */
export function shortName(fullName) {
  if (!fullName) return "";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1][0]}.`;
}
