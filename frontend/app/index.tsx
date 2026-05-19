/**
 * Welcome screen - "Never run out of things to say."
 * First step in the conversion funnel: positioning → quiz → taste → paywall.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Globe, ArrowRight } from "lucide-react-native";
import { COLORS, STRINGS, Lang, getDeviceLanguage } from "../src/theme";
import { useAuth } from "../src/auth";

export default function Welcome() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [language, setLanguage] = useState<Lang>(getDeviceLanguage());
  const t = STRINGS[language];

  useEffect(() => {
    if (!loading && user) {
      // Returning users: skip quiz if completed, otherwise resume from quiz
      if (user.onboarding_complete) {
        router.replace("/(tabs)/home");
      } else {
        router.replace(`/onboarding/quiz?lang=${language}`);
      }
    }
  }, [loading, user, router, language]);

  const onStart = () => {
    router.push(`/onboarding/quiz?lang=${language}`);
  };

  const onSignIn = () => {
    router.push(`/auth/signin?lang=${language}`);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="welcome-screen">
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1753351051905-8b341bdbd3aa?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(10,10,11,0.45)", "rgba(10,10,11,0.98)"]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.body}>
          <View style={styles.langRow}>
            <TouchableOpacity
              style={[styles.langBtn, language === "en" && styles.langBtnActive]}
              onPress={() => setLanguage("en")}
              testID="lang-en"
            >
              <Globe size={14} color={language === "en" ? COLORS.darkBg : COLORS.darkText} />
              <Text style={[styles.langTxt, language === "en" && styles.langTxtActive]}>EN</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, language === "fr" && styles.langBtnActive]}
              onPress={() => setLanguage("fr")}
              testID="lang-fr"
            >
              <Globe size={14} color={language === "fr" ? COLORS.darkBg : COLORS.darkText} />
              <Text style={[styles.langTxt, language === "fr" && styles.langTxtActive]}>FR</Text>
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1 }} />

          <View style={styles.badge}>
            <Sparkles size={14} color={COLORS.accent} />
            <Text style={styles.badgeText}>{t.appName}</Text>
          </View>
          <Text style={styles.title} testID="welcome-title">
            {t.onboardWelcome}
          </Text>
          <Text style={styles.subtitle}>{t.onboardSubtitle}</Text>

          <TouchableOpacity style={styles.cta} onPress={onStart} testID="get-started-btn">
            <Text style={styles.ctaText}>{t.getStarted}</Text>
            <ArrowRight size={20} color={COLORS.surface} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onSignIn} testID="welcome-signin">
            <Text style={styles.signInText}>
              {language === "fr" ? "Déjà un compte ? Se connecter" : "Already have an account? Sign in"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  center: { alignItems: "center", justifyContent: "center" },
  body: { flex: 1, paddingHorizontal: 24, paddingBottom: 32, gap: 14 },
  langRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8, marginTop: 8 },
  langBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  langBtnActive: { backgroundColor: COLORS.darkText },
  langTxt: { color: COLORS.darkText, fontSize: 12, fontWeight: "700" },
  langTxtActive: { color: COLORS.darkBg },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,90,54,0.15)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,90,54,0.4)",
  },
  badgeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    color: COLORS.darkText,
    fontSize: 46,
    fontWeight: "900",
    letterSpacing: -1.8,
    lineHeight: 50,
    marginTop: 8,
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    marginBottom: 16,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: 16,
  },
  ctaText: { color: COLORS.surface, fontSize: 17, fontWeight: "900", letterSpacing: -0.3 },
  signInText: {
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 10,
  },
});
