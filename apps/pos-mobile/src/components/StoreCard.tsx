import { Colors, Radius, Spacing, Ui } from "@/constants/theme";
import { Store } from "@/types/stores";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Platform,
  Alert,
  Animated,
} from "react-native";

interface StoreCardProps {
  store: Store;
  onEdit: (store: Store) => void;
  onDelete: (store: Store) => void;
  onManageBranches: (store: Store) => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({
  store,
  onEdit,
  onDelete,
  onManageBranches,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.spring(rotateAnim, {
      toValue,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const chevronRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const mainBranch = store.branches?.find((b) => b.isMain);
  const otherBranches = store.branches?.filter((b) => !b.isMain) ?? [];
  const allBranches = store.branches ?? [];

  const handleMenuAction = (action: () => void) => {
    setShowMenu(false);
    setTimeout(action, 150);
  };

  const initials = store.name
    .split(/\s+/)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: C.card,
          borderColor: C.border,
        },
      ]}
    >
      {/* ── Card Header ─────────────────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={toggleExpand}
        style={styles.header}
      >
        {/* Logo */}
        <View
          style={[
            styles.logo,
            {
              backgroundColor: isDark
                ? C.backgroundElement
                : C.primaryForeground,
            },
          ]}
        >
          <Text style={[styles.logoText, { color: C.primary }]}>
            {initials}
          </Text>
        </View>

        {/* Name + status */}
        <View style={styles.nameBlock}>
          <Text style={[styles.storeName, { color: C.text }]} numberOfLines={1}>
            {store.name}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: store.isActive
                    ? C.success
                    : C.mutedForeground,
                },
              ]}
            />
            <Text style={[styles.statusText, { color: C.mutedForeground }]}>
              {store.isActive ? "Active" : "Inactive"}
            </Text>
            {allBranches.length > 0 && (
              <>
                <View
                  style={[
                    styles.dotSep,
                    { backgroundColor: C.mutedForeground },
                  ]}
                />
                <Text style={[styles.statusText, { color: C.mutedForeground }]}>
                  {allBranches.length} branch
                  {allBranches.length !== 1 ? "es" : ""}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.iconBtn,
              { backgroundColor: isDark ? C.backgroundElement : C.muted },
            ]}
          >
            <MaterialCommunityIcons
              name="dots-horizontal"
              size={18}
              color={C.mutedForeground}
            />
          </TouchableOpacity>
          <Animated.View style={{ transform: [{ rotate: chevronRotation }] }}>
            <TouchableOpacity
              onPress={toggleExpand}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={[
                styles.iconBtn,
                { backgroundColor: isDark ? C.backgroundElement : C.muted },
              ]}
            >
              <MaterialCommunityIcons
                name="chevron-down"
                size={18}
                color={C.mutedForeground}
              />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableOpacity>

      {/* ── Expanded Details ─────────────────────────────────────────── */}
      {isExpanded && (
        <View style={[styles.details, { borderTopColor: C.border }]}>
          {/* Contact info */}
          <View style={styles.infoSection}>
            {store.phone && (
              <View style={styles.infoRow}>
                <View
                  style={[
                    styles.infoIcon,
                    { backgroundColor: isDark ? C.backgroundElement : C.muted },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={13}
                    color={C.primary}
                  />
                </View>
                <Text style={[styles.infoText, { color: C.text }]}>
                  {store.phone}
                </Text>
              </View>
            )}
            {store.address && (
              <View style={styles.infoRow}>
                <View
                  style={[
                    styles.infoIcon,
                    { backgroundColor: isDark ? C.backgroundElement : C.muted },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="map-marker-outline"
                    size={13}
                    color={C.primary}
                  />
                </View>
                <Text
                  style={[styles.infoText, { color: C.text }]}
                  numberOfLines={2}
                >
                  {store.address}
                </Text>
              </View>
            )}
            {store.taxType !== "none" && store.taxNumber && (
              <View style={styles.infoRow}>
                <View
                  style={[
                    styles.infoIcon,
                    { backgroundColor: isDark ? C.backgroundElement : C.muted },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="receipt"
                    size={13}
                    color={C.primary}
                  />
                </View>
                <Text style={[styles.infoText, { color: C.text }]}>
                  {store.taxType.toUpperCase()}: {store.taxNumber}
                </Text>
              </View>
            )}
          </View>

          {/* Categories */}
          {store.categories && store.categories.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: C.mutedForeground }]}>
                Categories
              </Text>
              <View style={styles.chips}>
                {store.categories.map((sc, idx) => (
                  <View
                    key={idx}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: isDark ? C.backgroundElement : C.muted,
                        borderColor: C.border,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={(sc.category.icon as any) ?? "tag-outline"}
                      size={11}
                      color={C.primary}
                    />
                    <Text style={[styles.chipText, { color: C.text }]}>
                      {sc.category.name}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Branches – tree layout */}
          {allBranches.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionRow}>
                <Text
                  style={[styles.sectionLabel, { color: C.mutedForeground }]}
                >
                  Branches
                </Text>
                <TouchableOpacity
                  onPress={() => onManageBranches(store)}
                  style={styles.manageBtn}
                >
                  <Text style={[styles.manageBtnText, { color: C.primary }]}>
                    Manage
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={13}
                    color={C.primary}
                  />
                </TouchableOpacity>
              </View>

              {/* Tree container */}
              <View style={styles.tree}>
                {/* Root node: store */}
                <View style={styles.treeRoot}>
                  <View
                    style={[
                      styles.treeRootIcon,
                      {
                        backgroundColor: isDark ? C.backgroundElement : C.muted,
                        borderColor: C.border,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="store-outline"
                      size={14}
                      color={C.primary}
                    />
                  </View>
                  <Text
                    style={[styles.treeRootLabel, { color: C.text }]}
                    numberOfLines={1}
                  >
                    {store.name}
                  </Text>
                </View>

                {/* Branch items */}
                {(mainBranch ? [mainBranch, ...otherBranches] : otherBranches)
                  .slice(0, 3)
                  .map((branch, idx, arr) => {
                    const isLast =
                      idx === arr.length - 1 && otherBranches.length <= 2;
                    return (
                      <View key={branch.id} style={styles.treeRow}>
                        {/* Connector lines */}
                        <View style={styles.treeConnector}>
                          <View
                            style={[
                              styles.treeLineV,
                              { backgroundColor: C.border },
                              isLast && styles.treeLineVLast,
                            ]}
                          />
                          <View
                            style={[
                              styles.treeLineH,
                              { backgroundColor: C.border },
                            ]}
                          />
                        </View>

                        {/* Branch node */}
                        <View
                          style={[
                            styles.branchNode,
                            {
                              backgroundColor: isDark
                                ? C.backgroundElement
                                : C.muted,
                              borderColor: C.border,
                            },
                          ]}
                        >
                          <View style={styles.branchNodeLeft}>
                            <View
                              style={[
                                styles.branchNodeIcon,
                                {
                                  backgroundColor: branch.isMain
                                    ? isDark
                                      ? "rgba(153,27,27,0.25)"
                                      : C.primaryForeground
                                    : isDark
                                      ? C.card
                                      : C.background,
                                  borderColor: branch.isMain
                                    ? C.primary
                                    : C.border,
                                },
                              ]}
                            >
                              <MaterialCommunityIcons
                                name={branch.isMain ? "star" : "source-branch"}
                                size={12}
                                color={
                                  branch.isMain ? C.primary : C.mutedForeground
                                }
                              />
                            </View>
                            <View style={styles.branchNodeText}>
                              <Text
                                style={[styles.branchName, { color: C.text }]}
                                numberOfLines={1}
                              >
                                {branch.name}
                              </Text>
                              {branch.address && (
                                <Text
                                  style={[
                                    styles.branchAddr,
                                    { color: C.mutedForeground },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {branch.address}
                                </Text>
                              )}
                            </View>
                          </View>
                          {branch.isMain && (
                            <View
                              style={[
                                styles.mainBadge,
                                { backgroundColor: C.primary },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.mainBadgeText,
                                  { color: C.primaryForeground },
                                ]}
                              >
                                Main
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })}

                {otherBranches.length > 2 && (
                  <TouchableOpacity
                    onPress={() => onManageBranches(store)}
                    style={styles.moreBranchesRow}
                  >
                    <View style={styles.treeConnector}>
                      <View
                        style={[
                          styles.treeLineVShort,
                          { backgroundColor: C.border },
                        ]}
                      />
                      <View
                        style={[
                          styles.treeLineH,
                          { backgroundColor: C.border },
                        ]}
                      />
                    </View>
                    <View
                      style={[
                        styles.moreBranchesNode,
                        {
                          borderColor: C.border,
                          backgroundColor: isDark
                            ? C.backgroundElement
                            : C.muted,
                        },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name="dots-horizontal"
                        size={14}
                        color={C.primary}
                      />
                      <Text
                        style={[styles.moreBranchesText, { color: C.primary }]}
                      >
                        +{otherBranches.length - 2} more
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </View>
      )}

      {/* ── Context Menu ─────────────────────────────────────────────── */}
      {showMenu && (
        <TouchableOpacity
          style={StyleSheet.absoluteFillObject}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View
            style={[
              styles.menu,
              { backgroundColor: C.popover, borderColor: C.border },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuAction(() => onEdit(store))}
            >
              <MaterialCommunityIcons
                name="pencil-outline"
                size={16}
                color={C.text}
              />
              <Text style={[styles.menuItemText, { color: C.text }]}>
                Edit Store
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleMenuAction(() => onManageBranches(store))}
            >
              <MaterialCommunityIcons
                name="source-branch"
                size={16}
                color={C.text}
              />
              <Text style={[styles.menuItemText, { color: C.text }]}>
                Manage Branches
              </Text>
            </TouchableOpacity>

            <View style={[styles.menuDivider, { backgroundColor: C.border }]} />

            <TouchableOpacity
              style={[
                styles.menuItem,
                { backgroundColor: C.destructiveSubtle },
              ]}
              onPress={() => handleMenuAction(() => onDelete(store))}
            >
              <MaterialCommunityIcons
                name="trash-can-outline"
                size={16}
                color={C.destructive}
              />
              <Text style={[styles.menuItemText, { color: C.destructive }]}>
                Delete Store
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: Ui.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
    }),
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.three,
    gap: Spacing.two,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 17,
    fontWeight: "700",
  },
  nameBlock: {
    flex: 1,
    gap: 4,
  },
  storeName: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
  },
  dotSep: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    opacity: 0.4,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.one,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  // Details
  details: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    gap: Spacing.three,
  },
  infoSection: {
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // Section
  section: {
    gap: Spacing.two,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  manageBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  manageBtnText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Chips
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.one,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.two,
    paddingVertical: 5,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "500",
  },

  // Tree
  tree: {
    gap: 0,
  },
  treeRoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingBottom: 4,
  },
  treeRootIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  treeRootLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  treeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  treeConnector: {
    width: 28,
    height: 44,
    alignItems: "center",
    position: "relative",
  },
  treeLineV: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },
  treeLineVLast: {
    bottom: "50%",
  },
  treeLineVShort: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: "50%",
    width: StyleSheet.hairlineWidth,
  },
  treeLineH: {
    position: "absolute",
    left: "50%",
    top: "50%",
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  branchNode: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: Spacing.one,
  },
  branchNodeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    flex: 1,
  },
  branchNodeIcon: {
    width: 26,
    height: 26,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  branchNodeText: {
    flex: 1,
    gap: 2,
  },
  branchName: {
    fontSize: 13,
    fontWeight: "600",
  },
  branchAddr: {
    fontSize: 11,
  },
  mainBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: Radius.sm,
  },
  mainBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  moreBranchesRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  moreBranchesNode: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed",
  },
  moreBranchesText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Menu
  menu: {
    position: "absolute",
    top: 52,
    right: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.one,
    minWidth: 190,
    zIndex: 999,
    ...Platform.select({
      ios: {
        shadowColor: Ui.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: { elevation: 8 },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: 11,
    borderRadius: Radius.md,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.one,
  },
});
