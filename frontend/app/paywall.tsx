/**
 * Paywall — 3 plans (Weekly $6.99 w/ 3-day trial, Yearly $39.99 default, Lifetime $59.99).
 * Yearly is default-selected with "Save 85%" badge; Weekly anchors the price.
 * On subscribe → Stripe checkout via WebBrowser. On dismiss → tabs/home (library still works).
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
import { X, Crown, Check, Sparkles, Infinity as InfinityIcon, Image as ImageIcon } from "lucide-react-native";
import { COLORS, STRINGS, Lang } from "../src/theme";
import { useAuth } from "../src/auth";
import { api } from "../src/api";

type Plan = "weekly" | "yearly" | "lifetime";

const PLAN_META: Record<Plan, { price: string; sub_en: string; sub_fr: string; badge?: string }> = {
  weekly: {
    price: "$6.99",
    sub_en: "per week · 3-day free trial",
    sub_fr: "par semaine · essai 3 jours",
  },
  yearly: {
    price: "$39.99",
    sub_en: "per year · $3.33/mo · Save 85%",
    sub_fr: "par an · $3.33/mois · -85%",
    badge: "Save 85%",
  },
  lifetime: {
    price: "$59.99",
    sub_en: "one-time payment · forever",
    sub_fr: "paiement unique · à vie",
  },
};

export default function Paywall() {
  const router = useRouter();
  const params = useLocalSearchParams<{ session_id?: string; lang?: string; from?: string }>();
  const { user, language: ctxLang, refresh } = useAuth();
  const language: Lang = (params.lang === "fr" ? "fr" : params.lang === "en" ? "en" : ctxLang) as Lang;
  const t = STRINGS[language];

  const [plan, setPlan] = useState<Plan>("yearly");
  const [busy, setBusy] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const fromOnboarding = params.from === "onboarding";

  useEffect(() => {
    const sid = params.session_id;
    if (sid && user) {
      (async () => {
        setVerifying(true);
        try {
          const r = await api.checkoutStatus(sid as string);
          if (r.payment_status === "paid") {
            await refresh();
            router.replace("/(tabs)/home");
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
      if (Platform.OS === "web") {
        Linking.openURL(r.url);
      } else {
        const result = await WebBrowser.openBrowserAsync(r.url);
        if (result.type === "dismiss" || result.type === "cancel") {
          try {
            const status = await api.checkoutStatus(r.session_id);
            if (status.payment_status === "paid") {
              await refresh();
              router.replace("/(tabs)/home");
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

  const close = () => {
    if (fromOnboarding) {
      // Let them into the app (library still works) even if they skip the paywall.
      router.replace("/(tabs)/home");
    } else {
      router.back();
    }
  };

  const benefits = [
    {
      icon: <InfinityIcon size={14} color="#FFD78A" strokeWidth={2.8} />,
      label_en: "Unlimited AI-powered icebreakers",
      label_fr: "Icebreakers IA illimités",
    },
    {
      icon: <Crown size={14} color="#FFD78A" strokeWidth={2.8} />,
      label_en: "10,000+ ready-to-use lines, any setting",
      label_fr: "10 000+ phrases prêtes, tout contexte",
    },
    {
      icon: <Sparkles size={14} color="#FFD78A" strokeWidth={2.8} />,
      label_en: "Personalized to your style & goals",
      label_fr: "Adapté à ton style et tes objectifs",
    },
    {
      icon: <ImageIcon size={14} color="#FFD78A" strokeWidth={2.8} />,
      label_en: "Save favorites & full request history",
      label_fr: "Favoris illimités & historique complet",
    },
  ];

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
            <TouchableOpacity onPress={close} style={styles.closeBtn} testID="paywall-close">
              <X size={20} color={COLORS.darkText} />
            </TouchableOpacity>
          </View>

          <View style={styles.crownWrap}>
            <View style={styles.crownBox}>
              <Crown size={28} color="#FFD78A" strokeWidth={2.2} />
            </View>
          </View>

          <Text style={styles.title}>
            {language === "fr"
              ? "Débloque les icebreakers illimités"
              : "Unlock unlimited icebreakers"}
          </Text>
          <Text style={styles.subtitle}>
            {language === "fr"
              ? "10 000+ phrases prêtes + IA illimitée pour chaque moment."
              : "10,000+ ready lines + unlimited AI for any moment."}
          </Text>

          <View style={styles.benefitsBlock}>
            {benefits.map((b, i) => (
              <View key={i} style={styles.benefitRow}>
                <View style={styles.benefitIcon}>{b.icon}</View>
                <Text style={styles.benefitText}>
                  {language === "fr" ? b.label_fr : b.label_en}
                </Text>
              </View>
            ))}
          </View>

          {/* Plans */}
          <View style={styles.plans}>
            {(["yearly", "weekly", "lifetime"] as Plan[]).map((p) => {
              const meta = PLAN_META[p];
              const selected = plan === p;
              return (
                <TouchableOpacity
                  key={p}
                  style={[styles.planCard, selected && styles.planCardActive]}
                  onPress={() => setPlan(p)}
                  testID={`plan-${p}`}
                  activeOpacity={0.85}
                >
                  {meta.badge && (
                    <View style={styles.bestBadge}>
                      <Text style={styles.bestBadgeText}>
                        {language === "fr" ? "ÉCONOMISE 85%" : meta.badge.toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View style={styles.planLeft}>
                    <Text style={styles.planLabel}>
                      {p === "weekly"
                        ? language === "fr" ? "HEBDO" : "WEEKLY"
                        : p === "yearly"
                          ? language === "fr" ? "ANNUEL" : "YEARLY"
                          : language === "fr" ? "À VIE" : "LIFETIME"}
                    </Text>
                    <Text style={styles.planSub}>
                      {language === "fr" ? meta.sub_fr : meta.sub_en}
                    </Text>
                  </View>
                  <View style={styles.planRight}>
                    <Text style={styles.planPrice}>{meta.price}</Text>
                    <View style={[styles.radio, selected && styles.radioActive]}>
                      {selected && <Check size={12} color={COLORS.surface} strokeWidth={3} />}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

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
              <Text style={styles.subscribeText}>
                {plan === "weekly"
                  ? language === "fr"
                    ? "Démarrer l'essai gratuit"
                    : "Start free trial"
                  : language === "fr"
                    ? "S'abonner"
                    : "Continue"}
              </Text>
            )}
          </TouchableOpacity>

          {user?.is_guest && (
            <Text style={styles.guestNote}>
              {language === "fr"
                ? "Crée un compte d'abord (Profil → Créer un compte)."
                : "Create an account first (Profile → Create account)."}
            </Text>
          )}

          <Text style={styles.fineprint}>
            {language === "fr"
              ? "Annulable à tout moment. Paiement sécurisé Stripe (mode test)."
              : "Cancel anytime. Secure payment via Stripe (test mode)."}
          </Text>

          {fromOnboarding && (
            <TouchableOpacity onPress={close} testID="paywall-maybe-later">
              <Text style={styles.maybeLater}>
                {language === "fr" ? "Plus tard — juste parcourir" : "Maybe later — just browse"}
              </Text>
            </TouchableOpacity>
          )}
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
  crownWrap: { alignItems: "center", marginTop: 4 },
  crownBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "rgba(255,215,138,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,215,138,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: COLORS.darkText,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 32,
  },
  subtitle: {
    color: "rgba(255,255,255,0.72)",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  benefitsBlock: { marginTop: 18, gap: 10 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  benefitIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(255,215,138,0.18)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,215,138,0.4)",
  },
  benefitText: { color: COLORS.darkText, fontSize: 14, fontWeight: "600", flex: 1 },
  plans: { gap: 10, marginTop: 18 },
  planCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  planCardActive: {
    borderColor: "#FFD78A",
    backgroundColor: "rgba(255,215,138,0.1)",
  },
  bestBadge: {
    position: "absolute",
    top: -10,
    right: 14,
    backgroundColor: "#FFD78A",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  bestBadgeText: { fontSize: 9, fontWeight: "900", color: COLORS.darkBg, letterSpacing: 1 },
  planLeft: { flex: 1, gap: 3 },
  planLabel: {
    color: COLORS.darkText,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  planSub: { color: "rgba(255,255,255,0.65)", fontSize: 12 },
  planRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  planPrice: { color: COLORS.darkText, fontSize: 18, fontWeight: "900", letterSpacing: -0.4 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { backgroundColor: COLORS.accent, borderColor: COLORS.accent },
  subscribeBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: COLORS.accent,
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 14,
  },
  subscribeText: {
    color: COLORS.surface,
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  guestNote: { color: "rgba(255,215,138,0.9)", fontSize: 12, textAlign: "center", marginTop: 6 },
  fineprint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    textAlign: "center",
    marginTop: 6,
  },
  maybeLater: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    paddingVertical: 14,
  },
});
