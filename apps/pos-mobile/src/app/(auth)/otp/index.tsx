import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  useColorScheme,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { authClient } from "../../../../auth-client";
import { Colors } from "@/constants/theme";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 59;

interface OTPScreenProps {
  phone?: string;
  onBack?: () => void;
  onVerify?: (code: string) => void;
}

export default function OTPScreen({
  phone = "+977 98XXXXXXXX",
  onBack,
  onVerify,
}: OTPScreenProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const C = scheme === "dark" ? Colors.dark : Colors.light;

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [timer, setTimer] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = async () => {
    if (!canResend) return;
    setError("");
    const { error } = await authClient.phoneNumber.sendOtp({
      phoneNumber: phone,
    });
    if (error) {
      setError(error.message ?? "Failed to resend OTP.");
    } else {
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimer(RESEND_SECONDS);
      setCanResend(false);
      setFocusedIndex(0);
      inputRefs.current[0]?.focus();
    }
  };

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError("");
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
      const newOtp = [...otp];
      newOtp[index - 1] = "";
      setOtp(newOtp);
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) return;
    setLoading(true);
    setError("");
    const { error } = await authClient.phoneNumber.verify({
      phoneNumber: phone,
      code,
    });
    setLoading(false);
    if (error) {
      setError(error.message ?? "Invalid OTP. Please try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      setFocusedIndex(0);
      inputRefs.current[0]?.focus();
    } else {
      if (onVerify) {
        onVerify(code);
      } else {
        router.replace("/");
      }
    }
  };

  const formatTimer = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const isComplete = otp.every((d) => d !== "");

  const styles = makeStyles(C);

  return (
    <View style={styles.safe}>
      <StatusBar
        barStyle={scheme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={C.backgroundElement}
      />

      <View style={styles.bg} />

      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Ionicons name="arrow-back" size={22} color={C.text} />
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.iconBadge}>
          <MaterialCommunityIcons name="dialpad" size={30} color={C.primary} />
        </View>

        <Text style={styles.title}>Verify Account</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to{"\n"}
          <Text style={styles.phoneText}>{phone}</Text>
        </Text>

        <View style={styles.otpRow}>
          {Array(OTP_LENGTH)
            .fill(0)
            .map((_, i) => (
              <TextInput
                key={i}
                ref={(ref) => {
                  inputRefs.current[i] = ref;
                }}
                style={[
                  styles.otpBox,
                  focusedIndex === i && styles.otpBoxFocused,
                  otp[i] !== "" && styles.otpBoxFilled,
                  !!error && styles.otpBoxError,
                ]}
                value={otp[i]}
                onChangeText={(v) => handleChange(v, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                onFocus={() => setFocusedIndex(i)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                caretHidden
              />
            ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.resendRow}>
          <Text style={styles.resendHint}>Didn't receive the code? </Text>
        </View>
        <View style={styles.resendRow}>
          <TouchableOpacity onPress={handleResend} disabled={!canResend}>
            <Text
              style={[styles.resendLink, !canResend && styles.resendDisabled]}
            >
              Resend Code
            </Text>
          </TouchableOpacity>
          {!canResend && (
            <Text style={styles.timerText}>
              {" "}
              in <Text style={styles.timerBold}>{formatTimer(timer)}</Text>
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.verifyBtn,
            (!isComplete || loading) && styles.verifyBtnDisabled,
          ]}
          onPress={handleVerify}
          disabled={!isComplete || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={C.primaryForeground} />
          ) : (
            <>
              <Text style={styles.verifyBtnText}>Verify</Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={C.primaryForeground}
                style={{ marginLeft: 6 }}
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const makeStyles = (C: typeof Colors.light | typeof Colors.dark) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: C.backgroundElement,
    },
    bg: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: C.backgroundElement,
    },
    backBtn: {
      position: "absolute",
      top: 52,
      left: 20,
      zIndex: 10,
      width: 40,
      height: 40,
      justifyContent: "center",
    },
    card: {
      flex: 1,
      backgroundColor: C.background,
      borderRadius: 28,
      marginHorizontal: 16,
      marginTop: 120,
      marginBottom: 60,
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 28,
      alignItems: "center",
      shadowColor: "#000",
      shadowOpacity: 0.06,
      shadowOffset: { width: 0, height: 4 },
      shadowRadius: 16,
      elevation: 4,
    },
    iconBadge: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: C.backgroundSelected,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
    },
    title: {
      fontSize: 26,
      fontWeight: "800",
      color: C.text,
      marginBottom: 8,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 14,
      color: C.textSecondary,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 28,
    },
    phoneText: {
      fontWeight: "700",
      color: C.text,
    },
    otpRow: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
      justifyContent: "center",
    },
    otpBox: {
      width: 48,
      height: 56,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: C.border,
      fontSize: 20,
      fontWeight: "700",
      color: C.text,
      backgroundColor: C.backgroundElement,
    },
    otpBoxFocused: {
      borderColor: C.primary,
      borderWidth: 2,
      backgroundColor: C.background,
    },
    otpBoxFilled: {
      borderColor: C.backgroundSelected,
      backgroundColor: C.background,
    },
    otpBoxError: {
      borderColor: C.destructive,
    },
    error: {
      fontSize: 13,
      color: C.destructive,
      marginBottom: 12,
      textAlign: "center",
    },
    resendRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    resendHint: {
      fontSize: 13,
      color: C.textSecondary,
    },
    resendLink: {
      fontSize: 14,
      fontWeight: "700",
      color: C.primary,
    },
    resendDisabled: {
      opacity: 0.5,
    },
    timerText: {
      fontSize: 13,
      color: C.textSecondary,
    },
    timerBold: {
      fontWeight: "700",
      color: C.text,
    },
    verifyBtn: {
      flexDirection: "row",
      backgroundColor: C.primary,
      borderRadius: 16,
      height: 56,
      width: "100%",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24,
    },
    verifyBtnDisabled: {
      opacity: 0.5,
    },
    verifyBtnText: {
      color: C.primaryForeground,
      fontSize: 16,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
  });
