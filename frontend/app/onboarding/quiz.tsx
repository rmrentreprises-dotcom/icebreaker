/**
 * Multi-step personalization quiz (commitment device before paywall).
 * 4 steps: age, dating_goal, style, meet_location. Progress bar at top.
 * On finish: create guest user, save quiz, push to /onboarding/taste.
 */
import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft, ArrowRight, Check } from "lucide-react-native";
import { COLORS, STRINGS, Lang } from "../../src/theme";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";

interface QuizDef {
  key: "age_range" | "dating_goal" | "style" | "meet_location";
  question_en: string;
  question_fr: string;
  options: { id: string; label_en: string; label_fr: string }[];
}

const STEPS: QuizDef[] = [
  {
    key: "age_range",
    question_en: "How old are you?",
    question_fr: "Quel âge as-tu ?",
    options: [
      { id: "18-24", label_en: "18 – 24", label_fr: "18 – 24" },
      { id: "25-34", label_en: "25 – 34", label_fr: "25 – 34" },
      { id: "35-44", label_en: "35 – 44", label_fr: "35 – 44" },
      { id: "45+", label_en: "45+", label_fr: "45+" },
    ],
  },
  {
    key: "dating_goal",
    question_en: "What's your dating goal?",
    question_fr: "Ton objectif rencontres ?",
    options: [
      { id: "serious", label_en: "Serious relationship", label_fr: "Relation sérieuse" },
      { id: "casual", label_en: "Casual dating", label_fr: "Rencontres légères" },
      { id: "practice", label_en: "Just practicing", label_fr: "Juste pour m'entraîner" },
      { id: "vacation", label_en: "Vacation / travel", label_fr: "Vacances / voyage" },
    ],
  },
  {
    key: "style",
    question_en: "Pick your style.",
    question_fr: "Ton style préféré.",
    options: [
      { id: "funny", label_en: "Funny", label_fr: "Drôle" },
      { id: "romantic", label_en: "Romantic", label_fr: "Romantique" },
      { id: "bold", label_en: "Bold", label_fr: "Audacieux" },
      { id: "witty", label_en: "Witty", label_fr: "Malicieux" },
    ],
  },
  {
    key: "meet_location",
    question_en: "Where do you usually meet people?",
    question_fr: "Où rencontres-tu les gens habituellement ?",
    options: [
      { id: "bar", label_en: "Bars & clubs", label_fr: "Bars & clubs" },
      { id: "cafe", label_en: "Cafés & work", label_fr: "Cafés & travail" },
      { id: "travel", label_en: "Travel", label_fr: "En voyage" },
      { id: "gym", label_en: "Gym & outdoors", label_fr: "Sport & extérieur" },
    ],
  },
];

export default function Quiz() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ lang?: string }>();
  const { user, signInGuest } = useAuth();
  const language: Lang = (params.lang === "fr" ? "fr" : "en") as Lang;
  const t = STRINGS[language];

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const current = STEPS[step];
  const progress = useMemo(() => (step + 1) / STEPS.length, [step]);

  const select = (val: string) => {
    setAnswers((p) => ({ ...p, [current.key]: val }));
  };

  const next = async () => {
    if (!answers[current.key]) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }
    // Final step: create guest user (if needed) + save quiz + push to taste
    setBusy(true);
    try {
      if (!user) {
        await signInGuest(language);
      }
      await api.saveQuiz(answers as any);
      router.replace(`/onboarding/taste?lang=${language}`);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed");
    } finally {
      setBusy(false);
    }
  };

  const back = () => {
    if (step === 0) router.back();
    else setStep(step - 1);
  };

  return (
    <View style={styles.container} testID={`quiz-step-${step + 1}`}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1490127252417-7c393f993ee4?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(10,10,11,0.7)", "rgba(10,10,11,0.97)"]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <View style={[styles.body, { paddingBottom: insets.bottom + 16 }]}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <TouchableOpacity onPress={back} style={styles.iconBtn} testID="quiz-back">
              <ArrowLeft size={20} color={COLORS.darkText} />
            </TouchableOpacity>
            <Text style={styles.stepLabel}>
              {step + 1} / {STEPS.length}
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>

          {/* Question */}
          <Text style={styles.question}>
            {language === "fr" ? current.question_fr : current.question_en}
          </Text>

          {/* Options */}
          <View style={styles.options}>
            {current.options.map((opt) => {
              const selected = answers[current.key] === opt.id;
              return (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.option, selected && styles.optionSelected]}
                  onPress={() => select(opt.id)}
                  testID={`quiz-${current.key}-${opt.id}`}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                    {language === "fr" ? opt.label_fr : opt.label_en}
                  </Text>
                  <View style={[styles.optionDot, selected && styles.optionDotSelected]}>
                    {selected && <Check size={14} color={COLORS.surface} strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ flex: 1 }} />

          <TouchableOpacity
            style={[styles.cta, (!answers[current.key] || busy) && { opacity: 0.5 }]}
            onPress={next}
            disabled={!answers[current.key] || busy}
            testID="quiz-next"
          >
            {busy ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {step === STEPS.length - 1
                    ? language === "fr"
                      ? "Voir mon icebreaker"
                      : "See my icebreaker"
                    : language === "fr"
                      ? "Suivant"
                      : "Continue"}
                </Text>
                <ArrowRight size={20} color={COLORS.surface} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  body: { flex: 1, paddingHorizontal: 24, gap: 16 },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  stepLabel: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "700", letterSpacing: 1 },
  progressTrack: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: { height: 4, backgroundColor: COLORS.accent, borderRadius: 999 },
  question: {
    color: COLORS.darkText,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -1,
    lineHeight: 36,
    marginTop: 18,
  },
  options: { gap: 10, marginTop: 16 },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
  },
  optionSelected: {
    backgroundColor: "rgba(255,90,54,0.18)",
    borderColor: COLORS.accent,
  },
  optionText: { color: COLORS.darkText, fontSize: 16, fontWeight: "700", letterSpacing: -0.2 },
  optionTextSelected: { color: COLORS.darkText },
  optionDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  optionDotSelected: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
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
});
