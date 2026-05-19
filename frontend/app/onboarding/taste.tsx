/**
 * Taste / Free preview screen.
 * User has finished the quiz. Now: "Try your first icebreaker — free."
 * They describe the scene → AI generates 5 lines (consumes the single free call)
 * → soft paywall sheet rises up offering plans.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Send, MapPin, ArrowRight, Lightbulb } from "lucide-react-native";
import { COLORS, STRINGS, Lang } from "../../src/theme";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";
import { IcebreakerCard } from "../../src/IcebreakerCard";

export default function Taste() {
  const router = useRouter();
  const params = useLocalSearchParams<{ lang?: string }>();
  const insets = useSafeAreaInsets();
  const { refresh } = useAuth();
  const language: Lang = (params.lang === "fr" ? "fr" : "en") as Lang;
  const t = STRINGS[language];

  const [context, setContext] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ icebreakers: any[]; tip: string } | null>(null);

  const onGenerate = async () => {
    if (context.trim().length < 5) {
      Alert.alert(
        language === "fr" ? "Contexte trop court" : "Context too short",
        language === "fr" ? "Décris la scène en quelques mots." : "Describe the scene in a few words."
      );
      return;
    }
    setBusy(true);
    try {
      const r = await api.generate(context.trim(), location.trim(), language);
      setResults({ icebreakers: r.icebreakers, tip: r.tip });
      await refresh();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to generate");
    } finally {
      setBusy(false);
    }
  };

  const continueToPaywall = () => {
    router.replace(`/paywall?lang=${language}&from=onboarding`);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 30 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {!results ? (
            <>
              <View style={styles.badge}>
                <Sparkles size={14} color={COLORS.accent} />
                <Text style={styles.badgeText}>
                  {language === "fr" ? "ESSAI GRATUIT" : "FREE PREVIEW"}
                </Text>
              </View>
              <Text style={styles.title}>
                {language === "fr"
                  ? "Ton premier icebreaker.\nOffert."
                  : "Your first icebreaker.\nOn us."}
              </Text>
              <Text style={styles.subtitle}>
                {language === "fr"
                  ? "Décris la scène. Notre IA crée 5 lignes parfaites pour toi."
                  : "Describe the scene. Our AI crafts 5 perfect lines for you."}
              </Text>

              <View style={styles.composer}>
                <View style={styles.inputRow}>
                  <MapPin size={16} color={COLORS.textTertiary} />
                  <TextInput
                    placeholder={t.locationPlaceholder}
                    placeholderTextColor={COLORS.textTertiary}
                    value={location}
                    onChangeText={setLocation}
                    style={styles.locationInput}
                    testID="taste-location"
                  />
                </View>
                <TextInput
                  placeholder={t.contextPlaceholder}
                  placeholderTextColor={COLORS.textTertiary}
                  value={context}
                  onChangeText={setContext}
                  style={styles.contextInput}
                  multiline
                  numberOfLines={4}
                  testID="taste-context"
                />
                <TouchableOpacity
                  onPress={onGenerate}
                  disabled={busy}
                  style={[styles.sendBtn, busy && { opacity: 0.6 }]}
                  testID="taste-generate"
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[COLORS.accent, "#FF8055"]}
                    style={StyleSheet.absoluteFillObject}
                  />
                  {busy ? (
                    <ActivityIndicator color={COLORS.surface} size="small" />
                  ) : (
                    <>
                      <Send size={16} color={COLORS.surface} strokeWidth={2.5} />
                      <Text style={styles.sendText}>{t.generate}</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={{ gap: 14 }}>
              <View style={styles.badge}>
                <Sparkles size={14} color={COLORS.accent} />
                <Text style={styles.badgeText}>
                  {language === "fr" ? "VOICI TES LIGNES" : "HERE ARE YOUR LINES"}
                </Text>
              </View>
              <Text style={styles.title}>
                {language === "fr" ? "Faites pour toi." : "Made for you."}
              </Text>

              {results.icebreakers.map((ib, i) => (
                <IcebreakerCard
                  key={i}
                  text={ib.line}
                  tone={ib.tone}
                  language={language}
                  source="ai"
                  language_ui={language}
                  testID={`taste-line-${i}`}
                />
              ))}
              {results.tip ? (
                <View style={styles.tipCard}>
                  <Lightbulb size={18} color={COLORS.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tipLabel}>{t.tip.toUpperCase()}</Text>
                    <Text style={styles.tipText}>{results.tip}</Text>
                  </View>
                </View>
              ) : null}

              <TouchableOpacity style={styles.cta} onPress={continueToPaywall} testID="taste-unlock">
                <Text style={styles.ctaText}>
                  {language === "fr" ? "Débloquer la suite" : "Unlock unlimited"}
                </Text>
                <ArrowRight size={20} color={COLORS.surface} />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 12, gap: 14 },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.accent + "55",
  },
  badgeText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  title: {
    color: COLORS.textPrimary,
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -1.4,
    lineHeight: 40,
    marginTop: 6,
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 6,
    marginBottom: 8,
  },
  composer: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 6 },
  locationInput: { flex: 1, color: COLORS.textPrimary, fontSize: 13, padding: 0, height: 30 },
  contextInput: {
    color: COLORS.textPrimary,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: "top",
    paddingHorizontal: 6,
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 14,
    overflow: "hidden",
  },
  sendText: { color: COLORS.surface, fontWeight: "800", fontSize: 15, letterSpacing: -0.2 },
  tipCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#FFF8E7",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F5C56F",
  },
  tipLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#A87800",
    marginBottom: 4,
  },
  tipText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 14,
  },
  ctaText: { color: COLORS.surface, fontSize: 17, fontWeight: "900", letterSpacing: -0.3 },
});
