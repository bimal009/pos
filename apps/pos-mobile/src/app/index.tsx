import React, { useState } from "react";
import OTPScreen from "./(auth)/otp";
import PhoneScreen from "./(auth)/login";
import { useRouter } from "expo-router";
import { getLangauge } from "@/lib/hooks/language";

type Screen = "phone" | "otp";

export default function App() {
  const [screen, setScreen] = useState<Screen>("phone");
  const [phone, setPhone] = useState("");
  const router = useRouter();
  const lanuage = getLangauge();

  if (screen === "otp") {
    return (
      <OTPScreen
        phone={phone}
        onVerify={(code) => {
          router.replace(`/(auth)/register?phoneNumber=${phone}`);
        }}
        onBack={() => setScreen("phone")}
      />
    );
  }

  return (
    <PhoneScreen
      onNext={(p) => {
        setPhone(p);
        setScreen("otp");
      }}
    />
  );
}
