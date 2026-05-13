import { Colors, Radius, Spacing, Ui } from "@/constants/theme";
import { Branch, Store } from "@/types/stores";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  useColorScheme,
  Platform,
  Alert,
} from "react-native";

interface BranchesModalProps {
  visible: boolean;
  store: Store | null;
  onClose: () => void;
  onAddBranch: (storeId: string) => void;
  onEditBranch: (branch: Branch) => void;
  onDeleteBranch: (branch: Branch) => void;
}

export const BranchesModal: React.FC<BranchesModalProps> = ({
  visible,
  store,
  onClose,
  onAddBranch,
  onEditBranch,
  onDeleteBranch,
}) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;

  const branches = store?.branches ?? [];
  const mainBranch = branches.find((b) => b.isMain);
  const otherBranches = branches.filter((b) => !b.isMain);
  const orderedBranches = mainBranch
    ? [mainBranch, ...otherBranches]
    : otherBranches;

  const confirmDelete = (branch: Branch) => {
    Alert.alert(
      "Delete Branch",
      `Remove "${branch.name}" from ${store?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDeleteBranch(branch),
        },
      ],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: C.card }]}>
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: C.border }]} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.sheetHeaderLeft}>
              <View
                style={[
                  styles.sheetIcon,
                  {
                    backgroundColor: isDark
                      ? C.backgroundElement
                      : C.primaryForeground,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="source-branch"
                  size={18}
                  color={C.primary}
                />
              </View>
              <View>
                <Text style={[styles.sheetTitle, { color: C.text }]}>
                  Branches
                </Text>
                <Text
                  style={[styles.sheetSubtitle, { color: C.mutedForeground }]}
                >
                  {store?.name} · {branches.length} total
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                { backgroundColor: isDark ? C.backgroundElement : C.muted },
              ]}
            >
              <MaterialCommunityIcons
                name="close"
                size={16}
                color={C.mutedForeground}
              />
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: C.border }]} />

          {/* Branch list */}
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {orderedBranches.length === 0 ? (
              <View style={styles.empty}>
                <View
                  style={[
                    styles.emptyIcon,
                    { backgroundColor: isDark ? C.backgroundElement : C.muted },
                  ]}
                >
                  <MaterialCommunityIcons
                    name="store-off-outline"
                    size={32}
                    color={C.mutedForeground}
                  />
                </View>
                <Text style={[styles.emptyTitle, { color: C.text }]}>
                  No branches yet
                </Text>
                <Text style={[styles.emptyBody, { color: C.mutedForeground }]}>
                  Add your first branch to get started
                </Text>
              </View>
            ) : (
              /* Tree layout */
              <View style={styles.tree}>
                {/* Root node */}
                <View style={styles.treeRoot}>
                  <View
                    style={[
                      styles.rootIconBox,
                      {
                        backgroundColor: isDark ? C.backgroundElement : C.muted,
                        borderColor: C.border,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="store-outline"
                      size={16}
                      color={C.primary}
                    />
                  </View>
                  <View>
                    <Text style={[styles.rootLabel, { color: C.text }]}>
                      {store?.name}
                    </Text>
                    <Text
                      style={[
                        styles.rootSublabel,
                        { color: C.mutedForeground },
                      ]}
                    >
                      {branches.length} branch
                      {branches.length !== 1 ? "es" : ""}
                    </Text>
                  </View>
                </View>

                {/* Branch rows */}
                {orderedBranches.map((branch, idx) => {
                  const isLast = idx === orderedBranches.length - 1;
                  return (
                    <View key={branch.id} style={styles.treeRow}>
                      {/* Connector */}
                      <View style={styles.connectorBox}>
                        <View
                          style={[
                            styles.lineV,
                            { backgroundColor: C.border },
                            isLast && styles.lineVLast,
                          ]}
                        />
                        <View
                          style={[styles.lineH, { backgroundColor: C.border }]}
                        />
                      </View>

                      {/* Branch card */}
                      <View
                        style={[
                          styles.branchCard,
                          {
                            backgroundColor: isDark
                              ? C.backgroundElement
                              : C.background,
                            borderColor: branch.isMain ? C.primary : C.border,
                          },
                          branch.isMain && { borderLeftWidth: 2 },
                        ]}
                      >
                        <View style={styles.branchCardInner}>
                          {/* Icon */}
                          <View
                            style={[
                              styles.branchIcon,
                              {
                                backgroundColor: branch.isMain
                                  ? isDark
                                    ? "rgba(153,27,27,0.25)"
                                    : C.primaryForeground
                                  : isDark
                                    ? C.card
                                    : C.muted,
                                borderColor: branch.isMain
                                  ? C.primary
                                  : C.border,
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={branch.isMain ? "star" : "source-branch"}
                              size={13}
                              color={
                                branch.isMain ? C.primary : C.mutedForeground
                              }
                            />
                          </View>

                          {/* Info */}
                          <View style={styles.branchInfo}>
                            <View style={styles.branchNameRow}>
                              <Text
                                style={[styles.branchName, { color: C.text }]}
                                numberOfLines={1}
                              >
                                {branch.name}
                              </Text>
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
                            {branch.phone && (
                              <View style={styles.metaRow}>
                                <MaterialCommunityIcons
                                  name="phone-outline"
                                  size={11}
                                  color={C.mutedForeground}
                                />
                                <Text
                                  style={[
                                    styles.metaText,
                                    { color: C.mutedForeground },
                                  ]}
                                >
                                  {branch.phone}
                                </Text>
                              </View>
                            )}
                            {branch.address && (
                              <View style={styles.metaRow}>
                                <MaterialCommunityIcons
                                  name="map-marker-outline"
                                  size={11}
                                  color={C.mutedForeground}
                                />
                                <Text
                                  style={[
                                    styles.metaText,
                                    { color: C.mutedForeground },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {branch.address}
                                </Text>
                              </View>
                            )}
                          </View>
                        </View>

                        {/* Actions */}
                        <View style={styles.branchCardActions}>
                          <TouchableOpacity
                            onPress={() => onEditBranch(branch)}
                            style={[
                              styles.branchActionBtn,
                              { backgroundColor: isDark ? C.card : C.muted },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name="pencil-outline"
                              size={14}
                              color={C.primary}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => confirmDelete(branch)}
                            style={[
                              styles.branchActionBtn,
                              {
                                backgroundColor: isDark
                                  ? "rgba(239,68,68,0.12)"
                                  : "rgba(220,38,38,0.06)",
                              },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name="trash-can-outline"
                              size={14}
                              color={C.destructive}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </ScrollView>

          {/* Add button */}
          <View style={[styles.footer, { borderTopColor: C.border }]}>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: C.primary }]}
              onPress={() => store && onAddBranch(store.id)}
              activeOpacity={0.85}
            >
              <MaterialCommunityIcons
                name="plus"
                size={18}
                color={C.primaryForeground}
              />
              <Text style={[styles.addBtnText, { color: C.primaryForeground }]}>
                Add Branch
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },

  // Header
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  sheetHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  sheetIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  sheetSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginTop: Spacing.two,
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.four,
    paddingTop: Spacing.three,
  },

  // Empty
  empty: {
    alignItems: "center",
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyBody: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },

  // Tree
  tree: {},
  treeRoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  rootIconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  rootLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  rootSublabel: {
    fontSize: 12,
    marginTop: 1,
  },
  treeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  connectorBox: {
    width: 36,
    height: 52,
    position: "relative",
  },
  lineV: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },
  lineVLast: {
    bottom: "50%",
  },
  lineH: {
    position: "absolute",
    left: "50%",
    top: "50%",
    right: 0,
    height: StyleSheet.hairlineWidth,
  },

  // Branch card
  branchCard: {
    flex: 1,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  branchCardInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    flex: 1,
  },
  branchIcon: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  branchInfo: {
    flex: 1,
    gap: 2,
  },
  branchNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  branchName: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  mainBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  mainBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    flex: 1,
  },
  branchCardActions: {
    flexDirection: "row",
    gap: Spacing.one,
  },
  branchActionBtn: {
    width: 30,
    height: 30,
    borderRadius: Radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },

  // Footer
  footer: {
    padding: Spacing.four,
    paddingBottom: Platform.OS === "ios" ? Spacing.five : Spacing.four,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  addBtn: {
    height: 50,
    borderRadius: Radius.lg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    ...Platform.select({
      ios: {
        shadowColor: "#dc2626",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
