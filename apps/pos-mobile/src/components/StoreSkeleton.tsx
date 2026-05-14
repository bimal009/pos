import { Colors, Radius, Spacing } from "@/constants/theme";
import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  useColorScheme,
  Platform,
  Animated,
} from "react-native";

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

interface StoreSkeletonProps {
  count?: number;
}

export const StoreSkeleton: React.FC<StoreSkeletonProps> = ({ count = 3 }) => {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const C = isDark ? Colors.dark : Colors.light;
  const shimmer = useShimmer();

  const bone = { backgroundColor: isDark ? C.backgroundElement : C.muted };

  const SkeletonBox = ({ style }: { style: object | object[] }) => (
    <Animated.View style={[bone, { opacity: shimmer }, style]} />
  );

  const SkeletonCard = () => (
    <View
      style={[styles.card, { backgroundColor: C.card, borderColor: C.border }]}
    >
      {/* Header */}
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

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.infoRow}>
          <SkeletonBox style={styles.infoIcon} />
          <SkeletonBox style={styles.infoLine} />
        </View>
        <View style={styles.infoRow}>
          <SkeletonBox style={styles.infoIcon} />
          <SkeletonBox style={[styles.infoLine, { width: "60%" }]} />
        </View>
        <View style={styles.chips}>
          <SkeletonBox style={styles.chip} />
          <SkeletonBox style={[styles.chip, { width: 72 }]} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
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
  divider: {
    height: StyleSheet.hairlineWidth,
  },
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
});
