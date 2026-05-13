import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Platform,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Fonts, Radius, Spacing, Ui } from "@/constants/theme";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import ImageUpload from "@/components/ImageUpload";
import { authClient } from "../../../../auth-client";

const theme = Colors.light;

type Role = "individual" | "company";

interface ProfileFormValues {
  name: string;
}

export default function RegisterProfile() {
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const field1Anim = useRef(new Animated.Value(0)).current;
  const field2Anim = useRef(new Animated.Value(0)).current;
  const btnAnim = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(1)).current;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    defaultValues: { name: "" },
  });

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.stagger(80, [
        Animated.spring(avatarAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(field1Anim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(field2Anim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(btnAnim, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  const onSubmit = async (data: ProfileFormValues) => {
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

    try {
      setSubmitting(true);

      const res = await authClient.updateUser({
        name: data.name,
        ...(imageUrl && { image: imageUrl }),
        isOnboarded: true,
      });
      if (res.data?.status) {
        router.replace("/(stores)");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.container,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Set Up Your Profile</Text>
              <Text style={styles.subtitle}>
                Tell us a bit about yourself to personalize your experience.
              </Text>
            </View>

            {/* Avatar */}
            <Animated.View
              style={{
                opacity: avatarAnim,
                transform: [
                  {
                    translateY: avatarAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
                alignItems: "center",
                marginBottom: Spacing.four,
              }}
            >
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                folder="/avatars"
                size={96}
              />
            </Animated.View>

            {/* Fields */}
            <View style={styles.fields}>
              {/* Name */}
              <Animated.View
                style={{
                  opacity: field1Anim,
                  transform: [
                    {
                      translateY: field1Anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                <Text style={styles.label}>
                  Full Name <Text style={styles.required}>*</Text>
                </Text>
                <Controller
                  control={control}
                  name="name"
                  rules={{
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.input, errors.name && styles.inputError]}
                      placeholder="Enter your full name"
                      placeholderTextColor={theme.mutedForeground}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="words"
                      returnKeyType="next"
                    />
                  )}
                />
                {errors.name && (
                  <Text style={styles.errorText}>{errors.name.message}</Text>
                )}
              </Animated.View>
            </View>

            {/* Continue Button */}
            <Animated.View
              style={{
                opacity: btnAnim,
                transform: [
                  {
                    translateY: btnAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                  { scale: btnScale },
                ],
              }}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={handleSubmit(onSubmit)}
                style={styles.continueBtn}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color={theme.primaryForeground} />
                ) : (
                  <>
                    <Text style={styles.continueBtnText}>Continue</Text>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={theme.primaryForeground}
                      style={{ marginLeft: 4 }}
                    />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  container: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: Colors.light.card,
    borderRadius: 24,
    padding: Spacing.four,
    ...Platform.select({
      ios: {
        shadowColor: Ui.shadowColor,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.four,
  },
  title: {
    fontFamily: Fonts.sans,
    fontSize: 26,
    fontWeight: "800",
    color: Colors.light.foreground,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: Spacing.two,
  },
  subtitle: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.light.mutedForeground,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: Spacing.two,
  },
  fields: {
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  label: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    fontWeight: "600",
    color: Colors.light.foreground,
    marginBottom: Spacing.one,
  },
  required: {
    color: "red",
  },
  optional: {
    fontWeight: "400",
    color: Colors.light.mutedForeground,
  },
  input: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.light.foreground,
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  inputError: {
    borderColor: "red",
  },
  errorText: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: "red",
    marginTop: 4,
    marginLeft: 4,
  },
  continueBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.xl + 6,
    paddingVertical: Spacing.three,
    backgroundColor: Colors.light.primary,
    gap: Spacing.two,
  },
  continueBtnText: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
    color: Colors.light.primaryForeground,
  },
});
