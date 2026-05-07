/**
 * Library tab - browse curated icebreakers, filter by category & tone.
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { COLORS, STRINGS } from "../../src/theme";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";
import { IcebreakerCard } from "../../src/IcebreakerCard";

export default function LibraryScreen() {
  const { language } = useAuth();
  const insets = useSafeAreaInsets();
  const t = STRINGS[language];
  const [categories, setCategories] = useState<any[]>([]);
  const [tones, setTones] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTone, setActiveTone] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.categories().then((r) => {
      setCategories(r.categories);
      setTones(r.tones);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.library({
        category: activeCategory || undefined,
        tone: activeTone || undefined,
        language,
        limit: 100,
      });
      setItems(r.items);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeTone, language]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.appLabel}>LIBRARY</Text>
        <Text style={styles.title}>{t.library}</Text>
      </View>

      {/* Tone filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <Chip
          label={t.all}
          active={!activeTone}
          onPress={() => setActiveTone(null)}
          color={COLORS.textPrimary}
          testID="filter-tone-all"
        />
        {tones.map((tone) => (
          <Chip
            key={tone}
            label={t.tones[tone] || tone}
            active={activeTone === tone}
            onPress={() => setActiveTone(activeTone === tone ? null : tone)}
            color={COLORS.tones[tone]}
            testID={`filter-tone-${tone}`}
          />
        ))}
      </ScrollView>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        <Chip
          label={t.all}
          active={!activeCategory}
          onPress={() => setActiveCategory(null)}
          color={COLORS.textPrimary}
          variant="outline"
          testID="filter-cat-all"
        />
        {categories.map((c) => (
          <Chip
            key={c.id}
            label={language === "fr" ? c.name_fr : c.name_en}
            active={activeCategory === c.id}
            onPress={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
            color={COLORS.textPrimary}
            variant="outline"
            testID={`filter-cat-${c.id}`}
          />
        ))}
      </ScrollView>

      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        testID="library-list"
      >
        {loading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginTop: 32 }} />
        ) : (
          items.map((it) => (
            <IcebreakerCard
              key={it.id}
              text={it.text}
              tone={it.tone}
              category={it.category}
              language={it.language}
              source="library"
              language_ui={language}
              testID={`lib-${it.id}`}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({
  label,
  active,
  onPress,
  color,
  variant = "fill",
  testID,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  color: string;
  variant?: "fill" | "outline";
  testID?: string;
}) {
  if (variant === "outline") {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.chipOutline,
          active && { backgroundColor: COLORS.textPrimary, borderColor: COLORS.textPrimary },
        ]}
        testID={testID}
      >
        <Text
          style={[
            styles.chipOutlineText,
            active && { color: COLORS.surface },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: color, borderColor: color },
      ]}
      testID={testID}
    >
      <Text style={[styles.chipText, active && { color: COLORS.surface }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 8 },
  appLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    letterSpacing: 2,
    fontWeight: "800",
    marginBottom: 4,
  },
  title: { fontSize: 32, fontWeight: "900", color: COLORS.textPrimary, letterSpacing: -1.2 },
  chipsRow: { paddingHorizontal: 20, gap: 8, paddingVertical: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: { fontSize: 13, fontWeight: "700", color: COLORS.textPrimary },
  chipOutline: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "transparent",
    borderWidth: 1.2,
    borderColor: COLORS.border,
  },
  chipOutlineText: { fontSize: 13, fontWeight: "700", color: COLORS.textSecondary },
  list: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
});
