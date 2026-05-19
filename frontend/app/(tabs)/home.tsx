/**
 * Home tab - daily icebreaker hero card + bento grid of categories.
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles, Crown, Flame, ArrowUpRight } from "lucide-react-native";
import { COLORS, STRINGS, CATEGORY_IMAGES } from "../../src/theme";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";
import { IcebreakerCard } from "../../src/IcebreakerCard";
import { usePaywall } from "../../src/usePaywall";

export default function HomeScreen() {
  const router = useRouter();
  const { user, language, refresh } = useAuth();
  const { open: openPaywall, shouldShowOnLaunch } = usePaywall();
  const insets = useSafeAreaInsets();
  const [daily, setDaily] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const t = STRINGS[language];

  const load = useCallback(async () => {
    try {
      const [d, c] = await Promise.all([
        api.daily(language).catch(() => null),
        api.categories(),
      ]);
      if (d) setDaily(d.icebreaker);
      setCategories(c.categories);
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    load();
  }, [load]);

  // Re-engagement: if non-premium user has seen a paywall before and it's been >24h, re-fire.
  useEffect(() => {
    if (!user || user.is_premium) return;
    (async () => {
      const shouldShow = await shouldShowOnLaunch();
      if (shouldShow) openPaywall({ source: "launch_24h" });
    })();
    // Only run once per Home mount per session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.is_premium]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([load(), refresh()]);
    setRefreshing(false);
  };

  const greeting = user?.full_name ? `Hi, ${user.full_name.split(" ")[0]}` : t.tagline;
  const callsRemaining = user?.lifetime_ai_calls_remaining ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
        testID="home-scroll"
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.appLabel}>{t.appName.toUpperCase()}</Text>
            <Text style={styles.heading}>{greeting}</Text>
          </View>
          {!user?.is_premium && (
            <TouchableOpacity
              style={styles.crownBtn}
              onPress={() => openPaywall({ source: "home_crown" })}
              testID="home-upgrade"
            >
              <Crown size={16} color={COLORS.accent} strokeWidth={2.4} />
            </TouchableOpacity>
          )}
        </View>

        {/* Status pill */}
        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Flame size={12} color={COLORS.accent} />
            <Text style={styles.statusPillText}>
              {user?.is_premium
                ? t.premium
                : callsRemaining > 0
                  ? (language === "fr" ? "1 essai gratuit dispo" : "1 free preview left")
                  : t.upgrade}
            </Text>
          </View>
        </View>

        {/* Daily card */}
        <Text style={styles.sectionLabel}>{t.daily}</Text>
        <Text style={styles.sectionSubtitle}>{t.dailySubtitle}</Text>
        {loading ? (
          <View style={styles.dailySkeleton}>
            <ActivityIndicator color={COLORS.accent} />
          </View>
        ) : daily ? (
          <View testID="daily-card">
            <IcebreakerCard
              text={daily.text}
              tone={daily.tone}
              category={daily.category}
              language={daily.language}
              source="library"
              language_ui={language}
            />
          </View>
        ) : null}

        {/* AI Quick Action */}
        <TouchableOpacity
          style={styles.aiCta}
          onPress={() => router.push("/(tabs)/assistant")}
          testID="home-ai-cta"
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[COLORS.accent, "#FF8055"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiCtaInner}
          >
            <View style={styles.aiCtaIcon}>
              <Sparkles size={22} color={COLORS.surface} strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.aiCtaTitle}>{t.aiTitle}</Text>
              <Text style={styles.aiCtaSubtitle}>{t.aiSubtitle}</Text>
            </View>
            <ArrowUpRight size={22} color={COLORS.surface} />
          </LinearGradient>
        </TouchableOpacity>

        {/* Categories bento */}
        <Text style={styles.sectionLabel}>{t.categories}</Text>
        <View style={styles.grid}>
          {categories.map((cat, idx) => (
            <CategoryCard
              key={cat.id}
              cat={cat}
              language={language}
              big={idx === 0 || idx === 5}
              onPress={() => router.push(`/category/${cat.id}`)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryCard({
  cat,
  language,
  big,
  onPress,
}: {
  cat: any;
  language: string;
  big?: boolean;
  onPress: () => void;
}) {
  const name = language === "fr" ? cat.name_fr : cat.name_en;
  const img = CATEGORY_IMAGES[cat.id];
  return (
    <TouchableOpacity
      style={[styles.catCard, big && styles.catCardBig]}
      onPress={onPress}
      activeOpacity={0.9}
      testID={`cat-${cat.id}`}
    >
      <ImageBackground
        source={{ uri: img }}
        style={StyleSheet.absoluteFillObject}
        imageStyle={{ borderRadius: 18 }}
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.85)"]}
        style={[StyleSheet.absoluteFillObject, { borderRadius: 18 }]}
      />
      <View style={styles.catInner}>
        <Text style={styles.catName}>{name}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 8, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", marginTop: 4, marginBottom: 4 },
  appLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    letterSpacing: 2,
    fontWeight: "800",
    marginBottom: 4,
  },
  heading: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -1.2,
  },
  crownBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.accentSoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.accent + "55",
  },
  statusRow: { flexDirection: "row" },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusPillText: { fontSize: 12, color: COLORS.textPrimary, fontWeight: "700" },
  sectionLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    letterSpacing: 2,
    fontWeight: "800",
    marginTop: 16,
  },
  sectionSubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: -10 },
  dailySkeleton: {
    height: 140,
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  aiCta: { borderRadius: 20, overflow: "hidden", marginTop: 4 },
  aiCtaInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 18,
  },
  aiCtaIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  aiCtaTitle: { color: COLORS.surface, fontSize: 17, fontWeight: "900", letterSpacing: -0.4 },
  aiCtaSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 12,
  },
  catCard: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: COLORS.darkSurface,
  },
  catCardBig: { width: "100%", aspectRatio: 16 / 9 },
  catInner: { flex: 1, justifyContent: "flex-end", padding: 14 },
  catName: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
});
