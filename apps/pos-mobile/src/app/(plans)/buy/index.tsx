import { useGetPlans } from "@/client/plans";
import { Colors, Fonts, Radius, Spacing } from "@/constants/theme";
import type { Plan } from "@/types/plans";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type MCIcon = keyof typeof MaterialCommunityIcons.glyphMap;

const FEATURE_ICONS: Record<string, MCIcon> = {
  udhaarLedger: "book-account-outline",
  automatedSmsReminders: "message-text-outline",
  whatsappReminders: "whatsapp",
  salesReports: "chart-bar",
  plReport: "chart-line",
  vatInvoice: "file-document-outline",
  productVariants: "tag-multiple-outline",
  cashDrawer: "cash-register",
  offlineSync: "cloud-sync-outline",
  customReceiptBranding: "receipt",
  loyaltyPoints: "star-outline",
  multiStore: "store-outline",
  multiStaff: "account-group-outline",
  staffSalesReports: "account-details-outline",
  consolidatedReports: "chart-box-outline",
  prioritySupport: "headset",
  exportPdf: "file-pdf-box",
};

const FEATURE_LABELS: Record<string, string> = {
  maxProducts: "Max Products",
  maxStores: "Max Stores",
  maxStaff: "Max Staff",
  udhaarLedger: "Credit Ledger",
  automatedSmsReminders: "Auto SMS Reminders",
  whatsappReminders: "WhatsApp Reminders",
  salesReports: "Sales Reports",
  plReport: "P&L Report",
  vatInvoice: "VAT Invoice",
  productVariants: "Product Variants",
  cashDrawer: "Cash Drawer",
  offlineSync: "Offline Sync",
  customReceiptBranding: "Custom Receipt",
  loyaltyPoints: "Loyalty Points",
  multiStore: "Multi Store",
  multiStaff: "Multi Staff",
  staffSalesReports: "Staff Reports",
  consolidatedReports: "Consolidated Reports",
  prioritySupport: "Priority Support",
  exportPdf: "Export PDF",
};

const TIER_COLORS: Record<string, string> = {
  starter: "#6B7280",
  pro: "#2563EB",
  business: "#7C3AED",
};

const TIER_BADGE: Record<string, string> = {
  starter: "Free",
  pro: "Popular",
  business: "Best Value",
};

export default function PlansScreen() {
  const scheme = useColorScheme();
  const c = scheme === "dark" ? Colors.dark : Colors.light;
  const s = styles(c);

  const { data: plans, isLoading, error } = useGetPlans();
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (plan: Plan) => {
    setSelected(plan.id);

    if (plan.tier === "starter") {
      router.replace("/(stores)/index");
    } else {
      router.push(`/(plans)/buy/index?id=${plan.id}`);
    }
  };

  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator color={c.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={s.center}>
        <Text style={s.errorText}>Failed to load plans</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={s.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Choose Your Plan</Text>
        <Text style={s.headerSubtitle}>
          Start free. Upgrade anytime as your business grows.
        </Text>
      </View>

      {plans?.map((plan) => {
        const tierColor = TIER_COLORS[plan.tier] ?? c.primary;
        const isSelected = selected === plan.id;
        const isFree = plan.tier === "starter";
        const badge = TIER_BADGE[plan.tier];

        return (
          <TouchableOpacity
            key={plan.id}
            activeOpacity={0.85}
            onPress={() => handleSelect(plan)}
            style={[
              s.card,
              isSelected && { borderColor: tierColor, borderWidth: 2 },
              plan.tier === "pro" && s.cardHighlighted,
            ]}
          >
            {/* Badge */}
            {badge && (
              <View style={[s.badge, { backgroundColor: tierColor }]}>
                <Text style={s.badgeText}>{badge}</Text>
              </View>
            )}

            {/* Plan header */}
            <View style={s.planHeader}>
              <View style={[s.tierDot, { backgroundColor: tierColor }]} />
              <Text style={[s.planName, { color: tierColor }]}>
                {plan.name}
              </Text>
            </View>

            <Text style={s.planDescription}>{plan.description}</Text>

            {/* Pricing */}
            <View style={s.priceRow}>
              {isFree ? (
                <Text style={[s.priceMain, { color: tierColor }]}>Free</Text>
              ) : (
                <View>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "baseline",
                      gap: 4,
                    }}
                  >
                    <Text style={[s.priceMain, { color: tierColor }]}>
                      Rs {plan.monthlyPrice}
                    </Text>
                    <Text style={s.pricePer}>/month</Text>
                  </View>
                  <Text style={s.priceYearly}>
                    Rs {plan.yearlyPrice}/year · save Rs{" "}
                    {plan.monthlyPrice * 12 - plan.yearlyPrice}
                  </Text>
                </View>
              )}
            </View>

            {/* Limits */}
            <View style={s.limitsRow}>
              {["maxProducts", "maxStores", "maxStaff"].map((key) => {
                const val = plan.features[key as keyof typeof plan.features];
                return (
                  <View key={key} style={s.limitChip}>
                    <Text style={s.limitValue}>
                      {val === null ? "∞" : String(val)}
                    </Text>
                    <Text style={s.limitLabel}>{key.replace("max", "")}</Text>
                  </View>
                );
              })}
            </View>

            <View style={s.divider} />

            {/* Boolean features */}
            <View style={s.featuresGrid}>
              {Object.entries(plan.features)
                .filter(
                  ([key]) =>
                    !["maxProducts", "maxStores", "maxStaff"].includes(key),
                )
                .map(([key, value]) => {
                  const enabled = value === true;
                  const icon = FEATURE_ICONS[key] ?? "check-circle-outline";
                  const label = FEATURE_LABELS[key] ?? key;
                  return (
                    <View key={key} style={s.featureRow}>
                      <MaterialCommunityIcons
                        name={enabled ? icon : "close-circle-outline"}
                        size={16}
                        color={enabled ? tierColor : c.mutedForeground}
                      />
                      <Text
                        style={[
                          s.featureLabel,
                          !enabled && s.featureLabelDisabled,
                        ]}
                      >
                        {label}
                      </Text>
                    </View>
                  );
                })}
            </View>

            {/* CTA */}
            <TouchableOpacity
              style={[s.ctaButton, { backgroundColor: tierColor }]}
              activeOpacity={0.85}
              onPress={() => handleSelect(plan)}
            >
              <Text style={s.ctaText}>
                {isFree ? "Get Started Free" : `Choose ${plan.name}`}
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color="#fff"
              />
            </TouchableOpacity>
          </TouchableOpacity>
        );
      })}

      <View style={{ height: Spacing.six }} />
    </ScrollView>
  );
}

const styles = (c: (typeof Colors)[keyof typeof Colors]) =>
  StyleSheet.create({
    container: {
      padding: Spacing.three,
    },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    errorText: {
      color: "red",
      fontSize: 14,
    },
    header: {
      marginBottom: Spacing.four,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "700",
      color: c.text,
      marginBottom: 6,
    },
    headerSubtitle: {
      fontSize: 14,
      color: c.mutedForeground,
      lineHeight: 20,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: Spacing.three,
      marginBottom: Spacing.three,
      position: "relative",
      overflow: "hidden",
    },
    cardHighlighted: {
      borderColor: "#2563EB",
      borderWidth: 2,
    },
    badge: {
      position: "absolute",
      top: 0,
      right: 0,
      paddingHorizontal: Spacing.two,
      paddingVertical: 4,
      borderBottomLeftRadius: Radius.lg,
    },
    badgeText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    planHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.one,
      marginBottom: Spacing.one,
      marginTop: Spacing.one,
    },
    tierDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    planName: {
      fontSize: 20,
      fontWeight: "700",
    },
    planDescription: {
      fontSize: 13,
      color: c.mutedForeground,
      lineHeight: 18,
      marginBottom: Spacing.three,
    },
    priceRow: {
      marginBottom: Spacing.three,
    },
    priceMain: {
      fontSize: 32,
      fontWeight: "800",
    },
    pricePer: {
      fontSize: 14,
      color: c.mutedForeground,
    },
    priceYearly: {
      fontSize: 12,
      color: c.mutedForeground,
      marginTop: 2,
    },
    limitsRow: {
      flexDirection: "row",
      gap: Spacing.two,
      marginBottom: Spacing.three,
    },
    limitChip: {
      flex: 1,
      alignItems: "center",
      paddingVertical: Spacing.two,
      borderRadius: Radius.md,
      backgroundColor: c.backgroundElement,
    },
    limitValue: {
      fontSize: 18,
      fontWeight: "700",
      color: c.text,
    },
    limitLabel: {
      fontSize: 11,
      color: c.mutedForeground,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
      marginBottom: Spacing.three,
    },
    featuresGrid: {
      gap: Spacing.two,
      marginBottom: Spacing.three,
    },
    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
    },
    featureLabel: {
      fontSize: 13,
      color: c.text,
    },
    featureLabelDisabled: {
      color: c.mutedForeground,
      textDecorationLine: "line-through",
    },
    ctaButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.two,
      paddingVertical: Spacing.three,
      borderRadius: Radius.lg,
    },
    ctaText: {
      color: "#fff",
      fontSize: 15,
      fontWeight: "700",
    },
  });
