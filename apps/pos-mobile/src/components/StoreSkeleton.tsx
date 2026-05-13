import { Colors, Radius, Spacing } from "@/constants/theme";
import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  Platform,
  Animated,
} from "react-native";

interface StoreSkeletonProps {
  count?: number;
}

const SHIMMER_OPACITY_START = 0.4;
const SHIMMER_OPACITY_END = 0.9;

function useShimmer() {
  const anim = useRef(new Animated.Value(SHIMMER_OPACITY_START)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: SHIMMER_OPACITY_END,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: SHIMMER_OPACITY_START,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [anim]);
  return anim;
}

export const StoreSkeleton: React.FC<StoreSkeletonProps> = ({ count = 3 }) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const shimmer = useShimmer();

  const bone = {
    backgroundColor: isDark ? C.backgroundElement : C.muted,
  };

  const SkeletonBox = ({ style }: { style: object | object[] }) => (
    <Animated.View style={[bone, { opacity: shimmer }, style]} />
  );

  const SkeletonCard = ({ delay }: { delay: number }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: C.card,
          borderColor: C.border,
        },
      ]}
    >
      {/* Header row */}
      <View style={styles.header}>
        <SkeletonBox style={styles.logo} />
        <View style={styles.nameBlock}>
          <SkeletonBox style={styles.titleLine} />
          <SkeletonBox style={styles.statusLine} />
        </View>
        <View style={styles.headerActions}>
          <SkeletonBox style={styles.iconCircle} />
          <SkeletonBox style={styles.iconCircle} />
        </View>
      </View>

      {/* Divider */}
      <View style={[styles.divider, { backgroundColor: C.border }]} />

      {/* Info rows */}
      <View style={styles.details}>
        <View style={styles.infoRow}>
          <SkeletonBox style={styles.infoIcon} />
          <SkeletonBox style={styles.infoLine} />
        </View>
        <View style={styles.infoRow}>
          <SkeletonBox style={styles.infoIcon} />
          <SkeletonBox style={[styles.infoLine, { width: "60%" }]} />
        </View>

        {/* Category chips */}
        <View style={styles.chips}>
          <SkeletonBox style={styles.chip} />
          <SkeletonBox style={[styles.chip, { width: 72 }]} />
        </View>

        {/* Tree skeleton */}
        <View style={styles.tree}>
          {/* Root */}
          <View style={styles.treeRoot}>
            <SkeletonBox style={styles.treeRootIcon} />
            <SkeletonBox style={styles.treeRootLabel} />
          </View>
          {/* Branches */}
          {[0, 1].map((i) => (
            <View key={i} style={styles.treeRow}>
              <View style={styles.connectorBox}>
                <View style={[styles.lineV, { backgroundColor: C.border }]} />
                <View style={[styles.lineH, { backgroundColor: C.border }]} />
              </View>
              <SkeletonBox style={styles.branchNode} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} delay={i * 120} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
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
  },
  nameBlock: {
    flex: 1,
    gap: 8,
  },
  titleLine: {
    height: 16,
    width: "55%",
    borderRadius: Radius.sm,
  },
  statusLine: {
    height: 12,
    width: "30%",
    borderRadius: Radius.sm,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.one,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
  },

  // Details
  details: {
    padding: Spacing.three,
    gap: Spacing.two,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  infoIcon: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
  },
  infoLine: {
    flex: 1,
    height: 13,
    borderRadius: Radius.sm,
    width: "75%",
  },

  // Chips
  chips: {
    flexDirection: "row",
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
  chip: {
    height: 24,
    width: 88,
    borderRadius: Radius.sm,
  },

  // Tree
  tree: {
    marginTop: Spacing.two,
  },
  treeRoot: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  treeRootIcon: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
  },
  treeRootLabel: {
    height: 14,
    width: 100,
    borderRadius: Radius.sm,
  },
  treeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  connectorBox: {
    width: 28,
    height: 44,
    position: "relative",
  },
  lineV: {
    position: "absolute",
    left: "50%",
    top: 0,
    bottom: 0,
    width: StyleSheet.hairlineWidth,
  },
  lineH: {
    position: "absolute",
    left: "50%",
    top: "50%",
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  branchNode: {
    flex: 1,
    height: 44,
    borderRadius: Radius.md,
  },
});
