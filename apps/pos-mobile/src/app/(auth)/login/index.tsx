import React, { useState, useMemo } from "react";
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

  const isValidPhone = phone.length === 10;

  const handleSendOTP = async () => {
    if (!isValidPhone) return;
    setLoading(true);
    setError("");
    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: `+977${phone}`,
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Failed to send OTP. Please try again.");
    } else {
      onNext?.(`+977${phone}`);
    }
  };

  const styles = useMemo(() => makeStyles(C), [scheme]);

  return (
    <View style={styles.safe}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.background}
      />

      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>

        <Text style={styles.title}>Welcome</Text>
        <Text style={styles.subtitle}>
          Enter your phone number to get started
        </Text>

        <View style={styles.inputWrapper}>
          <View style={styles.dialCode}>
            <Text style={styles.flag}>🇳🇵</Text>
            <Text style={styles.dialCodeText}>+977</Text>
          </View>
          <View style={styles.divider} />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
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
          We will send you a secure one-time password (OTP) to verify your
          account.
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
            <Text style={styles.sendBtnText}>Send OTP</Text>
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
  });
