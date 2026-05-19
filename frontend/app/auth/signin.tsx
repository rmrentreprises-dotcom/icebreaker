/**
 * Sign-in screen for returning users. Email/password.
 */
import React, { useState } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ArrowRight, Mail, Lock } from "lucide-react-native";
import { COLORS, STRINGS, Lang } from "../../src/theme";
import { useAuth } from "../../src/auth";

export default function SignIn() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lang?: string }>();
  const { signIn } = useAuth();
  const language: Lang = (params.lang === "fr" ? "fr" : "en") as Lang;
  const t = STRINGS[language];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert(
        language === "fr" ? "Champs manquants" : "Missing fields",
        language === "fr" ? "Email et mot de passe requis" : "Email and password required"
      );
      return;
    }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert(
        language === "fr" ? "Échec de la connexion" : "Sign in failed",
        e.message || "Try again"
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.container}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1753351051905-8b341bdbd3aa?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(10,10,11,0.6)", "rgba(10,10,11,0.97)"]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              testID="signin-back"
            >
              <ArrowLeft size={20} color={COLORS.darkText} />
            </TouchableOpacity>

            <Text style={styles.title}>
              {language === "fr" ? "Bon retour." : "Welcome back."}
            </Text>
            <Text style={styles.subtitle}>
              {language === "fr"
                ? "Connecte-toi pour retrouver tes icebreakers."
                : "Sign in to get back to your icebreakers."}
            </Text>

            <View style={styles.form}>
              <View style={styles.inputWrap}>
                <Mail size={18} color="rgba(255,255,255,0.5)" />
                <TextInput
                  placeholder={t.email}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID="signin-email"
                />
              </View>
              <View style={styles.inputWrap}>
                <Lock size={18} color="rgba(255,255,255,0.5)" />
                <TextInput
                  placeholder={t.password}
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  secureTextEntry
                  testID="signin-password"
                />
              </View>
              <TouchableOpacity
                style={[styles.cta, busy && { opacity: 0.7 }]}
                onPress={onSubmit}
                disabled={busy}
                testID="signin-submit"
              >
                {busy ? (
                  <ActivityIndicator color={COLORS.surface} />
                ) : (
                  <>
                    <Text style={styles.ctaText}>{t.signIn}</Text>
                    <ArrowRight size={20} color={COLORS.surface} />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  scroll: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 40, gap: 14 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginTop: 8,
  },
  title: {
    color: COLORS.darkText,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1.4,
    marginTop: 60,
  },
  subtitle: { color: "rgba(255,255,255,0.75)", fontSize: 16, lineHeight: 24 },
  form: { gap: 14, marginTop: 32 },
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
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 14,
  },
  ctaText: { color: COLORS.surface, fontSize: 16, fontWeight: "900", letterSpacing: -0.3 },
});
