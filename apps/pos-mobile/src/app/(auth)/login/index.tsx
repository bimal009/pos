import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { authClient } from "../../../../auth-client";
import { Colors } from "@/constants/theme";
import { translations } from "./translations/login";
import { useLanguage } from "@/lib/hooks/useLanguage";

interface PhoneScreenProps {
  onNext?: (phone: string) => void;
  onBack?: () => void;
}

export default function PhoneScreen({ onNext, onBack }: PhoneScreenProps) {
  const scheme = useColorScheme();
  const C = scheme === "dark" ? Colors.dark : Colors.light;

  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { lang, changeLanguage, loaded } = useLanguage();
  const translation = useMemo(() => translations[lang], [lang]);

  // const isValidPhone = phone.length === 10;
  const isValidPhone = /^[0-9]{10}$/.test(phone);

  const handleSendOTP = async () => {
    if (!isValidPhone) return;
    setLoading(true);
    setError("");
    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: `+977${phone}`,
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? translation.otpFailed);
    } else {
      onNext?.(`+977${phone}`);
    }
  };

  const styles = useMemo(() => makeStyles(C), [scheme]);

  if (!loaded) {
    return (
      <View style={[styles.safe, { justifyContent: "center" }]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.safe}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.background}
      />

      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={onBack}>
            <Ionicons name="arrow-back" size={22} color={C.text} />
          </TouchableOpacity>

          <View style={styles.languageSwitcher}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                lang === "english" && styles.languageButtonActive,
              ]}
              onPress={() => changeLanguage("english")}
            >
              <Text
                style={[
                  styles.languageText,
                  lang === "english" && styles.languageTextActive,
                ]}
              >
                EN
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                lang === "nepali" && styles.languageButtonActive,
              ]}
              onPress={() => changeLanguage("nepali")}
            >
              <Text
                style={[
                  styles.languageText,
                  lang === "nepali" && styles.languageTextActive,
                ]}
              >
                ने
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.title}>{translation.welcome}</Text>

        <Text style={styles.subtitle}>
          {translation.subtitle}
        </Text>

        <View style={styles.inputWrapper}>
          <View style={styles.dialCode}>
            <Text style={styles.flag}>🇳🇵</Text>
            <Text style={styles.dialCodeText}>+977</Text>
          </View>
          <View style={styles.divider} />
          <TextInput
            style={styles.input}
            placeholder={translation.phoneNumber}
            placeholderTextColor={C.textSecondary}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(v) => {
              setError("");
              setPhone(v);
            }}
            maxLength={10}
          />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={styles.hint}>
          {translation.otpHint}
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!isValidPhone || loading) && styles.sendBtnDisabled,
          ]}
          onPress={handleSendOTP}
          disabled={!isValidPhone || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={C.primaryForeground} />
          ) : (
            <Text style={styles.sendBtnText}>{translation.sendOtp}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (C: (typeof Colors)[keyof typeof Colors]) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.background,
    },
    container: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 12,
    },
    backBtn: {
      width: 40,
      height: 40,
      justifyContent: "center",
      marginBottom: 28,
    },
    title: {
      fontSize: 32,
      fontWeight: "800",
      color: C.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 15,
      color: C.textSecondary,
      marginBottom: 32,
      lineHeight: 22,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderColor: C.border,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 56,
      backgroundColor: C.background,
      marginBottom: 12,
    },
    dialCode: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingRight: 10,
    },
    flag: {
      fontSize: 20,
    },
    dialCodeText: {
      fontSize: 15,
      fontWeight: "600",
      color: C.text,
    },
    divider: {
      width: 1.5,
      height: 26,
      backgroundColor: C.border,
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 15,
      color: C.text,
    },
    error: {
      fontSize: 13,
      color: C.destructive,
      marginBottom: 8,
    },
    hint: {
      fontSize: 13,
      color: C.textSecondary,
      lineHeight: 20,
    },
    footer: {
      paddingHorizontal: 24,
      paddingBottom: 24,
      paddingTop: 12,
      backgroundColor: C.background,
    },
    sendBtn: {
      backgroundColor: C.primary,
      borderRadius: 16,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
    },
    sendBtnDisabled: {
      opacity: 0.5,
    },
    sendBtnText: {
      color: C.primaryForeground,
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 28,
    },

    languageSwitcher: {
      flexDirection: "row",
      backgroundColor: C.card,
      borderRadius: 10,
      padding: 2,
      borderWidth: 1,
      borderColor: C.border,
    },

    languageButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },

    languageButtonActive: {
      backgroundColor: C.primary,
    },

    languageText: {
      color: C.textSecondary,
      fontSize: 13,
      fontWeight: "600",
    },

    languageTextActive: {
      color: C.primaryForeground,
    },
  });
