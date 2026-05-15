import { Colors, Radius, Spacing } from "@/constants/theme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  StatusBar,
  Platform,
  FlatList,
  SafeAreaView,
  Alert,
  Animated,
  ListRenderItemInfo,
} from "react-native";
import { StoreCard } from "@/components/StoreCard";
import { StoreSkeleton } from "@/components/StoreSkeleton";
import { BranchesModal } from "@/components/BranchesModal";
import { useGetStores } from "@/client/store";
import { Branch, Store } from "@/types/stores";
import { useGetSession } from "@/client/session";

const FEATURES = [
  {
    icon: "cash-register" as const,
    label: "Sales & Billing",
    hint: "Fast checkout with receipt printing",
  },
  {
    icon: "package-variant-closed" as const,
    label: "Inventory",
    hint: "Track stock across products",
  },
  {
    icon: "chart-line" as const,
    label: "Reports",
    hint: "Daily sales and P&L overview",
  },
  {
    icon: "account-multiple-outline" as const,
    label: "Parties & Ledger",
    hint: "Credit tracking with reminders",
  },
] as const;

type ListItem =
  | { type: "header"; key: string }
  | { type: "store"; key: string; store: Store }
  | { type: "empty"; key: string }
  | { type: "footer"; key: string };

interface HeaderProps {
  userName: string;
  storeCount: number;
  C: (typeof Colors)[keyof typeof Colors];
  s: ReturnType<typeof makeStyles>;
}

const ListHeader = React.memo<HeaderProps>(({ userName, storeCount, C, s }) => (
  <View style={s.storesHeader}>
    <Text style={s.storesCount}>
      {storeCount} Store{storeCount !== 1 ? "s" : ""}
    </Text>
    <TouchableOpacity
      onPress={() => router.push("/(stores)/create")}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Text style={s.addStoreLink}>+ Add Store</Text>
    </TouchableOpacity>
  </View>
));

interface FeatureCardProps {
  item: (typeof FEATURES)[number];
  C: (typeof Colors)[keyof typeof Colors];
  s: ReturnType<typeof makeStyles>;
  isDark: boolean;
}

const FeatureCard = React.memo<FeatureCardProps>(({ item, C, s, isDark }) => (
  <View style={s.featureCard}>
    <View style={s.featureIconBox}>
      <MaterialCommunityIcons name={item.icon} size={24} color={C.primary} />
    </View>
    <View style={s.featureContent}>
      <Text style={s.featureLabel}>{item.label}</Text>
      <Text style={s.featureHint}>{item.hint}</Text>
    </View>
  </View>
));

interface EmptyStateProps {
  C: (typeof Colors)[keyof typeof Colors];
  s: ReturnType<typeof makeStyles>;
  isDark: boolean;
}

const EmptyState = React.memo<EmptyStateProps>(({ C, s, isDark }) => (
  <View>
    <View style={s.emptyState}>
      <View style={s.emptyIconContainer}>
        <MaterialCommunityIcons name="store-off" size={64} color={C.primary} />
      </View>
      <Text style={s.emptyTitle}>No stores yet</Text>
      <Text style={s.emptyBody}>
        Create your first store to start managing{"\n"}
        sales, inventory, and customers
      </Text>
    </View>

    <View style={s.featuresSection}>
      <Text style={s.sectionTitle}>Everything you need</Text>
      <Text style={s.sectionSubtitle}>
        One app to manage your entire business
      </Text>
      <View style={s.featureGrid}>
        {FEATURES.map((feat) => (
          <FeatureCard
            key={feat.label}
            item={feat}
            C={C}
            s={s}
            isDark={isDark}
          />
        ))}
      </View>
    </View>
  </View>
));

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function StoresScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const s = useMemo(() => makeStyles(C, isDark), [C, isDark]);
  const { data: session } = useGetSession();

  const { data: stores, isLoading, isFetching, refetch } = useGetStores();

  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [showBranchesModal, setShowBranchesModal] = useState(false);

  // Subtle scroll-linked header shadow
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerShadowOpacity = scrollY.interpolate({
    inputRange: [0, 24],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const handleOpenStore = useCallback((store: Store) => {
    router.push({
      pathname: "/(stores)/[id]",
      params: { id: store.id },
    });
  }, []);

  const handleEditStore = useCallback((store: Store) => {
    router.push({ pathname: "/(stores)/edit/[id]", params: { id: store.id } });
  }, []);

  const handleDeleteStore = useCallback(
    (store: Store) => {
      Alert.alert(
        "Delete Store",
        `Are you sure you want to delete "${store.name}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              // TODO: call delete API
              console.log("Delete store:", store.id);
              refetch();
            },
          },
        ],
      );
    },
    [refetch],
  );

  const handleManageBranches = useCallback((store: Store) => {
    setSelectedStore(store);
    setShowBranchesModal(true);
  }, []);

  const handleAddBranch = useCallback((storeId: string) => {
    setShowBranchesModal(false);
    router.push({ pathname: "/(stores)/branches/create", params: { storeId } });
  }, []);

  const handleEditBranch = useCallback(
    (branch: Branch) => {
      if (!selectedStore) return;
      setShowBranchesModal(false);
      router.push({
        pathname: "/(stores)/branches/edit/[id]",
        params: { id: branch.id, storeId: selectedStore.id },
      });
    },
    [selectedStore],
  );

  const handleDeleteBranch = useCallback((branch: Branch) => {
    Alert.alert(
      "Delete Branch",
      `Are you sure you want to delete "${branch.name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: call delete branch API
            console.log("Delete branch:", branch.id);
          },
        },
      ],
    );
  }, []);

  // ─── FlatList data ───────────────────────────────────────────────────────────

  const listData = useMemo<ListItem[]>(() => {
    if (!stores || stores.length === 0) {
      return [{ type: "empty", key: "empty-state" }];
    }
    return [
      { type: "header", key: "stores-header" },
      ...stores.map((store) => ({
        type: "store" as const,
        key: store.id,
        store,
      })),
      { type: "footer", key: "list-footer" },
    ];
  }, [stores]);

  // ─── Render item ─────────────────────────────────────────────────────────────

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ListItem>) => {
      switch (item.type) {
        case "header":
          return (
            <ListHeader
              userName=""
              storeCount={stores?.length ?? 0}
              C={C}
              s={s}
            />
          );
        case "store":
          return (
            <View style={s.storeItemWrapper}>
              <StoreCard
                store={item.store}
                onPress={handleOpenStore}
                onEdit={handleEditStore}
                onDelete={handleDeleteStore}
                onManageBranches={handleManageBranches}
              />
            </View>
          );
        case "empty":
          return <EmptyState C={C} s={s} isDark={isDark} />;
        case "footer":
          return <View style={s.listFooter} />;
        default:
          return null;
      }
    },
    [
      stores,
      C,
      s,
      isDark,
      handleOpenStore,
      handleEditStore,
      handleDeleteStore,
      handleManageBranches,
    ],
  );

  const keyExtractor = useCallback((item: ListItem) => item.key, []);

  // ─── User avatar initials ────────────────────────────────────────────────────

  const avatarText = useMemo(() => {
    return (
      session?.user.name
        ?.split(/\s+/)
        .filter((w: string) => w.length > 0)
        .map((word: string) => word[0]!.toUpperCase())
        .join("")
        .slice(0, 2) ?? "G"
    );
  }, [session]);

  const firstName = useMemo(
    () => session?.user.name?.split(/\s+/)[0] || "Guest",
    [session],
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={C.background}
      />

      <View style={s.container}>
        {/* Header */}
        <Animated.View
          style={[
            s.header,
            {
              shadowOpacity: headerShadowOpacity,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 8,
              elevation: isFetching && !isLoading ? 3 : 0,
            },
          ]}
        >
          <View style={s.headerLeft}>
            <Text style={s.title} numberOfLines={1}>
              Your Stores
            </Text>
          </View>

          <TouchableOpacity style={s.avatar} activeOpacity={0.8}>
            <Text style={s.avatarText}>{avatarText}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Fetching indicator strip */}
        {isFetching && !isLoading && (
          <View style={[s.fetchingBar, { backgroundColor: C.primary }]} />
        )}

        {/* Content */}
        {isLoading ? (
          <View style={s.skeletonWrapper}>
            <StoreSkeleton count={3} />
          </View>
        ) : (
          <FlatList<ListItem>
            data={listData}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollY } } }],
              { useNativeDriver: false },
            )}
            scrollEventThrottle={16}
            contentContainerStyle={s.listContent}
            removeClippedSubviews={Platform.OS === "android"}
            maxToRenderPerBatch={8}
            windowSize={10}
            initialNumToRender={5}
          />
        )}

        {(!stores || stores.length === 0) && !isLoading && (
          <View style={s.footer}>
            <TouchableOpacity
              style={s.btn}
              onPress={() => router.push("/(stores)/create")}
              activeOpacity={0.88}
            >
              <MaterialCommunityIcons
                name="plus-circle"
                size={22}
                color="#fff"
              />
              <Text style={s.btnText}>Create Store</Text>
            </TouchableOpacity>
            <Text style={s.footerNote}>
              You can add more stores later from settings
            </Text>
          </View>
        )}
      </View>

      <BranchesModal
        visible={showBranchesModal}
        store={selectedStore}
        onClose={() => setShowBranchesModal(false)}
        onAddBranch={handleAddBranch}
        onEditBranch={handleEditBranch}
        onDeleteBranch={handleDeleteBranch}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (C: (typeof Colors)[keyof typeof Colors], isDark: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.background,
    },
    container: {
      flex: 1,
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.two,
      paddingBottom: Spacing.three,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.border,
      backgroundColor: C.background,
      zIndex: 10,
    },
    headerLeft: {
      flex: 1,
    },
    greeting: {
      fontSize: 13,
      color: C.mutedForeground,
      marginBottom: 2,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: C.text,
      letterSpacing: -0.5,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: C.primary,
      alignItems: "center",
      justifyContent: "center",
      ...Platform.select({
        ios: {
          shadowColor: C.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
        },
        android: { elevation: 4 },
      }),
    },
    avatarText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
    },

    // ── Fetching strip ──────────────────────────────────────────────────────
    fetchingBar: {
      height: 2,
      width: "40%",
      alignSelf: "center",
      borderRadius: 1,
      opacity: 0.6,
      marginBottom: 2,
    },

    // ── List ────────────────────────────────────────────────────────────────
    skeletonWrapper: {
      paddingTop: Spacing.three,
    },
    listContent: {
      flexGrow: 1,
      paddingBottom: Spacing.six,
    },
    listFooter: {
      height: Spacing.four,
    },

    // ── Stores header row ───────────────────────────────────────────────────
    storesHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      paddingBottom: Spacing.two,
    },
    storesCount: {
      fontSize: 13,
      color: C.mutedForeground,
      fontWeight: "600",
      textTransform: "uppercase",
      letterSpacing: 0.4,
    },
    addStoreLink: {
      fontSize: 14,
      color: C.primary,
      fontWeight: "600",
    },

    // ── Store item wrapper ──────────────────────────────────────────────────
    storeItemWrapper: {
      paddingHorizontal: Spacing.four,
      paddingBottom: Spacing.three,
    },

    // ── Empty state ─────────────────────────────────────────────────────────
    emptyState: {
      alignItems: "center",
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "rgba(220,38,38,0.05)",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: Spacing.four,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: C.text,
      marginBottom: Spacing.two,
    },
    emptyBody: {
      fontSize: 14,
      lineHeight: 22,
      color: C.mutedForeground,
      textAlign: "center",
    },

    // ── Features section ────────────────────────────────────────────────────
    featuresSection: {
      paddingHorizontal: Spacing.four,
      marginTop: Spacing.four,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: C.text,
      marginBottom: Spacing.one,
      textAlign: "center",
    },
    sectionSubtitle: {
      fontSize: 13,
      color: C.mutedForeground,
      textAlign: "center",
      marginBottom: Spacing.four,
    },
    featureGrid: {
      gap: Spacing.three,
    },
    featureCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
      borderRadius: Radius.lg,
      padding: Spacing.three,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: C.border,
    },
    featureIconBox: {
      width: 48,
      height: 48,
      borderRadius: Radius.md,
      backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "rgba(220,38,38,0.06)",
      alignItems: "center",
      justifyContent: "center",
      marginRight: Spacing.three,
    },
    featureContent: {
      flex: 1,
    },
    featureLabel: {
      fontSize: 15,
      fontWeight: "600",
      color: C.text,
      marginBottom: 2,
    },
    featureHint: {
      fontSize: 13,
      color: C.mutedForeground,
      lineHeight: 18,
    },

    // ── CTA Footer ──────────────────────────────────────────────────────────
    footer: {
      paddingHorizontal: Spacing.four,
      paddingTop: Spacing.three,
      paddingBottom: Platform.OS === "ios" ? Spacing.five : Spacing.four,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: C.border,
      backgroundColor: C.background,
    },
    btn: {
      height: 52,
      borderRadius: Radius.lg,
      backgroundColor: C.primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.two,
      ...Platform.select({
        ios: {
          shadowColor: C.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        android: { elevation: 5 },
      }),
    },
    btnText: {
      fontSize: 16,
      fontWeight: "700",
      color: "#fff",
      letterSpacing: 0.3,
    },
    footerNote: {
      fontSize: 12,
      color: C.mutedForeground,
      textAlign: "center",
      marginTop: Spacing.two,
    },
  });
