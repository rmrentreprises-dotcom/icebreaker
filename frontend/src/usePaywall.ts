/**
 * usePaywall hook — tracks paywall views in AsyncStorage and routes the user
 * to the correct paywall variant based on engagement count.
 *
 * Escalation pattern (from product playbook):
 *   Tap 1: full hard-sell paywall (`default`)
 *   Tap 2-3: lighter sheet style (`sheet`)
 *   Tap 4+: full layout but with discount variant (`discount`)
 *   Cold open >24h since last view: re-fire paywall on launch
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "./auth";

const COUNT_KEY = "paywall_tap_count";
const LAST_VIEW_KEY = "paywall_last_view";
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export type PaywallVariant = "default" | "sheet" | "discount";

export function nextVariant(count: number): PaywallVariant {
  if (count >= 4) return "discount";
  if (count >= 2) return "sheet";
  return "default";
}

export function usePaywall() {
  const router = useRouter();
  const { language } = useAuth();

  const open = useCallback(
    async (extraParams: Record<string, string> = {}) => {
      const raw = (await AsyncStorage.getItem(COUNT_KEY)) || "0";
      const count = parseInt(raw, 10) || 0;
      const next = count + 1;
      const variant = nextVariant(next);
      await AsyncStorage.multiSet([
        [COUNT_KEY, String(next)],
        [LAST_VIEW_KEY, String(Date.now())],
      ]);
      const params = new URLSearchParams({
        lang: language,
        variant,
        ...extraParams,
      });
      router.push(`/paywall?${params.toString()}`);
    },
    [router, language]
  );

  /** True if the user hasn't seen a paywall in >24h. */
  const shouldShowOnLaunch = useCallback(async () => {
    const last = await AsyncStorage.getItem(LAST_VIEW_KEY);
    if (!last) return false; // first ever — only fire on real engagement
    return Date.now() - parseInt(last, 10) > TWENTY_FOUR_HOURS_MS;
  }, []);

  /** Call after successful subscription to reset escalation. */
  const resetEscalation = useCallback(async () => {
    await AsyncStorage.multiRemove([COUNT_KEY, LAST_VIEW_KEY]);
  }, []);

  return { open, shouldShowOnLaunch, resetEscalation };
}
