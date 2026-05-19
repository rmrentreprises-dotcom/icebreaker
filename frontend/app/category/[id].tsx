/**
 * Category detail screen - shows icebreakers for a specific category.
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowLeft } from "lucide-react-native";
import { COLORS, STRINGS, CATEGORY_IMAGES } from "../../src/theme";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";
import { IcebreakerCard } from "../../src/IcebreakerCard";
import { usePaywall } from "../../src/usePaywall";

const SAMPLES_PER_CATEGORY = 3;

export default function CategoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user, language } = useAuth();
  const { open: openPaywall } = usePaywall();
  const isPremium = !!user?.is_premium;
  const insets = useSafeAreaInsets();
  const t = STRINGS[language];
  const [items, setItems] = useState<any[]>([]);
  const [activeTone, setActiveTone] = useState<string | null>(null);
  const [tones, setTones] = useState<string[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories().then((r) => {
      setTones(r.tones);
      const cat = r.categories.find((c: any) => c.id === id);
      if (cat) setCategoryName(language === "fr" ? cat.name_fr : cat.name_en);
    });
  }, [id, language]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.library({
        category: id as string,
        tone: activeTone || undefined,
        language,
        limit: 200,
      });
      setItems(r.items);
    } finally {
      setLoading(false);
    }
  }, [id, activeTone, language]);

  useEffect(() => {
    load();
  }, [load]);

  const img = CATEGORY_IMAGES[id as string];

  return (
    <View style={styles.container} testID={`category-${id}`}>
      <ImageBackground source={{ uri: img }} style={styles.hero} resizeMode="cover">
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.85)"]}
          style={StyleSheet.absoluteFillObject}
        />
        <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <View style={styles.heroInner}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              testID="cat-back"
            >
              <ArrowLeft size={20} color={COLORS.darkText} />
            </TouchableOpacity>
            <View style={styles.heroBottom}>
              <Text style={styles.heroLabel}>{t.categories.toUpperCase()}</Text>
              <Text style={styles.heroTitle}>{categoryName}</Text>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>

      <View style={styles.body}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          <TouchableOpacity
            onPress={() => setActiveTone(null)}
            style={[
              styles.chip,
              !activeTone && { backgroundColor: COLORS.textPrimary, borderColor: COLORS.textPrimary },
            ]}
            testID="cat-filter-all"
          >
            <Text style={[styles.chipText, !activeTone && { color: COLORS.surface }]}>{t.all}</Text>
          </TouchableOpacity>
          {tones.map((tone) => {
            const active = activeTone === tone;
            const tColor = COLORS.tones[tone];
            return (
              <TouchableOpacity
                key={tone}
                onPress={() => setActiveTone(active ? null : tone)}
                style={[styles.chip, active && { backgroundColor: tColor, borderColor: tColor }]}
                testID={`cat-filter-${tone}`}
              >
                <Text style={[styles.chipText, active && { color: COLORS.surface }]}>
                  {t.tones[tone] || tone}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <ScrollView
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.accent} style={{ marginTop: 32 }} />
          ) : items.length === 0 ? (
            <Text style={styles.emptyText}>
              {language === "fr" ? "Aucune ligne pour ce filtre." : "No lines for this filter."}
            </Text>
          ) : (
            items.map((it, idx) => {
              const locked = !isPremium && idx >= SAMPLES_PER_CATEGORY;
              return (
                <IcebreakerCard
                  key={it.id}
                  text={it.text}
                  tone={it.tone}
                  category={it.category}
                  language={it.language}
                  source="library"
                  language_ui={language}
                  locked={locked}
                  onLockedPress={() => openPaywall({ source: `cat_${id}` })}
                  testID={`cat-card-${it.id}`}
                />
              );
            })
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  hero: { height: 220 },
  heroInner: { flex: 1, padding: 20, justifyContent: "space-between" },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  heroBottom: { gap: 4 },
  heroLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "800",
  },
  heroTitle: {
    color: COLORS.darkText,
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: -1.4,
  },
  body: { flex: 1 },
  chipsRow: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: { fontSize: 13, fontWeight: "700", color: COLORS.textPrimary },
  list: { paddingHorizontal: 20, gap: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: "center", paddingTop: 40 },
});
