/**
 * Paywall - premium upgrade screen with Stripe checkout integration.
 * Dark luxury archetype.
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as WebBrowser from "expo-web-browser";
import { X, Crown, Check, Sparkles, Calendar, Infinity as InfinityIcon } from "lucide-react-native";
import { COLORS, STRINGS } from "../src/theme";
import { useAuth } from "../src/auth";
import { api } from "../src/api";

export default function Paywall() {
  const router = useRouter();
  const params = useLocalSearchParams<{ session_id?: string }>();
  const { user, language, refresh } = useAuth();
  const t = STRINGS[language];
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Verify any returning checkout session_id (deep link return)
  useEffect(() => {
    const sid = params.session_id;
    if (sid && user) {
      (async () => {
        setVerifying(true);
        try {
          const r = await api.checkoutStatus(sid as string);
          if (r.payment_status === "paid") {
            await refresh();
            Alert.alert(
              language === "fr" ? "Bienvenue Premium !" : "Welcome to Premium!",
              language === "fr" ? "Tu as maintenant accès illimité." : "You now have unlimited access."
            );
            router.back();
          }
        } catch {
          // ignore
        } finally {
          setVerifying(false);
        }
      })();
    }
  }, [params.session_id, user]);

  const subscribe = async () => {
    if (user?.is_guest) {
      Alert.alert(
        language === "fr" ? "Compte requis" : "Account required",
        language === "fr"
          ? "Crée un compte pour t'abonner."
          : "Please create an account to subscribe."
      );
      return;
    }
    setBusy(true);
    try {
      const r = await api.checkoutSession(plan);
      // Open Stripe checkout in browser
      if (Platform.OS === "web") {
        Linking.openURL(r.url);
      } else {
        const result = await WebBrowser.openBrowserAsync(r.url);
        // After dismiss, check status with the session id
        if (result.type === "dismiss" || result.type === "cancel") {
          try {
            const status = await api.checkoutStatus(r.session_id);
            if (status.payment_status === "paid") {
              await refresh();
              Alert.alert(
                language === "fr" ? "Bienvenue Premium !" : "Welcome to Premium!",
                language === "fr"
                  ? "Tu as maintenant accès illimité."
                  : "You now have unlimited access."
              );
              router.back();
            }
          } catch {
            // ignore
          }
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Checkout failed");
    } finally {
      setBusy(false);
    }
  };

  const benefits = t.upgradeBenefits;

  return (
    <View style={styles.container} testID="paywall-screen">
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1760224254117-7a40f7f03fe2?crop=entropy&cs=srgb&fm=jpg&q=85&w=1200",
        }}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      />
      <LinearGradient
        colors={["rgba(10,10,11,0.55)", "rgba(10,10,11,0.98)"]}
        style={StyleSheet.absoluteFillObject}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeBtn}
              testID="paywall-close"
            >
              <X size={20} color={COLORS.darkText} />
            </TouchableOpacity>
          </View>

          <View style={styles.crownWrap}>
            <View style={styles.crownBox}>
              <Crown size={28} color="#FFD78A" strokeWidth={2.2} />
            </View>
          </View>

          <Text style={styles.title}>{t.upgradeTitle}</Text>
          <Text style={styles.subtitle}>
            {language === "fr"
              ? "Lances toutes les conversations que tu veux. Sans limite."
              : "Spark every conversation. No limits."}
          </Text>

          <View style={styles.benefitsBlock}>
            {benefits.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>
                  <Check size={14} color="#FFD78A" strokeWidth={3} />
                </View>
                <Text style={styles.benefitText}>{b}</Text>
              </View>
            ))}
          </View>

          {/* Plan selector */}
          <View style={styles.plans}>
            <TouchableOpacity
              style={[styles.planCard, plan === "yearly" && styles.planCardActive]}
              onPress={() => setPlan("yearly")}
              testID="plan-yearly"
              activeOpacity={0.85}
            >
              <View style={styles.bestBadge}>
                <Text style={styles.bestBadgeText}>{t.bestValue}</Text>
              </View>
              <Text style={styles.planLabel}>{t.yearly.toUpperCase()}</Text>
              <Text style={styles.planPrice}>$79.99</Text>
              <Text style={styles.planSub}>
                {language === "fr" ? "$6.66/mois · économise 33%" : "$6.66/mo · save 33%"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.planCard, plan === "monthly" && styles.planCardActive]}
              onPress={() => setPlan("monthly")}
              testID="plan-monthly"
              activeOpacity={0.85}
            >
              <Text style={styles.planLabel}>{t.monthly.toUpperCase()}</Text>
              <Text style={styles.planPrice}>$9.99</Text>
              <Text style={styles.planSub}>
                {language === "fr" ? "facturé tous les mois" : "billed monthly"}
              </Text>
            </TouchableOpacity>
          </View>

          {!user?.is_premium && user?.trial_ends_at && new Date(user.trial_ends_at) > new Date() && (
            <View style={styles.trialNote}>
              <Calendar size={14} color="#FFD78A" />
              <Text style={styles.trialNoteText}>
                {t.trial} · {t.trialEnds(new Date(user.trial_ends_at).toLocaleDateString())}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.subscribeBtn, busy && { opacity: 0.7 }]}
            onPress={subscribe}
            disabled={busy || verifying}
            testID="subscribe-btn"
            activeOpacity={0.9}
          >
            {busy || verifying ? (
              <ActivityIndicator color={COLORS.surface} />
            ) : (
              <>
                <Sparkles size={18} color={COLORS.surface} />
                <Text style={styles.subscribeText}>{t.subscribeNow}</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.fineprint}>
            {language === "fr"
              ? "Paiement sécurisé via Stripe (mode test)."
              : "Secure payment via Stripe (test mode)."}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.darkBg },
  scroll: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 8, gap: 14 },
  topBar: { flexDirection: "row", justifyContent: "flex-end" },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  crownWrap: { alignItems: "center", marginTop: 12 },
  crownBox: {
    width: 70,
    height: 70,
    borderRadius: 22,
    backgroundColor: "rgba(255,215,138,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,215,138,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: COLORS.darkText,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -1.2,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 38,
  },
  subtitle: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  benefitsBlock: { marginTop: 24, gap: 14 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255,215,138,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,215,138,0.4)",
  },
  benefitText: { color: COLORS.darkText, fontSize: 15, fontWeight: "600", flex: 1 },
  plans: { flexDirection: "row", gap: 10, marginTop: 22 },
  planCard: {
    flex: 1,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.04)",
    gap: 4,
  },
  planCardActive: {
    borderColor: "#FFD78A",
    backgroundColor: "rgba(255,215,138,0.1)",
  },
  bestBadge: {
    position: "absolute",
    top: -10,
    right: 12,
    backgroundColor: "#FFD78A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  bestBadgeText: { fontSize: 10, fontWeight: "900", color: COLORS.darkBg, letterSpacing: 1 },
  planLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  planPrice: {
    color: COLORS.darkText,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  planSub: { color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 },
  trialNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 10,
  },
  trialNoteText: { color: "rgba(255,215,138,0.9)", fontSize: 12, fontWeight: "700" },
  subscribeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 18,
  },
  subscribeText: {
    color: COLORS.surface,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  fineprint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
  },
});
