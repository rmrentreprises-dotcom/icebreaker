/**
 * Profile tab - account info, language toggle, premium status, sign out.
 */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Globe,
  Crown,
  LogOut,
  ChevronRight,
  Sparkles,
  Mail,
  Calendar,
} from "lucide-react-native";
import { COLORS, STRINGS, Lang } from "../../src/theme";
import { useAuth } from "../../src/auth";

export default function ProfileScreen() {
  const router = useRouter();
  const { user, language, setLanguage, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const t = STRINGS[language];

  const onSignOut = () => {
    Alert.alert(
      language === "fr" ? "Déconnexion" : "Sign out",
      language === "fr" ? "Tu veux vraiment te déconnecter ?" : "Are you sure you want to sign out?",
      [
        { text: language === "fr" ? "Annuler" : "Cancel", style: "cancel" },
        {
          text: t.signOut,
          style: "destructive",
          onPress: async () => {
            await signOut();
            router.replace("/");
          },
        },
      ]
    );
  };

  const onLang = async (lang: Lang) => {
    if (lang === language) return;
    try {
      await setLanguage(lang);
    } catch {
      // ignore
    }
  };

  const trialEnd = user?.trial_ends_at ? new Date(user.trial_ends_at) : null;
  const trialActive = trialEnd && trialEnd > new Date();

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.appLabel}>PROFILE</Text>
          <Text style={styles.title}>
            {user?.full_name || (user?.is_guest ? "Guest" : "You")}
          </Text>
          {user?.email && (
            <View style={styles.emailRow}>
              <Mail size={13} color={COLORS.textSecondary} />
              <Text style={styles.emailText}>{user.email}</Text>
            </View>
          )}
        </View>

        {/* Subscription card */}
        {user?.is_premium ? (
          <View style={styles.premiumCard} testID="premium-card">
            <LinearGradient
              colors={["#0A0A0B", "#27272A"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.crownBadge}>
              <Crown size={16} color="#FFD78A" />
            </View>
            <Text style={styles.premiumLabel}>{t.premium.toUpperCase()}</Text>
            <Text style={styles.premiumTitle}>
              {language === "fr" ? "Accès illimité" : "Unlimited access"}
            </Text>
            <Text style={styles.premiumSub}>
              {language === "fr"
                ? "Demandes IA illimitées · Tous les scénarios"
                : "Unlimited AI requests · All scenarios"}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => router.push("/paywall")}
            activeOpacity={0.9}
            testID="profile-upgrade"
          >
            <LinearGradient
              colors={[COLORS.accent, "#FF8055"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.crownBadge}>
              <Sparkles size={16} color={COLORS.surface} />
            </View>
            <Text style={[styles.premiumLabel, { color: "rgba(255,255,255,0.85)" }]}>
              {trialActive
                ? t.trial.toUpperCase()
                : (language === "fr" ? "GRATUIT" : "FREE")}
            </Text>
            <Text style={[styles.premiumTitle, { color: COLORS.surface }]}>{t.upgradeTitle}</Text>
            {trialActive && trialEnd && (
              <View style={styles.trialRow}>
                <Calendar size={12} color="rgba(255,255,255,0.85)" />
                <Text style={styles.trialText}>
                  {t.trialEnds(trialEnd.toLocaleDateString())}
                </Text>
              </View>
            )}
            <View style={styles.upgradeBtn}>
              <Text style={styles.upgradeBtnText}>{t.upgrade}</Text>
              <ChevronRight size={18} color={COLORS.surface} />
            </View>
          </TouchableOpacity>
        )}

        {/* Settings */}
        <Text style={styles.sectionLabel}>{language === "fr" ? "PRÉFÉRENCES" : "PREFERENCES"}</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingLabel}>
              <Globe size={18} color={COLORS.textSecondary} />
              <Text style={styles.settingText}>{t.language}</Text>
            </View>
            <View style={styles.langToggle}>
              <TouchableOpacity
                onPress={() => onLang("en")}
                style={[styles.langChip, language === "en" && styles.langChipActive]}
                testID="profile-lang-en"
              >
                <Text style={[styles.langChipText, language === "en" && styles.langChipTextActive]}>
                  EN
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => onLang("fr")}
                style={[styles.langChip, language === "fr" && styles.langChipActive]}
                testID="profile-lang-fr"
              >
                <Text style={[styles.langChipText, language === "fr" && styles.langChipTextActive]}>
                  FR
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats */}
        <Text style={styles.sectionLabel}>{language === "fr" ? "AUJOURD'HUI" : "TODAY"}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user?.lifetime_ai_calls_used || 0}</Text>
            <Text style={styles.statLabel}>
              {language === "fr" ? "appels IA" : "AI calls"}
            </Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>
              {user?.is_premium ? "∞" : (user?.lifetime_ai_calls_remaining ?? 0)}
            </Text>
            <Text style={styles.statLabel}>
              {language === "fr" ? "restants" : "remaining"}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signOut} onPress={onSignOut} testID="signout-btn">
          <LogOut size={18} color={COLORS.accent} />
          <Text style={styles.signOutText}>{t.signOut}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 4, gap: 14 },
  header: { paddingBottom: 4 },
  appLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    letterSpacing: 2,
    fontWeight: "800",
    marginBottom: 4,
  },
  title: { fontSize: 32, fontWeight: "900", color: COLORS.textPrimary, letterSpacing: -1.2 },
  emailRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  emailText: { color: COLORS.textSecondary, fontSize: 13 },
  premiumCard: {
    borderRadius: 22,
    padding: 22,
    overflow: "hidden",
    gap: 6,
    marginTop: 10,
  },
  upgradeCard: {
    borderRadius: 22,
    padding: 22,
    overflow: "hidden",
    gap: 6,
    marginTop: 10,
  },
  crownBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  premiumLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#FFD78A",
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: COLORS.surface,
    letterSpacing: -0.8,
  },
  premiumSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4 },
  trialRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  trialText: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "600" },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.18)",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  upgradeBtnText: { color: COLORS.surface, fontWeight: "800", fontSize: 14 },
  sectionLabel: {
    fontSize: 11,
    color: COLORS.textTertiary,
    letterSpacing: 2,
    fontWeight: "800",
    marginTop: 18,
  },
  settingsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  settingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  settingLabel: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingText: { color: COLORS.textPrimary, fontSize: 15, fontWeight: "600" },
  langToggle: { flexDirection: "row", gap: 6 },
  langChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  langChipActive: { backgroundColor: COLORS.textPrimary, borderColor: COLORS.textPrimary },
  langChipText: { fontWeight: "700", fontSize: 13, color: COLORS.textSecondary },
  langChipTextActive: { color: COLORS.surface },
  statsRow: { flexDirection: "row", gap: 12 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "flex-start",
  },
  statValue: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.textPrimary,
    letterSpacing: -1.2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: 2,
  },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: COLORS.accentSoft,
    marginTop: 18,
  },
  signOutText: { color: COLORS.accent, fontWeight: "800", fontSize: 15 },
});
