import { useGetCategories } from "@/client/category";
import { CategoryType } from "@/types/category";
import { Colors, Radius, Spacing } from "@/constants/theme";
import { useColorScheme } from "react-native";
import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useForm, Controller } from "react-hook-form";
import ImageUpload from "@/components/ImageUpload";
import { CreateStore } from "@/types/stores";
import { router } from "expo-router";
import { useCreateStore } from "@/client/store";

type MCIcon = keyof typeof MaterialCommunityIcons.glyphMap;
type TaxType = "none" | "pan" | "vat";

const TAX_OPTIONS: {
  value: TaxType;
  label: string;
  desc: string;
  icon: MCIcon;
}[] = [
  {
    value: "none",
    label: "No Registration",
    desc: "Simple bills only",
    icon: "receipt-outline",
  },
  {
    value: "pan",
    label: "PAN Registered",
    desc: "Basic tax bills with PAN",
    icon: "card-account-details-outline",
  },
  {
    value: "vat",
    label: "VAT Registered",
    desc: "13% VAT invoices (IRD compliant)",
    icon: "file-document-outline",
  },
];

interface StoreFormValues {
  name: string;
  address: string;
  phone: string;
  description?: string;
  logo?: string;
  categoriesId: string[];
  taxType: TaxType;
  taxNumber?: string;
}

export default function StoreSetupScreen() {
  const scheme = useColorScheme();
  const c = scheme === "dark" ? Colors.dark : Colors.light;
  const s = styles(c);

  const { data, isPending: categoriesLoading } = useGetCategories();
  const categories: CategoryType[] = data ?? [];

  const { mutate: createStore, isPending: creating } = useCreateStore();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<StoreFormValues>({
    defaultValues: {
      name: "",
      address: "",
      phone: "",
      description: "",
      logo: undefined,
      categoriesId: [],
      taxType: "none",
      taxNumber: "",
    },
  });

  const selectedCategories = watch("categoriesId");
  const taxType = watch("taxType");

  const toggleCategory = (id: string) => {
    const current = selectedCategories ?? [];
    const updated = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    setValue("categoriesId", updated, { shouldValidate: true });
  };

  const onSubmit = (data: StoreFormValues) => {
    const payload: CreateStore = {
      name: data.name,
      phone: data.phone,
      address: data.address,
      ...(data.description && { description: data.description }),
      ...(data.logo && { logo: data.logo }),
      categoriesId: data.categoriesId,
      taxType: data.taxType,
      ...(data.taxNumber && { taxNumber: data.taxNumber }),
    };

    createStore(payload, {
      onSuccess: (res) => {
        console.log(res?.message);
        if (res?.success) {
          router.replace("/(stores)");
        }
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={s.header}>
            <Text style={s.title}>Store Setup</Text>
            <Text style={s.subtitle}>
              Configure your store details and primary categories to begin.
            </Text>
          </View>

          {/* Logo */}
          <View style={s.logoRow}>
            <Controller
              control={control}
              name="logo"
              render={({ field: { value, onChange } }) => (
                <ImageUpload
                  value={value}
                  onChange={onChange}
                  folder="/store-logos"
                  size={80}
                />
              )}
            />
          </View>

          {/* Basic Details */}
          <Text style={s.sectionTitle}>Basic Details</Text>
          <View style={s.card}>
            <Controller
              control={control}
              name="name"
              rules={{
                required: "Store name is required",
                minLength: { value: 2, message: "At least 2 characters" },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[s.input, errors.name && s.inputError]}
                  placeholder="Store Name *"
                  placeholderTextColor={c.mutedForeground}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  autoCapitalize="words"
                  returnKeyType="next"
                />
              )}
            />
            {errors.name && (
              <Text style={s.errorText}>{errors.name.message}</Text>
            )}

            <View style={s.divider} />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={s.input}
                  placeholder="Description (optional)"
                  placeholderTextColor={c.mutedForeground}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />

            <View style={s.divider} />

            <Controller
              control={control}
              name="address"
              rules={{ required: "Address is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[s.input, errors.address && s.inputError]}
                  placeholder="Full Address *"
                  placeholderTextColor={c.mutedForeground}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  returnKeyType="next"
                />
              )}
            />
            {errors.address && (
              <Text style={s.errorText}>{errors.address.message}</Text>
            )}

            <View style={s.divider} />

            <Controller
              control={control}
              name="phone"
              rules={{ required: "Phone number is required" }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[s.input, errors.phone && s.inputError]}
                  placeholder="Phone Number *"
                  placeholderTextColor={c.mutedForeground}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="phone-pad"
                  returnKeyType="done"
                />
              )}
            />
            {errors.phone && (
              <Text style={s.errorText}>{errors.phone.message}</Text>
            )}
          </View>

          {/* Tax Registration */}
          <Text style={s.sectionTitle}>Tax Registration</Text>
          <View style={s.taxOptions}>
            {TAX_OPTIONS.map((opt) => {
              const isSelected = taxType === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  activeOpacity={0.7}
                  onPress={() => {
                    setValue("taxType", opt.value);
                    if (opt.value === "none") setValue("taxNumber", "");
                  }}
                  style={[s.taxOption, isSelected && s.taxOptionSelected]}
                >
                  <View
                    style={[
                      s.taxIconCircle,
                      {
                        backgroundColor: isSelected
                          ? c.primary
                          : c.backgroundElement,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={opt.icon}
                      size={20}
                      color={isSelected ? "#fff" : c.mutedForeground}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[s.taxLabel, isSelected && s.taxLabelSelected]}
                    >
                      {opt.label}
                    </Text>
                    <Text style={s.taxDesc}>{opt.desc}</Text>
                  </View>
                  <MaterialCommunityIcons
                    name={isSelected ? "radiobox-marked" : "radiobox-blank"}
                    size={20}
                    color={isSelected ? c.primary : c.mutedForeground}
                  />
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Tax Number — shown only if pan or vat selected */}
          {taxType !== "none" && (
            <View style={[s.card, { marginTop: Spacing.two }]}>
              <Controller
                control={control}
                name="taxNumber"
                rules={{
                  required: `${taxType.toUpperCase()} number is required`,
                  minLength: { value: 9, message: "Must be 9 digits" },
                  maxLength: { value: 9, message: "Must be 9 digits" },
                  pattern: { value: /^[0-9]{9}$/, message: "Must be 9 digits" },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[s.input, errors.taxNumber && s.inputError]}
                    placeholder={`Enter your ${taxType.toUpperCase()} number *`}
                    placeholderTextColor={c.mutedForeground}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="number-pad"
                    maxLength={9}
                    returnKeyType="done"
                  />
                )}
              />
              {errors.taxNumber && (
                <Text style={s.errorText}>{errors.taxNumber.message}</Text>
              )}
            </View>
          )}

          {/* Categories */}
          <View style={[s.categoryHeader, { marginTop: Spacing.four }]}>
            <Text style={s.sectionTitle}>Store Category</Text>
            {selectedCategories.length > 0 && (
              <Text style={s.selectedCount}>
                {selectedCategories.length} selected
              </Text>
            )}
          </View>

          {categoriesLoading ? (
            <ActivityIndicator
              color={c.primary}
              style={{ marginTop: Spacing.four }}
            />
          ) : (
            <Controller
              control={control}
              name="categoriesId"
              rules={{
                validate: (v) => v.length > 0 || "Select at least one category",
              }}
              render={() => (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={s.chipsContainer}
                >
                  {categories
                    .filter((cat) => cat.isActive)
                    .map((cat) => {
                      const isSelected = selectedCategories.includes(cat.id);
                      const iconName = (cat.icon ?? "store-outline") as MCIcon;
                      return (
                        <TouchableOpacity
                          key={cat.id}
                          onPress={() => toggleCategory(cat.id)}
                          activeOpacity={0.7}
                          style={[s.chip, isSelected && s.chipSelected]}
                        >
                          <MaterialCommunityIcons
                            name={iconName}
                            size={16}
                            color={isSelected ? c.primary : c.mutedForeground}
                          />
                          <Text
                            style={[
                              s.chipText,
                              isSelected && s.chipTextSelected,
                            ]}
                          >
                            {cat.name}
                          </Text>
                          {isSelected && (
                            <MaterialCommunityIcons
                              name="close-circle"
                              size={14}
                              color={c.primary}
                            />
                          )}
                        </TouchableOpacity>
                      );
                    })}
                </ScrollView>
              )}
            />
          )}

          {errors.categoriesId && (
            <Text style={[s.errorText, { marginTop: Spacing.one }]}>
              {errors.categoriesId.message}
            </Text>
          )}

          {selectedCategories.length > 0 && (
            <View style={s.selectedSummary}>
              {selectedCategories.map((id) => {
                const cat = categories.find((c) => c.id === id);
                if (!cat) return null;
                return (
                  <TouchableOpacity
                    key={id}
                    onPress={() => toggleCategory(id)}
                    style={s.summaryChip}
                    activeOpacity={0.7}
                  >
                    <Text style={s.summaryChipText}>{cat.name}</Text>
                    <MaterialCommunityIcons
                      name="close"
                      size={12}
                      color={c.mutedForeground}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          <View style={{ height: Spacing.six }} />
        </ScrollView>

        {/* Footer */}
        <View style={s.footer}>
          <TouchableOpacity
            style={[s.button, creating && s.buttonDisabled]}
            disabled={creating}
            activeOpacity={0.85}
            onPress={handleSubmit(onSubmit)}
          >
            {creating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={s.buttonText}>Complete Setup</Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={20}
                  color="#fff"
                />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = (c: (typeof Colors)[keyof typeof Colors]) =>
  StyleSheet.create({
    scroll: {
      paddingHorizontal: Spacing.three,
      paddingTop: Spacing.four,
      paddingBottom: Spacing.three,
    },
    header: {
      marginBottom: Spacing.four,
    },
    title: {
      fontSize: 28,
      fontWeight: "700",
      color: c.text,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: c.mutedForeground,
      lineHeight: 20,
    },
    logoRow: {
      alignItems: "center",
      marginBottom: Spacing.four,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: c.text,
      marginBottom: Spacing.two,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: Radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: Spacing.four,
      overflow: "hidden",
    },
    input: {
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.three,
      fontSize: 15,
      color: c.text,
    },
    inputError: {
      borderLeftWidth: 3,
      borderLeftColor: "red",
    },
    errorText: {
      fontSize: 12,
      color: "red",
      paddingHorizontal: Spacing.three,
      paddingBottom: Spacing.one,
    },
    divider: {
      height: 1,
      backgroundColor: c.border,
    },
    taxOptions: {
      gap: Spacing.two,
      marginBottom: Spacing.two,
    },
    taxOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: Spacing.two,
      padding: Spacing.three,
      borderRadius: Radius.lg,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    taxOptionSelected: {
      borderColor: c.primary,
      backgroundColor: c.selectedCardBackground,
    },
    taxIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: "center",
      justifyContent: "center",
    },
    taxLabel: {
      fontSize: 14,
      fontWeight: "600",
      color: c.text,
      marginBottom: 2,
    },
    taxLabelSelected: {
      color: c.primary,
    },
    taxDesc: {
      fontSize: 12,
      color: c.mutedForeground,
    },
    categoryHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: Spacing.two,
    },
    selectedCount: {
      fontSize: 13,
      color: c.primary,
      fontWeight: "600",
    },
    chipsContainer: {
      flexDirection: "row",
      gap: Spacing.two,
      paddingVertical: Spacing.one,
      paddingRight: Spacing.three,
    },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.two,
      borderRadius: 100,
      borderWidth: 1.5,
      borderColor: c.border,
      backgroundColor: c.card,
    },
    chipSelected: {
      borderColor: c.primary,
      backgroundColor: c.selectedCardBackground,
    },
    chipText: {
      fontSize: 13,
      fontWeight: "500",
      color: c.mutedForeground,
    },
    chipTextSelected: {
      color: c.primary,
      fontWeight: "600",
    },
    selectedSummary: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: Spacing.one + 2,
      marginTop: Spacing.two,
    },
    summaryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: Spacing.two,
      paddingVertical: Spacing.one,
      borderRadius: 100,
      backgroundColor: c.backgroundElement,
      borderWidth: 1,
      borderColor: c.border,
    },
    summaryChipText: {
      fontSize: 12,
      color: c.mutedForeground,
    },
    footer: {
      paddingHorizontal: Spacing.three,
      paddingVertical: Spacing.three,
      borderTopWidth: 1,
      borderTopColor: c.border,
      backgroundColor: c.background,
    },
    button: {
      backgroundColor: c.primary,
      borderRadius: Radius.lg,
      paddingVertical: Spacing.three,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: Spacing.two,
    },
    buttonDisabled: {
      opacity: 0.4,
    },
    buttonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  });
