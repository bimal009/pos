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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Spacing, Ui } from "@/constants/theme";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import ImageUpload from "@/components/ImageUpload";
import { useGetCategoriesByStore } from "@/client/category";
import { useUnits } from "@/client/units";

const theme = Colors.light;
const { width } = Dimensions.get("window");

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required").max(200),
    description: z.string().optional(),
    purchasePrice: z.string().optional(),
    sellingPrice: z.string().optional(),
    stock: z.string().optional(),
    lowStockThreshold: z.string().optional(),
    barcode: z.string().optional(),
    taxRate: z.string().optional(),
    trackInventory: z.boolean(),
    hasVariants: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (!data.hasVariants) {
      if (!data.sellingPrice || data.sellingPrice.trim() === "") {
        ctx.addIssue({
          path: ["sellingPrice"],
          code: z.ZodIssueCode.custom,
          message: "Selling price is required",
        });
      }
    }
  });

type ProductFormValues = z.infer<typeof productSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantAttribute {
  id: string;
  name: string;
  values: string; // comma-separated
}

interface VariantSku {
  id: string;
  combination: string;
  sku: string;
  purchasePrice: string;
  sellingPrice: string;
  stock: string;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

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

function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2, 9);
}

function generateCombinations(attributes: VariantAttribute[]): string[] {
  const valueSets = attributes
    .map((a) =>
      a.values
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    )
    .filter((s) => s.length > 0);

  if (valueSets.length === 0) return [];

  return valueSets.reduce<string[]>(
    (acc, vals) =>
      acc.length === 0
        ? vals
        : acc.flatMap((a) => vals.map((b) => `${a} / ${b}`)),
    [],
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  title,
  icon,
  children,
  badge,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
  badge?: string | number;
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionCardHeader}>
        <View style={styles.sectionIconBox}>
          <Ionicons name={icon as any} size={16} color={theme.primary} />
        </View>
        <Text style={styles.sectionCardTitle}>{title}</Text>
        {badge !== undefined && (
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{badge}</Text>
          </View>
        )}
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
  editable = true,
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
  editable?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.inputWrapper,
        focused && styles.inputWrapperFocused,
        error && styles.inputWrapperError,
        multiline && { height: 80, alignItems: "flex-start" },
        !editable && { opacity: 0.55 },
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
        editable={editable}
      />
      {suffix && <Text style={styles.inputAffix}>{suffix}</Text>}
    </View>
  );
}

function AttributeRow({
  attr,
  index,
  onChange,
  onRemove,
}: {
  attr: VariantAttribute;
  index: number;
  onChange: (a: VariantAttribute) => void;
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
        styles.attributeRow,
        {
          opacity: anim,
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.96, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.attributeRowHeader}>
        <View style={styles.attributeIndexDot}>
          <Text style={styles.attributeIndexText}>{index + 1}</Text>
        </View>
        <Text style={styles.attributeRowTitle}>Attribute {index + 1}</Text>
        <TouchableOpacity
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="trash-outline"
            size={16}
            color={theme.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1 }}>
          <FieldLabel label="Name" required />
          <StyledInput
            value={attr.name}
            onChangeText={(t) => onChange({ ...attr, name: t })}
            placeholder="e.g. Size"
          />
        </View>
        <View style={{ flex: 2 }}>
          <FieldLabel label="Values (comma-separated)" required />
          <StyledInput
            value={attr.values}
            onChangeText={(t) => onChange({ ...attr, values: t })}
            placeholder="e.g. S, M, L, XL"
          />
        </View>
      </View>

      {attr.values.trim().length > 0 && (
        <View style={styles.attrPreviewRow}>
          {attr.values
            .split(",")
            .map((v) => v.trim())
            .filter(Boolean)
            .map((v, i) => (
              <View key={i} style={styles.attrValueChip}>
                <Text style={styles.attrValueChipText}>{v}</Text>
              </View>
            ))}
        </View>
      )}
    </Animated.View>
  );
}

function SkuRow({
  sku,
  onChange,
}: {
  sku: VariantSku;
  onChange: (s: VariantSku) => void;
}) {
  return (
    <View style={styles.skuRow}>
      <View style={styles.skuCombinationBadge}>
        <Text style={styles.skuCombinationText} numberOfLines={1}>
          {sku.combination}
        </Text>
      </View>
      <View style={styles.skuFields}>
        <View style={{ flex: 1 }}>
          <Text style={styles.skuFieldLabel}>Buy</Text>
          <StyledInput
            value={sku.purchasePrice}
            onChangeText={(t) => onChange({ ...sku, purchasePrice: t })}
            placeholder="0.00"
            keyboardType="decimal-pad"
            prefix="Rs."
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.skuFieldLabel}>Sell *</Text>
          <StyledInput
            value={sku.sellingPrice}
            onChangeText={(t) => onChange({ ...sku, sellingPrice: t })}
            placeholder="0.00"
            keyboardType="decimal-pad"
            prefix="Rs."
          />
        </View>
        <View style={{ width: 72 }}>
          <Text style={styles.skuFieldLabel}>Stock</Text>
          <StyledInput
            value={sku.stock}
            onChangeText={(t) => onChange({ ...sku, stock: t })}
            placeholder="0"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AddProductScreen() {
  const insets = useSafeAreaInsets();
  const { id: storeId } = useLocalSearchParams<{ id: string }>();

  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [unitSearch, setUnitSearch] = useState("");
  const debouncedUnitSearch = useDebounce(unitSearch, 400);

  const [attributes, setAttributes] = useState<VariantAttribute[]>([]);
  const [skuMatrix, setSkuMatrix] = useState<VariantSku[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const btnScale = useRef(new Animated.Value(1)).current;

  const { data: storeCategories } = useGetCategoriesByStore(storeId ?? "");

  // Units with debounced search
  const { data: unitsPage, isLoading: unitsLoading } = useUnits({
    search: debouncedUnitSearch || undefined,
    limit: 20,
  });
  const units = unitsPage?.data ?? [];

  const s0 = useFadeSlide(0);
  const s1 = useFadeSlide(60);
  const s2 = useFadeSlide(120);
  const s3 = useFadeSlide(180);
  const s4 = useFadeSlide(240);
  const s5 = useFadeSlide(300);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      purchasePrice: "",
      sellingPrice: "",
      stock: "",
      lowStockThreshold: "5",
      barcode: "",
      taxRate: "13",
      trackInventory: true,
      hasVariants: false,
    },
  });

  const hasVariants = watch("hasVariants");
  const trackInventory = watch("trackInventory");
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

  const rebuildSkuMatrix = useCallback(
    (attrs: VariantAttribute[], existing: VariantSku[]) => {
      const combos = generateCombinations(attrs);
      const existingMap = new Map(existing.map((s) => [s.combination, s]));
      return combos.map(
        (combo) =>
          existingMap.get(combo) ?? {
            id: genId(),
            combination: combo,
            sku: "",
            purchasePrice: "",
            sellingPrice: "",
            stock: "",
          },
      );
    },
    [],
  );

  const addAttribute = useCallback(() => {
    const newAttrs = [...attributes, { id: genId(), name: "", values: "" }];
    setAttributes(newAttrs);
    setSkuMatrix(rebuildSkuMatrix(newAttrs, skuMatrix));
  }, [attributes, skuMatrix, rebuildSkuMatrix]);

  const updateAttribute = useCallback(
    (id: string, updated: VariantAttribute) => {
      const newAttrs = attributes.map((a) => (a.id === id ? updated : a));
      setAttributes(newAttrs);
      setSkuMatrix(rebuildSkuMatrix(newAttrs, skuMatrix));
    },
    [attributes, skuMatrix, rebuildSkuMatrix],
  );

  const removeAttribute = useCallback(
    (id: string) => {
      const newAttrs = attributes.filter((a) => a.id !== id);
      setAttributes(newAttrs);
      setSkuMatrix(rebuildSkuMatrix(newAttrs, skuMatrix));
    },
    [attributes, skuMatrix, rebuildSkuMatrix],
  );

  const updateSku = useCallback((id: string, updated: VariantSku) => {
    setSkuMatrix((prev) => prev.map((s) => (s.id === id ? updated : s)));
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

    if (!selectedUnitId) {
      Alert.alert("Unit Required", "Please select a unit for this product.");
      return;
    }

    if (data.hasVariants && skuMatrix.length === 0) {
      Alert.alert(
        "No Variants",
        "Add at least one attribute with values, or disable variants.",
      );
      return;
    }

    if (data.hasVariants) {
      const missingSellPrice = skuMatrix.some((s) => !s.sellingPrice.trim());
      if (missingSellPrice) {
        Alert.alert("Missing Price", "All variants must have a selling price.");
        return;
      }
    }

    setSubmitting(true);
    try {
      // attributes stored as jsonb: [{ name, values: string[] }]
      const attributesPayload = attributes.map((a) => ({
        name: a.name,
        values: a.values
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      }));

      const payload = {
        // Global product fields
        name: data.name,
        description: data.description,
        unitId: selectedUnitId,
        categoryId: selectedCategoryId || undefined,
        imageUrl,
        barcode: data.barcode || undefined,

        // Store product fields
        hasVariants: data.hasVariants,
        trackInventory: data.trackInventory,
        taxRate: data.taxRate || "13",
        attributes: data.hasVariants ? attributesPayload : undefined,

        // Non-variant pricing/stock
        purchasePrice: !data.hasVariants ? data.purchasePrice : undefined,
        sellingPrice: !data.hasVariants ? data.sellingPrice : undefined,
        stock:
          !data.hasVariants && data.trackInventory ? data.stock : undefined,
        lowStockThreshold:
          !data.hasVariants && data.trackInventory
            ? data.lowStockThreshold
            : undefined,

        // Variants
        variants: data.hasVariants
          ? skuMatrix.map((s) => ({
              variantLabel: s.combination,
              sku: s.sku || undefined,
              purchasePrice: s.purchasePrice || undefined,
              sellingPrice: s.sellingPrice,
              stock: s.stock || "0",
            }))
          : undefined,
      };

      console.log("Product payload:", JSON.stringify(payload, null, 2));
      await new Promise((r) => setTimeout(r, 800));
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

      {/* Header */}
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
          {/* Image Upload */}
          <Animated.View style={[styles.imageSection, s0]}>
            <ImageUpload
              title="Upload Product Photo"
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

          {/* Basic Info */}
          <Animated.View style={s1}>
            <SectionCard
              title="Basic Information"
              icon="information-circle-outline"
            >
              <FieldLabel label="Product Name" required />
              <Controller
                control={control}
                name="name"
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
                    value={value ?? ""}
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
                  {storeCategories?.map((c) => (
                    <TouchableOpacity
                      key={c.categoryId}
                      activeOpacity={0.75}
                      style={[
                        styles.chip,
                        selectedCategoryId === c.categoryId &&
                          styles.chipActive,
                      ]}
                      onPress={() =>
                        setSelectedCategoryId(
                          selectedCategoryId === c.categoryId
                            ? ""
                            : c.categoryId,
                        )
                      }
                    >
                      {c.category.icon ? (
                        <MaterialCommunityIcons
                          name={
                            c.category
                              .icon as keyof typeof MaterialCommunityIcons.glyphMap
                          }
                          size={16}
                          color={
                            selectedCategoryId === c.categoryId
                              ? theme.primary
                              : theme.mutedForeground
                          }
                        />
                      ) : null}
                      <Text
                        style={[
                          styles.chipText,
                          selectedCategoryId === c.categoryId &&
                            styles.chipTextActive,
                        ]}
                      >
                        {c.category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {!storeCategories?.length && (
                    <Text style={styles.emptyChipText}>
                      No categories found
                    </Text>
                  )}
                </View>
              </ScrollView>

              {/* Unit — fetched from API with debounced search */}
              <FieldLabel label="Unit" required />
              <View style={styles.unitSearchWrapper}>
                <Ionicons
                  name="search-outline"
                  size={15}
                  color={theme.mutedForeground}
                />
                <TextInput
                  style={styles.unitSearchInput}
                  value={unitSearch}
                  onChangeText={setUnitSearch}
                  placeholder="Search units..."
                  placeholderTextColor={theme.mutedForeground}
                />
                {unitsLoading && (
                  <ActivityIndicator size="small" color={theme.primary} />
                )}
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 6 }}
              >
                <View style={styles.chipRow}>
                  {units.map((u) => (
                    <TouchableOpacity
                      key={u.id}
                      activeOpacity={0.75}
                      style={[
                        styles.chip,
                        selectedUnitId === u.id && styles.chipActive,
                      ]}
                      onPress={() => setSelectedUnitId(u.id)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          selectedUnitId === u.id && styles.chipTextActive,
                        ]}
                      >
                        {u.abbreviation} · {u.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                  {!unitsLoading && units.length === 0 && (
                    <Text style={styles.emptyChipText}>No units found</Text>
                  )}
                </View>
              </ScrollView>
            </SectionCard>
          </Animated.View>

          {/* Pricing */}
          <Animated.View style={s2}>
            <SectionCard title="Pricing" icon="pricetag-outline">
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Purchase Price" />
                  <Controller
                    control={control}
                    name="purchasePrice"
                    render={({ field: { onChange, value } }) => (
                      <StyledInput
                        value={value ?? ""}
                        onChangeText={onChange}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        prefix="Rs."
                        editable={!hasVariants}
                      />
                    )}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FieldLabel label="Selling Price" required={!hasVariants} />
                  <Controller
                    control={control}
                    name="sellingPrice"
                    render={({ field: { onChange, value } }) => (
                      <StyledInput
                        value={value ?? ""}
                        onChangeText={onChange}
                        placeholder="0.00"
                        keyboardType="decimal-pad"
                        prefix="Rs."
                        error={!!errors.sellingPrice}
                        editable={!hasVariants}
                      />
                    )}
                  />
                  {errors.sellingPrice && (
                    <Text style={styles.errorText}>
                      {errors.sellingPrice.message}
                    </Text>
                  )}
                </View>
              </View>

              {hasVariants && (
                <View style={styles.variantPriceHint}>
                  <Ionicons
                    name="information-circle-outline"
                    size={13}
                    color={theme.mutedForeground}
                  />
                  <Text style={styles.variantPriceHintText}>
                    Prices are set per variant below
                  </Text>
                </View>
              )}

              {margin !== null && !hasVariants && (
                <View
                  style={[
                    styles.marginPill,
                    {
                      backgroundColor:
                        parseFloat(margin) >= 0 ? "#d1fae5" : "#fee2e2",
                    },
                  ]}
                >
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

              <FieldLabel label="Tax Rate (%)" />
              <Controller
                control={control}
                name="taxRate"
                render={({ field: { onChange, value } }) => (
                  <StyledInput
                    value={value ?? ""}
                    onChangeText={onChange}
                    placeholder="13"
                    keyboardType="decimal-pad"
                    suffix="%"
                  />
                )}
              />
            </SectionCard>
          </Animated.View>

          {/* Inventory */}
          <Animated.View style={s3}>
            <SectionCard title="Inventory" icon="cube-outline">
              <Controller
                control={control}
                name="trackInventory"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleLabel}>Track Inventory</Text>
                      <Text style={styles.toggleSub}>Get low stock alerts</Text>
                    </View>
                    <Switch
                      value={value}
                      onValueChange={onChange}
                      trackColor={{
                        false: theme.border,
                        true: `${theme.primary}55`,
                      }}
                      thumbColor={value ? theme.primary : "#ccc"}
                    />
                  </View>
                )}
              />

              {trackInventory && !hasVariants && (
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <FieldLabel label="Opening Stock" />
                    <Controller
                      control={control}
                      name="stock"
                      render={({ field: { onChange, value } }) => (
                        <StyledInput
                          value={value ?? ""}
                          onChangeText={onChange}
                          placeholder="0"
                          keyboardType="numeric"
                        />
                      )}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <FieldLabel label="Low Stock Alert" />
                    <Controller
                      control={control}
                      name="lowStockThreshold"
                      render={({ field: { onChange, value } }) => (
                        <StyledInput
                          value={value ?? ""}
                          onChangeText={onChange}
                          placeholder="5"
                          keyboardType="numeric"
                        />
                      )}
                    />
                  </View>
                </View>
              )}

              {trackInventory && hasVariants && (
                <View style={styles.inventoryVariantHint}>
                  <Ionicons
                    name="layers-outline"
                    size={14}
                    color={theme.mutedForeground}
                  />
                  <Text style={styles.variantPriceHintText}>
                    Stock is tracked per variant in the Variants section
                  </Text>
                </View>
              )}

              <FieldLabel label="Barcode" />
              <View style={styles.barcodeRow}>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name="barcode"
                    render={({ field: { onChange, value } }) => (
                      <StyledInput
                        value={value ?? ""}
                        onChangeText={onChange}
                        placeholder="Scan or enter barcode"
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

          {/* Variants */}
          <Animated.View style={s4}>
            <SectionCard
              title="Variants"
              icon="options-outline"
              badge={
                hasVariants && skuMatrix.length > 0
                  ? `${skuMatrix.length} SKUs`
                  : undefined
              }
            >
              <Controller
                control={control}
                name="hasVariants"
                render={({ field: { onChange, value } }) => (
                  <View style={styles.toggleRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleLabel}>Enable Variants</Text>
                      <Text style={styles.toggleSub}>
                        Size, colour, weight, etc.
                      </Text>
                    </View>
                    <Switch
                      value={value}
                      onValueChange={(v) => {
                        onChange(v);
                        if (v && attributes.length === 0) addAttribute();
                      }}
                      trackColor={{
                        false: theme.border,
                        true: `${theme.primary}55`,
                      }}
                      thumbColor={value ? theme.primary : "#ccc"}
                    />
                  </View>
                )}
              />

              {hasVariants && (
                <>
                  <View style={styles.variantDivider} />

                  <View style={styles.variantStepHeader}>
                    <View style={styles.variantStepDot}>
                      <Text style={styles.variantStepDotText}>1</Text>
                    </View>
                    <Text style={styles.variantStepTitle}>
                      Define Attributes
                    </Text>
                  </View>
                  <Text style={styles.variantStepSub}>
                    e.g. "Size" → "S, M, L" · "Color" → "Red, Blue"
                  </Text>

                  {attributes.map((attr, i) => (
                    <AttributeRow
                      key={attr.id}
                      attr={attr}
                      index={i}
                      onChange={(updated) => updateAttribute(attr.id, updated)}
                      onRemove={() => removeAttribute(attr.id)}
                    />
                  ))}

                  <TouchableOpacity
                    activeOpacity={0.75}
                    style={styles.addAttributeBtn}
                    onPress={addAttribute}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color={theme.primary}
                    />
                    <Text style={styles.addAttributeText}>Add Attribute</Text>
                  </TouchableOpacity>

                  {skuMatrix.length > 0 && (
                    <>
                      <View
                        style={[
                          styles.variantDivider,
                          { marginTop: Spacing.two },
                        ]}
                      />
                      <View style={styles.variantStepHeader}>
                        <View style={styles.variantStepDot}>
                          <Text style={styles.variantStepDotText}>2</Text>
                        </View>
                        <Text style={styles.variantStepTitle}>
                          Set Prices & Stock{" "}
                          <Text style={styles.skuCountLabel}>
                            ({skuMatrix.length} variants)
                          </Text>
                        </Text>
                      </View>
                      <Text style={styles.variantStepSub}>
                        Each combination gets its own price and stock
                      </Text>

                      {skuMatrix.map((s) => (
                        <SkuRow
                          key={s.id}
                          sku={s}
                          onChange={(updated) => updateSku(s.id, updated)}
                        />
                      ))}
                    </>
                  )}

                  {skuMatrix.length === 0 && attributes.length > 0 && (
                    <View style={styles.skuEmptyState}>
                      <Ionicons
                        name="grid-outline"
                        size={28}
                        color={theme.mutedForeground}
                      />
                      <Text style={styles.skuEmptyText}>
                        Enter attribute values above to generate variants
                      </Text>
                    </View>
                  )}
                </>
              )}
            </SectionCard>
          </Animated.View>

          {/* Save Button */}
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
  root: { flex: 1, backgroundColor: theme.backgroundElement },

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

  scroll: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.two + 4,
  },

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
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: theme.primary + "18",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: "700",
    color: theme.primary,
  },

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
  inputWrapperError: { borderColor: theme.primary },
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

  unitSearchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: theme.backgroundElement,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: theme.border,
    paddingHorizontal: Spacing.two + 4,
    minHeight: 42,
  },
  unitSearchInput: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: theme.foreground,
    paddingVertical: 0,
  },

  chipRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: theme.backgroundElement,
    borderWidth: 1.5,
    borderColor: theme.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  chipActive: { backgroundColor: "#fff5f5", borderColor: theme.primary },
  chipText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "600",
    color: theme.mutedForeground,
  },
  chipTextActive: { color: theme.primary },
  emptyChipText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: theme.mutedForeground,
    paddingVertical: 7,
  },

  marginPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 2,
  },
  marginText: { fontFamily: Fonts.sans, fontSize: 12, fontWeight: "700" },

  variantPriceHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.backgroundElement,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 4,
  },
  variantPriceHintText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: theme.mutedForeground,
  },
  inventoryVariantHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: theme.backgroundElement,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

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

  barcodeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
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

  variantDivider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: Spacing.one + 2,
  },
  variantStepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  variantStepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  variantStepDotText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: "800",
    color: "#fff",
  },
  variantStepTitle: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "700",
    color: theme.foreground,
  },
  variantStepSub: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: theme.mutedForeground,
    marginBottom: Spacing.one + 2,
  },
  skuCountLabel: { fontWeight: "400", color: theme.mutedForeground },

  attributeRow: {
    backgroundColor: theme.backgroundElement,
    borderRadius: Radius.lg,
    padding: Spacing.two + 2,
    marginBottom: Spacing.one + 2,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 4,
  },
  attributeRowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  attributeIndexDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: theme.primary + "22",
    alignItems: "center",
    justifyContent: "center",
  },
  attributeIndexText: {
    fontFamily: Fonts.sans,
    fontSize: 10,
    fontWeight: "800",
    color: theme.primary,
  },
  attributeRowTitle: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: "600",
    color: theme.foreground,
    flex: 1,
  },

  attrPreviewRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  attrValueChip: {
    backgroundColor: theme.primary + "15",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: theme.primary + "30",
  },
  attrValueChipText: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: "600",
    color: theme.primary,
  },

  addAttributeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: theme.primary,
    borderStyle: "dashed",
    borderRadius: Radius.xl,
    paddingVertical: Spacing.two + 2,
    backgroundColor: "#fff5f5",
  },
  addAttributeText: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "600",
    color: theme.primary,
  },

  skuRow: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: Radius.lg,
    padding: Spacing.two,
    marginBottom: Spacing.one + 2,
    backgroundColor: theme.background,
    gap: 8,
  },
  skuCombinationBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.primary + "12",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: theme.primary + "25",
    marginBottom: 4,
  },
  skuCombinationText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    fontWeight: "700",
    color: theme.primary,
  },
  skuFields: { flexDirection: "row", gap: 6, alignItems: "flex-start" },
  skuFieldLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    fontWeight: "600",
    color: theme.mutedForeground,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  skuEmptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 24,
    opacity: 0.6,
  },
  skuEmptyText: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: theme.mutedForeground,
    textAlign: "center",
  },

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
