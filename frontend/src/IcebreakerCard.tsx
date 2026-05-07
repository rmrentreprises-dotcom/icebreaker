/**
 * Reusable IcebreakerCard - displays a single line with copy + favorite actions.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Heart, Copy, Check } from "lucide-react-native";
import { COLORS, STRINGS, Lang } from "./theme";
import { api } from "./api";

interface Props {
  text: string;
  tone?: string;
  category?: string;
  language?: string;
  source?: "library" | "ai";
  language_ui?: Lang;
  onSaved?: (id: string) => void;
  testID?: string;
}

export function IcebreakerCard({
  text,
  tone,
  category,
  language = "en",
  source = "library",
  language_ui = "en",
  onSaved,
  testID,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savingBusy, setSavingBusy] = useState(false);
  const t = STRINGS[language_ui];

  const onCopy = async () => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onFav = async () => {
    if (savingBusy) return;
    setSavingBusy(true);
    try {
      if (savedId) {
        await api.removeFavorite(savedId);
        setSavedId(null);
      } else {
        const r = await api.addFavorite(text, category, tone, language, source);
        setSavedId(r.favorite.id);
        if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSaved?.(r.favorite.id);
      }
    } catch (e) {
      // ignore
    } finally {
      setSavingBusy(false);
    }
  };

  const toneColor = tone && COLORS.tones[tone] ? COLORS.tones[tone] : COLORS.textTertiary;

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.toneRow}>
        {tone ? (
          <View style={[styles.toneTag, { backgroundColor: toneColor + "1A", borderColor: toneColor + "55" }]}>
            <View style={[styles.dot, { backgroundColor: toneColor }]} />
            <Text style={[styles.toneText, { color: toneColor }]}>
              {(t.tones[tone] || tone).toUpperCase()}
            </Text>
          </View>
        ) : (
          <View />
        )}
      </View>
      <Text style={styles.lineText} testID={testID ? `${testID}-text` : undefined}>{text}</Text>
      <View style={styles.actionRow}>
        <TouchableOpacity onPress={onCopy} style={styles.actionBtn} testID={testID ? `${testID}-copy` : undefined}>
          {copied ? <Check size={16} color={COLORS.tones.sweet} /> : <Copy size={16} color={COLORS.textSecondary} />}
          <Text style={[styles.actionText, copied && { color: COLORS.tones.sweet }]}>
            {copied ? t.copied : t.copy}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onFav} style={styles.actionBtn} testID={testID ? `${testID}-fav` : undefined}>
          <Heart
            size={16}
            color={savedId ? COLORS.accent : COLORS.textSecondary}
            fill={savedId ? COLORS.accent : "transparent"}
          />
          <Text style={[styles.actionText, savedId && { color: COLORS.accent, fontWeight: "700" }]}>
            {savedId ? t.saved : t.save}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  toneRow: { flexDirection: "row", justifyContent: "space-between" },
  toneTag: {
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
