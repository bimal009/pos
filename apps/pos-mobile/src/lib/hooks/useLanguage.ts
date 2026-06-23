import { useEffect, useState, useCallback } from "react";
import { getLanguage, setLanguage, Language } from "./language";

export function useLanguage() {
  const [lang, setLang] = useState<Language>("english");
  const [loaded, setLoaded] = useState(false);

  /* load saved language once */
  useEffect(() => {
    let mounted = true;

    (async () => {
      const saved = await getLanguage();
      if (mounted) {
        setLang(saved);
        setLoaded(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  /* change language globally */
  const changeLanguage = useCallback(async (l: Language) => {
    setLang(l);
    await setLanguage(l);
  }, []);

  return {
    lang,
    loaded,
    changeLanguage,
    isEnglish: lang === "english",
    isNepali: lang === "nepali",
  };
}
