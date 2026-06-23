import React, { useRef, useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Spacing, Ui } from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLanguage } from "@/lib/hooks/useLanguage";
import { translations } from "./translation";

const theme = Colors.light;
const { width } = Dimensions.get("window");
const CARD_GAP = 10;
const HALF_CARD = (width - Spacing.three * 2 - CARD_GAP) / 2;

// ─── Types ───────────────────────────────────────────────────────────────────
type NavItem = { label: string; icon: string; activeIcon: string };
type TranslationKey = keyof typeof translations.english;
type QuickAction = {
  label: string;
  icon: string;
  /** Relative path under the current store, e.g. "products/create" */
  href?: string;
};
type StatCard = {
  label: string;
  value: string;
  sub?: string;
  tint: "green" | "red" | "neutral";
  arrow?: "down" | "up";
};


// ─── Data ────────────────────────────────────────────────────────────────────
const cashflowData = [
  { day: "Bai 27", in: 12000, out: 8000 },
  { day: "Bai 28", in: 18000, out: 5000 },
  { day: "Bai 29", in: 8000, out: 12000 },
  { day: "Bai 30", in: 15000, out: 9000 },
  { day: "Bai 31", in: 20000, out: 7000 },
  { day: "Jes 1", in: 11000, out: 14000 },
  { day: "Jes 2", in: 16000, out: 6000 },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useFadeSlide(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(18)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
}

// ─── Mini Cashflow Chart ──────────────────────────────────────────────────────
function CashflowChart({ t }: { t: any }) {
  const maxVal = 20000;
  const chartW = width - Spacing.three * 2 - 40;
  const chartH = 110;
  const barW = (chartW / cashflowData.length) * 0.35;
  const gap = (chartW / cashflowData.length) * 0.65;

  const yLabels = ["20K", "15K", "10K", "5K", "0"];

  return (
    <View
      style={{ paddingHorizontal: Spacing.three, paddingBottom: Spacing.three }}
    >
      <View style={{ flexDirection: "row" }}>
        {/* Y axis */}
        <View
          style={{
            width: 36,
            height: chartH,
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingRight: 4,
          }}
        >
          {yLabels.map((l) => (
            <Text key={l} style={styles.chartAxisLabel}>
              {l}
            </Text>
          ))}
        </View>

        {/* Bars */}
        <View
          style={{
            flex: 1,
            height: chartH,
            flexDirection: "row",
            alignItems: "flex-end",
          }}
        >
          {cashflowData.map((d, i) => {
            const inH = (d.in / maxVal) * chartH;
            const outH = (d.out / maxVal) * chartH;
            return (
              <View
                key={d.day}
                style={{
                  flex: 1,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <View
                  style={{
                    width: barW,
                    height: inH,
                    backgroundColor: theme.success,
                    borderRadius: 3,
                  }}
                />
                <View
                  style={{
                    width: barW,
                    height: outH,
                    backgroundColor: theme.primary,
                    borderRadius: 3,
                    opacity: 0.7,
                  }}
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* X axis labels */}
      <View style={{ flexDirection: "row", marginLeft: 36, marginTop: 6 }}>
        {cashflowData.map((d) => (
          <View key={d.day} style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.chartAxisLabel}>{d.day}</Text>
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.chartLegend}>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: theme.success }]}
          />
          <View>
            <Text style={styles.legendLabel}>{t.cashflowIn}</Text>
            <Text style={[styles.legendValue, { color: theme.success }]}>
              Rs. 1,00,000
            </Text>
          </View>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[styles.legendDot, { backgroundColor: theme.primary }]}
          />
          <View>
            <Text style={styles.legendLabel}>{t.cashflowOut}</Text>
            <Text style={[styles.legendValue, { color: theme.primary }]}>
              Rs. 61,000
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { id: storeId } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [activeNav, setActiveNav] = useState(0);

  const openStoreRoute = (href: string) => {
    if (!storeId || storeId === "[id]") return;
    router.push(`/(stores)/${storeId}/${href}`);
  };
  const [showBanner, setShowBanner] = useState(true);
  const [cashflowFilter, setCashflowFilter] = useState<"Daily" | "Weekly">(
    "Daily",
  );

  // Translations
  const { lang, changeLanguage } = useLanguage();
  const t = useMemo(() => {
    return translations[lang] as typeof translations.english;
  }, [lang]);

  const navItems = [
    { label: t.home, icon: "home-outline", activeIcon: "home" },
    {
      label: t.transactions,
      icon: "swap-horizontal-outline",
      activeIcon: "swap-horizontal",
    },
    {
      label: t.parties,
      icon: "people-outline",
      activeIcon: "people",
    },
    {
      label: t.inventory,
      icon: "cube-outline",
      activeIcon: "cube",
    },
    {
      label: t.more,
      icon: "grid-outline",
      activeIcon: "grid",
    },
  ];

  const topShortcuts = [
    { label: t.quickEntry, icon: "flash-outline" },
    { label: t.quickPos, icon: "storefront-outline" },
    { label: t.viewReports, icon: "bar-chart-outline" },
    { label: t.creditReminder, icon: "notifications-outline" },
  ];

  const shortcuts: (QuickAction & { href?: string })[] = [
    { label: t.addParty, icon: "person-add-outline" },
    { label: t.salesInvoice, icon: "pricetag-outline" },
    { label: t.paymentIn, icon: "arrow-down-circle-outline" },
    { label: t.paymentOut, icon: "arrow-up-circle-outline" },
    { label: t.purchase, icon: "cart-outline" },
    { label: t.addItem, icon: "add-circle-outline" },
    { label: t.expense, icon: "wallet-outline" },
  ];

  const statCards = [
    {
      labelKey: "toReceive" as TranslationKey,
      subKey: "threeParties" as TranslationKey,
      value: "Rs. 12,500",
      tint: "green",
      arrow: "down",
    },
    {
      labelKey: "toGive" as TranslationKey,
      subKey: "twoParties" as TranslationKey,
      value: "Rs. 4,200",
      tint: "red",
      arrow: "up",
    },
    {
      labelKey: "sales" as TranslationKey,
      value: "Rs. 45,000",
      tint: "neutral",
    },
    {
      labelKey: "purchase" as TranslationKey,
      value: "Rs. 18,300",
      tint: "neutral",
    },
    {
      labelKey: "expense" as TranslationKey,
      value: "Rs. 6,800",
      tint: "neutral",
    },
    {
      labelKey: "totalBalance" as TranslationKey,
      subKey: "cashBank" as TranslationKey,
      value: "Rs. 32,500",
      tint: "neutral",
    },
  ];

  const resolvedCards = useMemo(() => {
    return statCards.map((card) => ({
      ...card,
      label: t[card.labelKey],
      sub: card.subKey ? t[card.subKey] : undefined,
    }));
  }, [lang, t]);

  const LanguageSwitcher = () => (
    <View style={styles.langSwitcher}>
      <TouchableOpacity
        style={[
          styles.langOption,
          lang === "english" && styles.langOptionActive,
        ]}
        onPress={() => changeLanguage("english")}
      >
        <Text
          style={[
            styles.langText,
            lang === "english" && styles.langTextActive,
          ]}
        >
          EN
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.langOption,
          lang === "nepali" && styles.langOptionActive,
        ]}
        onPress={() => changeLanguage("nepali")}
      >
        <Text
          style={[
            styles.langText,
            lang === "nepali" && styles.langTextActive,
          ]}
        >
          ने
        </Text>
      </TouchableOpacity>
    </View>
  );

  const headerStyle = useFadeSlide(0);
  const shortcutStyle = useFadeSlide(80);
  const statsStyle = useFadeSlide(160);
  const exploreStyle = useFadeSlide(240);
  const cashflowStyle = useFadeSlide(320);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* ── Top Bar ── */}
      <Animated.View style={[styles.topBar, headerStyle]}>
        <TouchableOpacity
          onPress={() => router.push("/(stores)")}
          activeOpacity={0.75}
          style={styles.shopSelector}
        >
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>SN</Text>
          </View>
          <Text style={styles.shopName}>Shop Name</Text>
          <Ionicons name="chevron-down" size={16} color={theme.foreground} />
        </TouchableOpacity>

        <View style={styles.topBarRight}>
          <TouchableOpacity activeOpacity={0.75} style={styles.creditPill}>
            <Ionicons name="wallet-outline" size={14} color="#92400e" />
            <Text style={styles.creditText}>1,250</Text>
          </TouchableOpacity>
          {/*
          <TouchableOpacity activeOpacity={0.75} style={styles.notifBtn}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.foreground}
            />
          </TouchableOpacity>
            */}
          <LanguageSwitcher />
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
      >
        {/* ── Daily Claim Banner ── */}
        {showBanner && (
          <Animated.View style={[styles.claimBanner, headerStyle]}>
            <Ionicons name="wallet-outline" size={20} color="#92400e" />
            <Text style={styles.claimText}>Claim your daily 5 coins 🔥</Text>
            <TouchableOpacity
              onPress={() => setShowBanner(false)}
              style={styles.claimBtn}
            >
              <Text style={styles.claimBtnText}>Claim Now</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* ── Stat Cards Grid ── */}
        <Animated.View style={[styles.statGrid, statsStyle]}>
          {resolvedCards.map((card, i) => {
            const isGreen = card.tint === "green";
            const isRed = card.tint === "red";
            const isNeutral = card.tint === "neutral";
            return (
              <TouchableOpacity
                key={card.label}
                activeOpacity={0.75}
                style={[
                  styles.statCard,
                  isGreen && styles.statCardGreen,
                  isRed && styles.statCardRed,
                ]}
              >
                <Text
                  style={[
                    styles.statValue,
                    isGreen && { color: theme.success },
                    isRed && { color: theme.primary },
                  ]}
                >
                  {card.value}
                </Text>
                <View style={styles.statLabelRow}>
                  <Text style={styles.statLabel}>{card.label}</Text>
                  {card.arrow && (
                    <Ionicons
                      name={card.arrow === "down" ? "arrow-down" : "arrow-up"}
                      size={13}
                      color={isGreen ? theme.success : theme.primary}
                    />
                  )}
                </View>
                {card.sub && <Text style={styles.statSub}>{card.sub}</Text>}
                <Ionicons
                  name="chevron-forward"
                  size={14}
                  color={
                    isNeutral
                      ? theme.mutedForeground
                      : isGreen
                        ? theme.success
                        : theme.primary
                  }
                  style={{ position: "absolute", top: 14, right: 12 }}
                />
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* ── Explore App / Top Shortcuts ── */}
        <Animated.View style={[styles.section, exploreStyle]}>
          <Text style={styles.sectionTitle}>{t.exploreApp}</Text>
          <View style={styles.topShortcutRow}>
            {topShortcuts.map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.75}
                style={styles.topShortcutCard}
              >
                <View style={styles.topShortcutIconBox}>
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={theme.primary}
                  />
                </View>
                <Text style={styles.topShortcutLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── Profile Completion Banner ── */}
        <Animated.View
          style={[{ paddingHorizontal: Spacing.three }, shortcutStyle]}
        >
          <TouchableOpacity activeOpacity={0.85} style={styles.profileBanner}>
            <View style={styles.profileBannerLeft}>
              <View style={styles.progressRing}>
                <Text style={styles.progressPct}>30%</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileBannerTitle}>
                  Complete your Profile
                </Text>
                <Text style={styles.profileBannerSub}>
                  You can use more app features after completing your business
                  profile.
                </Text>
              </View>
            </View>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </Animated.View>

        {/* ── Shortcuts ── */}
        <Animated.View style={[styles.section, shortcutStyle]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>{t.shortcuts}</Text>
            <TouchableOpacity activeOpacity={0.7} style={styles.editMenuBtn}>
              <Ionicons name="create-outline" size={15} color={theme.primary} />
              <Text style={styles.editMenuText}>{t.editMenu}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.shortcutGrid}>
            {shortcuts.map((item) => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.75}
                style={styles.shortcutItem}
                onPress={() => item.href && openStoreRoute(item.href)}
              >
                <View style={styles.shortcutIconCircle}>
                  <Ionicons
                    name={item.icon as any}
                    size={22}
                    color={theme.primary}
                  />
                </View>
                <Text style={styles.shortcutLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── Cashflow ── */}
        <Animated.View style={[styles.section, cashflowStyle]}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>
                Cashflow{" "}
                <Text style={styles.cashflowSubTitle}>(Last 7 Days)</Text>
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              style={styles.filterPill}
              onPress={() =>
                setCashflowFilter((f) => (f === "Daily" ? "Weekly" : "Daily"))
              }
            >
              <Text style={styles.filterText}>{cashflowFilter}</Text>
              <Ionicons
                name="chevron-down"
                size={13}
                color={theme.foreground}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.chartCard}>
            <CashflowChart t={t} />
          </View>
        </Animated.View>
      </ScrollView>

      {/* ── Bottom Nav ── */}
      <View style={[styles.bottomNav, { paddingBottom: insets.bottom || 12 }]}>
        {navItems.map((item, i) => {
          const active = activeNav === i;
          return (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.7}
              style={styles.navItem}
              onPress={() => setActiveNav(i)}
            >
              <Ionicons
                name={(active ? item.activeIcon : item.icon) as any}
                size={22}
                color={active ? theme.primary : theme.mutedForeground}
              />
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>
                {item.label}
              </Text>
              {active && <View style={styles.navIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.backgroundElement,
  },

  // Top Bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  shopSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  avatarText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "700",
    color: theme.foreground,
  },
  shopName: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: "700",
    color: theme.foreground,
  },
  topBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  creditPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#fef9ec",
    borderWidth: 1.5,
    borderColor: "#fde68a",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  creditText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "700",
    color: "#92400e",
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },

  // Claim Banner
  claimBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: Spacing.three,
    marginTop: Spacing.two + 4,
    backgroundColor: theme.background,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  claimText: {
    fontFamily: Fonts.sans,
    flex: 1,
    fontSize: 13,
    fontWeight: "500",
    color: theme.foreground,
  },
  claimBtn: {
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  claimBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: "700",
    color: theme.primaryForeground,
  },

  // Stat Grid
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: CARD_GAP,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two + 4,
  },
  statCard: {
    width: HALF_CARD,
    backgroundColor: theme.background,
    borderRadius: Radius.xl,
    padding: Spacing.two + 6,
    borderWidth: 1,
    borderColor: theme.border,
    ...Platform.select({
      ios: {
        shadowColor: Ui.shadowColor,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  statCardGreen: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  statCardRed: {
    backgroundColor: "#fff5f5",
    borderColor: "#fecaca",
  },
  statValue: {
    fontFamily: Fonts.sans,
    fontSize: 18,
    fontWeight: "800",
    color: theme.foreground,
    letterSpacing: -0.3,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  statLabel: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: theme.mutedForeground,
    fontWeight: "500",
  },
  statSub: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: theme.mutedForeground,
    marginTop: 2,
  },

  // Section
  section: {
    marginTop: Spacing.three,
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: "700",
    color: theme.foreground,
  },
  cashflowSubTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "400",
    color: theme.mutedForeground,
  },

  // Explore / Top Shortcuts
  topShortcutRow: {
    flexDirection: "row",
    gap: CARD_GAP,
  },
  topShortcutCard: {
    flex: 1,
    backgroundColor: theme.background,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.two + 4,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  topShortcutIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  topShortcutLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: "600",
    color: theme.foreground,
    textAlign: "center",
  },

  // Profile Banner
  profileBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.primary,
    borderRadius: Radius.xl,
    padding: Spacing.three,
    marginTop: Spacing.two + 4,
  },
  profileBannerLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  progressRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  progressPct: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "700",
    color: "#fff",
  },
  profileBannerTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 3,
  },
  profileBannerSub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 17,
  },

  // Shortcuts
  editMenuBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  editMenuText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "600",
    color: theme.primary,
  },
  shortcutGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: theme.background,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: "hidden",
  },
  shortcutItem: {
    width: "25%",
    alignItems: "center",
    paddingVertical: Spacing.three,
    gap: 8,
  },
  shortcutIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  shortcutLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: "600",
    color: theme.foreground,
    textAlign: "center",
  },

  // Cashflow
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: theme.background,
  },
  filterText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "600",
    color: theme.foreground,
  },
  chartCard: {
    backgroundColor: theme.background,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: theme.border,
    paddingTop: Spacing.three,
    ...Platform.select({
      ios: {
        shadowColor: Ui.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
    }),
  },
  chartAxisLabel: {
    fontFamily: Fonts.sans,
    fontSize: 9,
    color: theme.mutedForeground,
    textAlign: "center",
  },
  chartLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: Spacing.two + 4,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    marginTop: Spacing.two,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: theme.mutedForeground,
    fontWeight: "500",
  },
  legendValue: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "700",
  },

  // Bottom Nav
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: Spacing.two,
    ...Platform.select({
      ios: {
        shadowColor: Ui.shadowColor,
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.07,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
    }),
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
    position: "relative",
  },
  navLabel: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: "500",
    color: theme.mutedForeground,
  },
  navLabelActive: {
    fontWeight: "700",
    color: theme.primary,
  },
  navIndicator: {
    position: "absolute",
    bottom: -12,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.primary,
  },
  langSwitcher: {
    flexDirection: "row",
    backgroundColor: theme.backgroundElement,
    borderRadius: 12,
    padding: 2,
    borderWidth: 1,
    borderColor: theme.border,
  },

  langOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },

  langOptionActive: {
    backgroundColor: theme.primary,
  },

  langText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: "700",
    color: theme.mutedForeground,
  },

  langTextActive: {
    color: theme.primaryForeground,
  },
});
