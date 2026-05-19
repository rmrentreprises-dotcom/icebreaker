/**
 * Onboarding / Auth screen - shown when user not signed in.
 * Lets them sign up, sign in, or continue as guest.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Globe, ArrowRight, Mail, Lock, User as UserIcon } from "lucide-react-native";
import { COLORS, STRINGS, Lang, getDeviceLanguage } from "../src/theme";
import { useAuth } from "../src/auth";

type Mode = "welcome" | "signup" | "signin";

export default function Index() {
  const router = useRouter();
  const { user, loading, signInGuest, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("welcome");
  const [language, setLanguage] = useState<Lang>(getDeviceLanguage());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const t = STRINGS[language];

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.replace("/(tabs)/home");
    }
  }, [loading, user, router]);

  const onGuest = async () => {
    setBusy(true);
    try {
      await signInGuest(language);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Email and password are required");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!name) {
          Alert.alert("Missing name", "Please enter your name");
          setBusy(false);
          return;
        }
        await signUp(email.trim(), password, name.trim(), language);
      } else {
        await signIn(email.trim(), password);
      }
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Auth failed", e.message || "Try again");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="onboarding-screen">
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1753351051905-8b341bdbd3aa?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(10,10,11,0.55)", "rgba(10,10,11,0.95)"]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollBody}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
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

            <View style={styles.heroBlock}>
              <View style={styles.badge}>
                <Sparkles size={14} color={COLORS.accent} />
                <Text style={styles.badgeText}>{t.appName}</Text>
              </View>
              <Text style={styles.title} testID="onboard-title">
                {t.onboardWelcome}
              </Text>
              <Text style={styles.subtitle}>{t.onboardSubtitle}</Text>
            </View>

            {mode === "welcome" ? (
              <View style={styles.actionsBlock}>
                <TouchableOpacity
                  style={styles.primaryBtn}
                  onPress={() => setMode("signup")}
                  testID="cta-signup"
                >
                  <Text style={styles.primaryBtnText}>{t.signUp}</Text>
                  <ArrowRight size={20} color={COLORS.surface} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryBtn}
                  onPress={() => setMode("signin")}
                  testID="cta-signin"
                >
                  <Text style={styles.secondaryBtnText}>{t.signIn}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onGuest} disabled={busy} testID="cta-guest">
                  <Text style={styles.ghostText}>
                    {busy ? "..." : t.continueGuest}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.formBlock}>
                {mode === "signup" && (
                  <View style={styles.inputWrap}>
                    <UserIcon size={18} color={COLORS.darkTextSecondary} />
                    <TextInput
                      placeholder={t.fullName}
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={name}
                      onChangeText={setName}
                      style={styles.input}
                      autoCapitalize="words"
                      testID="input-name"
                    />
                  </View>
                )}
                <View style={styles.inputWrap}>
                  <Mail size={18} color={COLORS.darkTextSecondary} />
                  <TextInput
                    placeholder={t.email}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={email}
                    onChangeText={setEmail}
                    style={styles.input}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    testID="input-email"
                  />
                </View>
                <View style={styles.inputWrap}>
                  <Lock size={18} color={COLORS.darkTextSecondary} />
                  <TextInput
                    placeholder={t.password}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={password}
                    onChangeText={setPassword}
                    style={styles.input}
                    secureTextEntry
                    testID="input-password"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.primaryBtn, busy && { opacity: 0.7 }]}
                  onPress={onSubmit}
                  disabled={busy}
                  testID="submit-auth"
                >
                  <Text style={styles.primaryBtnText}>
                    {busy ? "..." : mode === "signup" ? t.signUp : t.signIn}
                  </Text>
                  {!busy && <ArrowRight size={20} color={COLORS.surface} />}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMode("welcome")}>
                  <Text style={styles.ghostText}>← back</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  center: { alignItems: "center", justifyContent: "center" },
  scrollBody: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    justifyContent: "space-between",
  },
  langRow: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
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
  heroBlock: { marginTop: 60, gap: 16 },
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
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -1.5,
    lineHeight: 48,
  },
  subtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 16,
    lineHeight: 24,
  },
  actionsBlock: { gap: 12, marginTop: 40 },
  formBlock: { gap: 14, marginTop: 32 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 54,
  },
  input: { flex: 1, color: COLORS.darkText, fontSize: 16 },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 14,
  },
  primaryBtnText: { color: COLORS.surface, fontSize: 16, fontWeight: "800", letterSpacing: -0.3 },
  secondaryBtn: {
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
  },
  secondaryBtnText: { color: COLORS.darkText, fontSize: 16, fontWeight: "700" },
  ghostText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 12,
  },
});
