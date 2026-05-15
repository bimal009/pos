import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Animated,
  TextInput,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Spacing, Ui } from "@/constants/theme";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import ImageUpload from "@/components/ImageUpload";

const theme = Colors.light;
const { width } = Dimensions.get("window");
const HALF = (width - Spacing.three * 2 - 10) / 2;

// ─── Types ────────────────────────────────────────────────────────────────────
type Unit = "pcs" | "kg" | "g" | "l" | "ml" | "box" | "dozen";
type Category = "Food" | "Beverage" | "Electronics" | "Clothing" | "Other";

interface Variant {
  id: string;
  name: string; // e.g. "Red / L"
  sku: string;
  purchasePrice: string;
  sellingPrice: string;
  stock: string;
}

interface ProductFormValues {
  name: string;
  description: string;
  category: Category | "";
  unit: Unit;
  purchasePrice: string;
  sellingPrice: string;
  stock: string;
  lowStockAlert: string;
  barcode: string;
  taxRate: string;
  trackInventory: boolean;
  hasVariants: boolean;
}

const UNITS: Unit[] = ["pcs", "kg", "g", "l", "ml", "box", "dozen"];
const CATEGORIES: Category[] = [
  "Food",
  "Beverage",
  "Electronics",
  "Clothing",
  "Other",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function useFadeSlide(delay = 0) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 340,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 340,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY }] };
}

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionCard({
  title,
  icon,
  children,
  style,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  style?: object;
}) {
  return (
    <View style={[styles.sectionCard, style]}>
      <View style={styles.sectionCardHeader}>
        <View style={styles.sectionIconBox}>
          <Ionicons name={icon as any} size={16} color={theme.primary} />
        </View>
        <Text style={styles.sectionCardTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function FieldLabel({
  label,
  required,
}: {
  label: string;
  required?: boolean;
}) {
  return (
    <Text style={styles.fieldLabel}>
      {label}
      {required && <Text style={{ color: theme.primary }}> *</Text>}
    </Text>
  );
}

function StyledInput({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  numberOfLines,
  error,
  prefix,
  suffix,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  multiline?: boolean;
  numberOfLines?: number;
  error?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.inputWrapper,
        focused && styles.inputWrapperFocused,
        error && styles.inputWrapperError,
        multiline && { height: 80, alignItems: "flex-start" },
      ]}
    >
      {prefix && <Text style={styles.inputAffix}>{prefix}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && { textAlignVertical: "top", paddingTop: 10 },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedForeground}
        keyboardType={keyboardType ?? "default"}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {suffix && <Text style={styles.inputAffix}>{suffix}</Text>}
    </View>
  );
}

// ─── Variant Row ──────────────────────────────────────────────────────────────
function VariantRow({
  variant,
  index,
  onChange,
  onRemove,
}: {
  variant: Variant;
  index: number;
  onChange: (v: Variant) => void;
  onRemove: () => void;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: 1,
      tension: 65,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.variantRow,
        {
          opacity: anim,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        },
      ]}
    >
      {/* Variant header */}
      <View style={styles.variantRowHeader}>
        <View style={styles.variantBadge}>
          <Text style={styles.variantBadgeText}>Variant {index + 1}</Text>
        </View>
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="close-circle"
            size={20}
            color={theme.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      {/* Name */}
      <FieldLabel label="Variant Name (e.g. Red / L)" required />
      <StyledInput
        value={variant.name}
        onChangeText={(t) => onChange({ ...variant, name: t })}
        placeholder="e.g. Red / Large"
      />

      {/* SKU */}
      <FieldLabel label="SKU" />
      <StyledInput
        value={variant.sku}
        onChangeText={(t) => onChange({ ...variant, sku: t })}
        placeholder="Auto-generated if empty"
      />

      {/* Price row */}
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <FieldLabel label="Purchase Price" required />
          <StyledInput
            value={variant.purchasePrice}
            onChangeText={(t) => onChange({ ...variant, purchasePrice: t })}
            placeholder="0.00"
            keyboardType="decimal-pad"
            prefix="Rs."
          />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel label="Selling Price" required />
          <StyledInput
            value={variant.sellingPrice}
            onChangeText={(t) => onChange({ ...variant, sellingPrice: t })}
            placeholder="0.00"
            keyboardType="decimal-pad"
            prefix="Rs."
          />
        </View>
      </View>

      {/* Stock */}
      <FieldLabel label="Stock Qty" />
      <StyledInput
        value={variant.stock}
        onChangeText={(t) => onChange({ ...variant, stock: t })}
        placeholder="0"
        keyboardType="numeric"
        suffix="pcs"
      />
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function AddProductScreen() {
  const insets = useSafeAreaInsets();
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [selectedUnit, setSelectedUnit] = useState<Unit>("pcs");
  const [selectedCategory, setSelectedCategory] = useState<Category | "">("");
  const [hasVariants, setHasVariants] = useState(false);
  const [trackInventory, setTrackInventory] = useState(true);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const btnScale = useRef(new Animated.Value(1)).current;

  const s0 = useFadeSlide(0);
  const s1 = useFadeSlide(60);
  const s2 = useFadeSlide(120);
  const s3 = useFadeSlide(180);
  const s4 = useFadeSlide(240);
  const s5 = useFadeSlide(300);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      unit: "pcs",
      purchasePrice: "",
      sellingPrice: "",
      stock: "",
      lowStockAlert: "5",
      barcode: "",
      taxRate: "13",
      trackInventory: true,
      hasVariants: false,
    },
  });

  const sellingPrice = watch("sellingPrice");
  const purchasePrice = watch("purchasePrice");
  const margin =
    sellingPrice && purchasePrice && parseFloat(purchasePrice) > 0
      ? (
          ((parseFloat(sellingPrice) - parseFloat(purchasePrice)) /
            parseFloat(purchasePrice)) *
          100
        ).toFixed(1)
      : null;

  const addVariant = useCallback(() => {
    setVariants((prev) => [
      ...prev,
      {
        id: genId(),
        name: "",
        sku: "",
        purchasePrice: "",
        sellingPrice: "",
        stock: "",
      },
    ]);
  }, []);

  const removeVariant = useCallback((id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const updateVariant = useCallback((id: string, updated: Variant) => {
    setVariants((prev) => prev.map((v) => (v.id === id ? updated : v)));
  }, []);

  const onSubmit = async (data: ProductFormValues) => {
    Animated.sequence([
      Animated.timing(btnScale, {
        toValue: 0.96,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(btnScale, {
        toValue: 1,
        tension: 200,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    if (hasVariants && variants.length === 0) {
      Alert.alert(
        "No Variants",
        "Please add at least one variant or disable variants.",
      );
      return;
    }

    setSubmitting(true);
    try {
      // TODO: wire up your mutation here
      const payload = {
        ...data,
        unit: selectedUnit,
        category: selectedCategory,
        image: imageUrl,
        variants: hasVariants ? variants : [],
      };
      console.log("Product payload:", payload);
      await new Promise((r) => setTimeout(r, 800)); // simulate API
      router.back();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      {/* ── Header ── */}
      <Animated.View style={[styles.header, s0]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={theme.foreground} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Product</Text>
        <TouchableOpacity activeOpacity={0.7} style={styles.scanBtn}>
          <Ionicons name="scan-outline" size={20} color={theme.primary} />
        </TouchableOpacity>
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: 100 + insets.bottom },
          ]}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Image Upload ── */}
          <Animated.View style={[styles.imageSection, s0]}>
            <ImageUpload
              value={imageUrl}
              onChange={setImageUrl}
              folder="/products"
              size={90}
            />
            <View>
              <Text style={styles.imageSectionTitle}>Product Photo</Text>
              <Text style={styles.imageSectionSub}>
                Tap to upload from gallery
              </Text>
            </View>
          </Animated.View>

          {/* ── Basic Info ── */}
          <Animated.View style={s1}>
            <SectionCard
              title="Basic Information"
              icon="information-circle-outline"
            >
              <FieldLabel label="Product Name" required />
              <Controller
                control={control}
                name="name"
                rules={{ required: "Product name is required" }}
                render={({ field: { onChange, value } }) => (
                  <StyledInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="e.g. Basmati Rice"
                    error={!!errors.name}
                  />
                )}
              />
              {errors.name && (
                <Text style={styles.errorText}>{errors.name.message}</Text>
              )}

              <FieldLabel label="Description" />
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <StyledInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="Short product description..."
                    multiline
                    numberOfLines={3}
                  />
                )}
              />

              {/* Category */}
              <FieldLabel label="Category" />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 4 }}
              >
                <View style={styles.chipRow}>
                  {CATEGORIES.map((c) => (
                    <TouchableOpacity
                      key={c}
                      activeOpacity={0.75}
                      style={[
                        styles.chip,
                        selectedCategory === c && styles.chipActive,
                      ]}
                      onPress={() => setSelectedCategory(c)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedCategory === c && styles.chipTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* Unit */}
              <FieldLabel label="Unit" required />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.chipRow}>
                  {UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      activeOpacity={0.75}
                      style={[
                        styles.chip,
                        selectedUnit === u && styles.chipActive,
                      ]}
                      onPress={() => setSelectedUnit(u)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedUnit === u && styles.chipTextActive,
                        ]}
                      >
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </SectionCard>
          </Animated.View>

          {/* ── Pricing ── */}
          <Animated.View style={s2}>
            <SectionCard title="Pricing" icon="pricetag-outline">
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Purchase Price" required />
                  <Controller
                    control={control}
                    name="purchasePrice"
                    rules={{ required: !hasVariants }}
                    render={({ field: { onChange, value } }) => (
                      <StyledInput
                        value={value}
                        onChangeText={onChange}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        prefix="Rs."
                        error={!!errors.purchasePrice}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Selling Price" required />
                  <Controller
                    control={control}
                    name="sellingPrice"
                    rules={{ required: !hasVariants }}
                    render={({ field: { onChange, value } }) => (
                      <StyledInput
                        value={value}
                        onChangeText={onChange}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        prefix="Rs."
                        error={!!errors.sellingPrice}
                      />
                    )}
                  />
                </View>
              </View>

              {/* Margin pill */}
              {margin !== null && (
                <View style={styles.marginPill}>
                  <Ionicons
                    name={
                      parseFloat(margin) >= 0 ? "trending-up" : "trending-down"
                    }
                    size={13}
                    color={parseFloat(margin) >= 0 ? "#065f46" : theme.primary}
                  />
                  <Text
                    style={[
                      styles.marginText,
                      {
                        color:
                          parseFloat(margin) >= 0 ? "#065f46" : theme.primary,
                      },
                    ]}
                  >
                    {parseFloat(margin) >= 0 ? "+" : ""}
                    {margin}% margin
                  </Text>
                </View>
              )}

              {/* Tax */}
              <FieldLabel label="Tax Rate (%)" />
              <Controller
                control={control}
                name="taxRate"
                render={({ field: { onChange, value } }) => (
                  <StyledInput
                    value={value}
                    onChangeText={onChange}
                    placeholder="13"
                    keyboardType="decimal-pad"
                    suffix="%"
                  />
                )}
              />
            </SectionCard>
          </Animated.View>

          {/* ── Inventory ── */}
          <Animated.View style={s3}>
            <SectionCard title="Inventory" icon="cube-outline">
              {/* Track inventory toggle */}
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Track Inventory</Text>
                  <Text style={styles.toggleSub}>Get low stock alerts</Text>
                </View>
                <Switch
                  value={trackInventory}
                  onValueChange={setTrackInventory}
                  trackColor={{
                    false: theme.border,
                    true: `${theme.primary}55`,
                  }}
                  thumbColor={trackInventory ? theme.primary : "#ccc"}
                />
              </View>

              {trackInventory && !hasVariants && (
                <>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <FieldLabel label="Opening Stock" />
                      <Controller
                        control={control}
                        name="stock"
                        render={({ field: { onChange, value } }) => (
                          <StyledInput
                            value={value}
                            onChangeText={onChange}
                            placeholder="0"
                            keyboardType="numeric"
                            suffix={selectedUnit}
                          />
                        )}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <FieldLabel label="Low Stock Alert" />
                      <Controller
                        control={control}
                        name="lowStockAlert"
                        render={({ field: { onChange, value } }) => (
                          <StyledInput
                            value={value}
                            onChangeText={onChange}
                            placeholder="5"
                            keyboardType="numeric"
                            suffix={selectedUnit}
                          />
                        )}
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Barcode */}
              <FieldLabel label="Barcode / SKU" />
              <View style={styles.barcodeRow}>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name="barcode"
                    render={({ field: { onChange, value } }) => (
                      <StyledInput
                        value={value}
                        onChangeText={onChange}
                        placeholder="Scan or enter barcode"
                        keyboardType="default"
                      />
                    )}
                  />
                </View>
                <TouchableOpacity
                  activeOpacity={0.75}
                  style={styles.scanIconBtn}
                >
                  <Ionicons name="scan" size={20} color={theme.primary} />
                </TouchableOpacity>
              </View>
            </SectionCard>
          </Animated.View>

          {/* ── Variants ── */}
          <Animated.View style={s4}>
            <SectionCard title="Variants" icon="options-outline">
              <View style={styles.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.toggleLabel}>Enable Variants</Text>
                  <Text style={styles.toggleSub}>
                    Size, colour, weight, etc.
                  </Text>
                </View>
                <Switch
                  value={hasVariants}
                  onValueChange={(v) => {
                    setHasVariants(v);
                    if (v && variants.length === 0) addVariant();
                  }}
                  trackColor={{
                    false: theme.border,
                    true: `${theme.primary}55`,
                  }}
                  thumbColor={hasVariants ? theme.primary : "#ccc"}
                />
              </View>

              {hasVariants && (
                <>
                  <View style={styles.variantDivider} />
                  {variants.map((v, i) => (
                    <VariantRow
                      key={v.id}
                      variant={v}
                      index={i}
                      onChange={(updated) => updateVariant(v.id, updated)}
                      onRemove={() => removeVariant(v.id)}
                    />
                  ))}

                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.addVariantBtn}
                    onPress={addVariant}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color={theme.primary}
                    />
                    <Text style={styles.addVariantText}>
                      Add Another Variant
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </SectionCard>
          </Animated.View>

          {/* ── Save Button ── */}
          <Animated.View
            style={[
              s5,
              { transform: [...(s5.transform ?? []), { scale: btnScale }] },
            ]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={handleSubmit(onSubmit)}
              disabled={submitting}
              style={styles.saveBtn}
            >
              {submitting ? (
                <ActivityIndicator color={theme.primaryForeground} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.primaryForeground}
                  />
                  <Text style={styles.saveBtnText}>Save Product</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.backgroundElement,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 4,
    backgroundColor: theme.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    ...Platform.select({
      ios: {
        shadowColor: Ui.shadowColor,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: Fonts.sans,
    fontSize: 17,
    fontWeight: "700",
    color: theme.foreground,
    letterSpacing: -0.3,
  },
  scanBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
  },

  // Scroll
  scroll: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.two + 4,
  },

  // Image Section
  imageSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    backgroundColor: theme.background,
    borderRadius: Radius.xl,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: theme.border,
  },
  imageSectionTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: "700",
    color: theme.foreground,
  },
  imageSectionSub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: theme.mutedForeground,
    marginTop: 2,
  },

  // Section Card
  sectionCard: {
    backgroundColor: theme.background,
    borderRadius: Radius.xl,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: theme.border,
    gap: Spacing.one + 2,
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
  sectionCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.one + 2,
  },
  sectionIconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCardTitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    fontWeight: "700",
    color: theme.foreground,
  },

  // Field
  fieldLabel: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "600",
    color: theme.foreground,
    marginTop: Spacing.one + 2,
    marginBottom: 4,
  },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: theme.primary,
    marginTop: 2,
  },

  // Input
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.backgroundElement,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingHorizontal: Spacing.two + 4,
    minHeight: 46,
  },
  inputWrapperFocused: {
    borderColor: theme.primary,
    backgroundColor: "#fff5f5",
  },
  inputWrapperError: {
    borderColor: theme.primary,
  },
  input: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: theme.foreground,
    paddingVertical: 0,
  },
  inputAffix: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: theme.mutedForeground,
    fontWeight: "600",
    marginHorizontal: 4,
  },

  // Chips
  chipRow: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: theme.backgroundElement,
    borderWidth: 1.5,
    borderColor: theme.border,
  },
  chipActive: {
    backgroundColor: "#fff5f5",
    borderColor: theme.primary,
  },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "600",
    color: theme.mutedForeground,
  },
  chipTextActive: {
    color: theme.primary,
  },

  // Margin pill
  marginPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: "#d1fae5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  marginText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: "700",
  },

  // Toggle row
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.one,
  },
  toggleLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "600",
    color: theme.foreground,
  },
  toggleSub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: theme.mutedForeground,
    marginTop: 1,
  },

  // Barcode
  barcodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scanIconBtn: {
    width: 46,
    height: 46,
    borderRadius: Radius.xl,
    backgroundColor: "#fff5f5",
    borderWidth: 1.5,
    borderColor: "#fecaca",
    alignItems: "center",
    justifyContent: "center",
  },

  // Variants
  variantDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: Spacing.two,
  },
  variantRow: {
    backgroundColor: theme.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.two + 4,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: theme.border,
    gap: Spacing.one,
  },
  variantRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  variantBadge: {
    backgroundColor: "#fff5f5",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  variantBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: "700",
    color: theme.primary,
  },
  addVariantBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: theme.primary,
    borderStyle: "dashed",
    borderRadius: Radius.xl,
    paddingVertical: Spacing.two + 4,
    backgroundColor: "#fff5f5",
  },
  addVariantText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "600",
    color: theme.primary,
  },

  // Save Button
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: theme.primary,
    borderRadius: Radius.xl + 6,
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
    ...Platform.select({
      ios: {
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  saveBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: "700",
    color: theme.primaryForeground,
    letterSpacing: 0.2,
  },
});
