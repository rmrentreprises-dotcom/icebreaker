/**
 * Favorites tab - all saved icebreakers.
 */
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Trash2, Heart, Copy, Check } from "lucide-react-native";
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "expo-router";
import { COLORS, STRINGS } from "../../src/theme";
import { useAuth } from "../../src/auth";
import { api } from "../../src/api";

export default function FavoritesScreen() {
  const { language } = useAuth();
  const insets = useSafeAreaInsets();
  const t = STRINGS[language];
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.favorites();
      setItems(r.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onRemove = async (id: string) => {
    await api.removeFavorite(id);
    setItems((p) => p.filter((i) => i.id !== id));
  };

  const onCopy = async (id: string, text: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.appLabel}>SAVED</Text>
        <Text style={styles.title}>{t.favorites}</Text>
      </View>
      <ScrollView
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.accent} />
        }
        testID="favorites-list"
      >
        {loading ? (
          <ActivityIndicator color={COLORS.accent} style={{ marginTop: 32 }} />
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Heart size={32} color={COLORS.textTertiary} />
            <Text style={styles.emptyText}>{t.favoritesEmpty}</Text>
          </View>
        ) : (
          items.map((it) => {
            const tone = it.tone;
            const toneColor = tone && COLORS.tones[tone] ? COLORS.tones[tone] : COLORS.textTertiary;
            return (
              <View key={it.id} style={styles.card} testID={`fav-${it.id}`}>
                {tone && (
                  <View style={[styles.toneTag, { backgroundColor: toneColor + "1A", borderColor: toneColor + "55" }]}>
                    <View style={[styles.dot, { backgroundColor: toneColor }]} />
                    <Text style={[styles.toneText, { color: toneColor }]}>
                      {(t.tones[tone] || tone).toUpperCase()}
                    </Text>
                  </View>
                )}
                <Text style={styles.lineText}>{it.text}</Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onCopy(it.id, it.text)}
                    testID={`fav-${it.id}-copy`}
                  >
                    {copiedId === it.id ? (
                      <Check size={16} color={COLORS.tones.sweet} />
                    ) : (
                      <Copy size={16} color={COLORS.textSecondary} />
                    )}
                    <Text
                      style={[
                        styles.actionText,
                        copiedId === it.id && { color: COLORS.tones.sweet },
                      ]}
                    >
                      {copiedId === it.id ? t.copied : t.copy}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => onRemove(it.id)}
                    testID={`fav-${it.id}-remove`}
                  >
                    <Trash2 size={16} color={COLORS.accent} />
                    <Text style={[styles.actionText, { color: COLORS.accent, fontWeight: "700" }]}>
                      {language === "fr" ? "Retirer" : "Remove"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
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
  list: { paddingHorizontal: 20, paddingTop: 8, gap: 12 },
  empty: { alignItems: "center", padding: 60, gap: 12 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, textAlign: "center" },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  toneTag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  toneText: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  lineText: {
    color: COLORS.textPrimary,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  actionRow: {
    flexDirection: "row",
    gap: 16,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 4 },
  actionText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: "600" },
});
