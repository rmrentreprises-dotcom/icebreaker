/**
 * Assistant tab - AI live assistant. User describes context, gets 5 lines.
 */
import React, { useState, useRef, useEffect } from "react";
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
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Send, MapPin, Lightbulb, History, Crown, X } from "lucide-react-native";
import { COLORS, STRINGS } from "../../src/theme";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";
import { IcebreakerCard } from "../../src/IcebreakerCard";

export default function AssistantScreen() {
  const router = useRouter();
  const { user, language, refresh } = useAuth();
  const insets = useSafeAreaInsets();
  const t = STRINGS[language];
  const [context, setContext] = useState("");
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<{ icebreakers: any[]; tip: string } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const callsRemaining = user?.lifetime_ai_calls_remaining ?? 0;
  const isPremium = !!user?.is_premium;

  useEffect(() => {
    api.history().then((r) => setHistory(r.items)).catch(() => {});
  }, []);

  const onGenerate = async () => {
    if (context.trim().length < 5) {
      Alert.alert(language === "fr" ? "Contexte trop court" : "Context too short",
        language === "fr" ? "Décris la scène en quelques mots." : "Describe the scene in a few words.");
      return;
    }
    if (!isPremium && callsRemaining <= 0) {
      router.push("/paywall");
      return;
    }
    setBusy(true);
    setResults(null);
    try {
      const r = await api.generate(context.trim(), location.trim(), language);
      setResults({ icebreakers: r.icebreakers, tip: r.tip });
      // Refresh user (calls_remaining changed) + history
      await refresh();
      const h = await api.history();
      setHistory(h.items);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e: any) {
      if (e.status === 402) {
        router.push("/paywall");
        return;
      }
      // Friendly handling for AI service hiccups - the backend returns specific
      // 429 (rate), 503 (overload/auth), 504 (timeout). Show retry-friendly UI.
      const friendly = {
        429: language === "fr"
          ? "Le service IA est très demandé. Réessaie dans un instant."
          : "AI is in high demand. Try again in a moment.",
        503: language === "fr"
          ? "Le service IA est temporairement saturé. Réessaie dans quelques secondes."
          : "AI is temporarily overloaded. Try again in a few seconds.",
        504: language === "fr"
          ? "La génération a pris trop de temps. Réessaie."
          : "The request took too long. Please try again.",
      } as Record<number, string>;
      const msg = friendly[e.status] || e.message || (
        language === "fr"
          ? "Service IA indisponible pour l'instant. Réessaie."
          : "AI service is unavailable right now. Please try again."
      );
      setResults({
        icebreakers: [],
        tip: "",
        // @ts-ignore custom field
        error: msg,
      } as any);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.appLabel}>AI</Text>
            <Text style={styles.title}>{t.aiTitle}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowHistory((h) => !h)}
            style={styles.iconBtn}
            testID="history-toggle"
          >
            {showHistory ? <X size={20} color={COLORS.textPrimary} /> : <History size={20} color={COLORS.textPrimary} />}
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[styles.body, { paddingBottom: insets.bottom + 220 }]}
          showsVerticalScrollIndicator={false}
        >
          {showHistory ? (
            <View style={{ gap: 12 }}>
              <Text style={styles.sectionLabel}>{t.history}</Text>
              {history.length === 0 ? (
                <Text style={styles.emptyText}>{t.historyEmpty}</Text>
              ) : (
                history.map((h) => (
                  <TouchableOpacity
                    key={h.id}
                    style={styles.historyItem}
                    onPress={() => {
                      setContext(h.context);
                      setLocation(h.location || "");
                      setResults({ icebreakers: h.icebreakers, tip: h.tip });
                      setShowHistory(false);
                    }}
                    testID={`history-${h.id}`}
                  >
                    <Text style={styles.historyContext} numberOfLines={2}>{h.context}</Text>
                    <Text style={styles.historyMeta}>
                      {h.icebreakers?.length || 0} lines · {new Date(h.created_at).toLocaleDateString()}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          ) : (
            <View style={{ gap: 14 }}>
              <Text style={styles.subtitle}>{t.aiSubtitle}</Text>

              {/* Status */}
              {!isPremium && (
                <View style={styles.banner}>
                  <Sparkles size={14} color={COLORS.accent} />
                  <Text style={styles.bannerText}>{t.callsLeft(callsRemaining)}</Text>
                  {callsRemaining === 0 && (
                    <TouchableOpacity onPress={() => router.push("/paywall")} testID="banner-upgrade">
                      <Text style={styles.bannerCta}>{t.upgrade} →</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {/* Results */}
              {busy && (
                <View style={styles.loading}>
                  <ActivityIndicator color={COLORS.accent} />
                  <Text style={styles.loadingText}>{t.generating}</Text>
                </View>
              )}
              {results && !busy && (
                <View style={{ gap: 12 }}>
                  {(results as any).error ? (
                    <View style={styles.errorCard} testID="ai-error-card">
                      <Lightbulb size={18} color={COLORS.accent} />
                      <View style={{ flex: 1, gap: 8 }}>
                        <Text style={styles.errorTitle}>
                          {language === "fr" ? "Oups, réessaie" : "Hiccup — try again"}
                        </Text>
                        <Text style={styles.errorText}>{(results as any).error}</Text>
                        <TouchableOpacity
                          onPress={onGenerate}
                          style={styles.retryBtn}
                          testID="ai-retry-btn"
                        >
                          <Text style={styles.retryBtnText}>
                            {language === "fr" ? "Réessayer" : "Try again"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <>
                      {results.icebreakers.map((ib, i) => (
                        <IcebreakerCard
                          key={i}
                          text={ib.line}
                          tone={ib.tone}
                          language={language}
                          source="ai"
                          language_ui={language}
                          testID={`ai-result-${i}`}
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
                    </>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Composer */}
        {!showHistory && (
          <View style={[styles.composer, { paddingBottom: insets.bottom + 90 }]}>
            <View style={styles.inputBox}>
              <View style={styles.inputRow}>
                <MapPin size={16} color={COLORS.textTertiary} />
                <TextInput
                  placeholder={t.locationPlaceholder}
                  placeholderTextColor={COLORS.textTertiary}
                  value={location}
                  onChangeText={setLocation}
                  style={styles.locationInput}
                  testID="input-location"
                />
              </View>
              <TextInput
                placeholder={t.contextPlaceholder}
                placeholderTextColor={COLORS.textTertiary}
                value={context}
                onChangeText={setContext}
                style={styles.contextInput}
                multiline
                numberOfLines={3}
                testID="input-context"
              />
              <TouchableOpacity
                onPress={onGenerate}
                disabled={busy}
                style={[styles.sendBtn, busy && { opacity: 0.6 }]}
                testID="generate-btn"
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
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  appLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    letterSpacing: 2,
    fontWeight: "800",
    marginBottom: 4,
  },
  title: { fontSize: 32, fontWeight: "900", color: COLORS.textPrimary, letterSpacing: -1.2 },
  subtitle: { fontSize: 15, color: COLORS.textSecondary, lineHeight: 22 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { paddingHorizontal: 20, paddingTop: 4, gap: 12 },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: COLORS.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.accent + "33",
  },
  bannerText: { color: COLORS.textPrimary, fontWeight: "700", fontSize: 13, flex: 1 },
  bannerCta: { color: COLORS.accent, fontWeight: "800", fontSize: 13 },
  loading: { alignItems: "center", padding: 40, gap: 12 },
  loadingText: { color: COLORS.textSecondary, fontSize: 14, fontWeight: "600" },
  tipCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: "#FFF8E7",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F5C56F",
  },
  tipLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.5, color: "#A87800", marginBottom: 4 },
  tipText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 20 },
  errorCard: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    backgroundColor: COLORS.accentSoft,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.accent + "55",
  },
  errorTitle: { fontSize: 15, fontWeight: "800", color: COLORS.textPrimary, letterSpacing: -0.3 },
  errorText: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  retryBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    marginTop: 2,
  },
  retryBtnText: { color: COLORS.surface, fontWeight: "800", fontSize: 13 },
  composer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
    paddingTop: 8,
    backgroundColor: COLORS.background,
  },
  inputBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    gap: 8,
  },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 6 },
  locationInput: { flex: 1, color: COLORS.textPrimary, fontSize: 13, padding: 0, height: 30 },
  contextInput: {
    color: COLORS.textPrimary,
    fontSize: 15,
    minHeight: 64,
    textAlignVertical: "top",
    paddingHorizontal: 6,
  },
  sendBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
    overflow: "hidden",
  },
  sendText: { color: COLORS.surface, fontWeight: "800", fontSize: 14, letterSpacing: -0.2 },
  sectionLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    letterSpacing: 2,
    fontWeight: "800",
  },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: "center", paddingTop: 40 },
  historyItem: {
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  historyContext: { fontSize: 14, color: COLORS.textPrimary, fontWeight: "600", lineHeight: 20 },
  historyMeta: { fontSize: 11, color: COLORS.textTertiary, fontWeight: "600" },
});
