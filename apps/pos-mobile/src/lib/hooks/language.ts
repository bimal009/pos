import AsyncStorage from "@react-native-async-storage/async-storage";

export type Language = "english" | "nepali";

const LANGUAGE_KEY = "app_language";

export async function getLanguage(): Promise<Language> {
  const lang = await AsyncStorage.getItem(LANGUAGE_KEY);

  if (lang === "nepali") {
    return "nepali";
  }

  return "english";
}

export async function setLanguage(lang: Language) {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
}

// export const getLangauge = () => {
//   return "nepali";
// };
