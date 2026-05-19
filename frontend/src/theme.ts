/**
 * App-wide constants: theme, fonts, API helper, i18n strings.
 */
import { Platform } from "react-native";
import * as Localization from "expo-localization";

/**
 * Detect the device's preferred language.
 * Returns "fr" if any of the user's locales starts with "fr", otherwise "en".
 * (Spec: French device → French; everything else → English.)
 */
export function getDeviceLanguage(): "en" | "fr" {
  try {
    const locales = Localization.getLocales?.() || [];
    for (const l of locales) {
      const tag = (l.languageTag || l.languageCode || "").toLowerCase();
      if (tag.startsWith("fr")) return "fr";
    }
    // Fallback path: try Intl on web / older runtimes
    const fallback =
      (typeof Intl !== "undefined" &&
        Intl.DateTimeFormat().resolvedOptions().locale) ||
      "";
    if (fallback.toLowerCase().startsWith("fr")) return "fr";
  } catch {
    // ignore - default to english
  }
  return "en";
}

export const COLORS = {
  background: "#F8F9FA",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F3F5",
  textPrimary: "#0A0A0B",
  textSecondary: "#52525B",
  textTertiary: "#A1A1AA",
  accent: "#FF5A36",
  accentSoft: "#FFE3DC",
  border: "#E4E4E7",
  // Dark / premium
  darkBg: "#0A0A0B",
  darkSurface: "#18181B",
  darkBorder: "#27272A",
  darkText: "#FFFFFF",
  darkTextSecondary: "#A1A1AA",
  // Tone colors
  tones: {
    funny: "#F59E0B",
    romantic: "#EC4899",
    casual: "#3B82F6",
    bold: "#FF5A36",
    witty: "#8B5CF6",
    sweet: "#10B981",
  } as Record<string, string>,
};

export const FONTS = {
  // System fallbacks - design says Outfit/Manrope. We'll use system stack since no
  // expo-font setup yet; design language stays consistent via weight/tracking.
  heading: Platform.select({ ios: "System", android: "sans-serif", default: "System" }),
  body: Platform.select({ ios: "System", android: "sans-serif", default: "System" }),
};

export const API_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL || ""}/api`;

export const STRINGS = {
  en: {
    appName: "Icebreaker AI",
    tagline: "Never run out of things to say.",
    onboardWelcome: "Never run out of\nthings to say.",
    onboardSubtitle:
      "10,000+ ready-to-use openers + unlimited AI-powered icebreakers for any moment.",
    continueGuest: "Skip — just browse",
    getStarted: "Get started",
    signIn: "Sign in",
    signUp: "Create account",
    email: "Email",
    password: "Password",
    fullName: "Your name",
    language: "Language",
    home: "Home",
    library: "Library",
    assistant: "Assistant",
    favorites: "Favorites",
    profile: "Profile",
    daily: "Daily Spark",
    dailySubtitle: "Your free icebreaker for today",
    categories: "Pick a setting",
    aiTitle: "Live AI Assistant",
    aiSubtitle: "Describe the scene. Get the best lines.",
    contextPlaceholder:
      "e.g. We're 2 Canadians on vacation, want to approach 3 girls at the beach. One is wearing a black hat...",
    locationPlaceholder: "Location (optional): beach, café, club...",
    generate: "Generate icebreakers",
    generating: "Crafting your lines...",
    favoritesEmpty: "No favorites yet. Save lines you love.",
    historyEmpty: "Your AI requests will appear here.",
    tip: "Delivery tip",
    callsLeft: (n: number) => `${n} free AI calls left today`,
    upgrade: "Upgrade to Premium",
    upgradeTitle: "Unlock unlimited icebreakers",
    upgradeBenefits: [
      "Unlimited AI assistant requests",
      "Full library of 540+ curated lines",
      "Save unlimited favorites",
      "New scenarios every week",
    ],
    monthly: "Monthly",
    yearly: "Yearly",
    bestValue: "Best value",
    subscribeNow: "Subscribe now",
    signOut: "Sign out",
    save: "Save",
    saved: "Saved",
    copy: "Copy",
    copied: "Copied",
    tones: {
      funny: "Funny",
      romantic: "Romantic",
      casual: "Casual",
      bold: "Bold",
      witty: "Witty",
      sweet: "Sweet",
    } as Record<string, string>,
    all: "All",
    history: "Recent requests",
    trial: "Free trial active",
    trialEnds: (d: string) => `Trial ends ${d}`,
    premium: "Premium",
    free: "Free",
  },
  fr: {
    appName: "Icebreaker AI",
    tagline: "Ne jamais être à court de mots.",
    onboardWelcome: "Ne jamais être\nà court de mots.",
    onboardSubtitle:
      "Plus de 10 000 phrases prêtes à l'emploi + icebreakers IA illimités pour chaque moment.",
    continueGuest: "Passer — juste parcourir",
    getStarted: "Commencer",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    email: "Email",
    password: "Mot de passe",
    fullName: "Votre prénom",
    language: "Langue",
    home: "Accueil",
    library: "Bibliothèque",
    assistant: "Assistant",
    favorites: "Favoris",
    profile: "Profil",
    daily: "Étincelle du jour",
    dailySubtitle: "Votre icebreaker gratuit du jour",
    categories: "Choisis un lieu",
    aiTitle: "Assistant IA en direct",
    aiSubtitle: "Décris la scène. Reçois les meilleures lignes.",
    contextPlaceholder:
      "ex. On est 2 Canadiens en vacances, on veut aborder 3 filles à la plage. L'une porte un chapeau noir...",
    locationPlaceholder: "Lieu (optionnel) : plage, café, club...",
    generate: "Générer les icebreakers",
    generating: "Création en cours...",
    favoritesEmpty: "Aucun favori. Sauvegarde les lignes que tu aimes.",
    historyEmpty: "Tes demandes IA apparaîtront ici.",
    tip: "Conseil de livraison",
    callsLeft: (n: number) => `${n} appels IA gratuits aujourd'hui`,
    upgrade: "Passer Premium",
    upgradeTitle: "Débloque les icebreakers illimités",
    upgradeBenefits: [
      "Demandes IA illimitées",
      "Bibliothèque complète de 540+ lignes",
      "Favoris illimités",
      "Nouveaux scénarios chaque semaine",
    ],
    monthly: "Mensuel",
    yearly: "Annuel",
    bestValue: "Meilleur prix",
    subscribeNow: "S'abonner",
    signOut: "Déconnexion",
    save: "Sauver",
    saved: "Sauvé",
    copy: "Copier",
    copied: "Copié",
    tones: {
      funny: "Drôle",
      romantic: "Romantique",
      casual: "Détendu",
      bold: "Audacieux",
      witty: "Malicieux",
      sweet: "Doux",
    } as Record<string, string>,
    all: "Tous",
    history: "Demandes récentes",
    trial: "Essai gratuit actif",
    trialEnds: (d: string) => `Fin de l'essai le ${d}`,
    premium: "Premium",
    free: "Gratuit",
  },
};

export type Lang = keyof typeof STRINGS;

// Categories metadata-side images (use design guideline urls)
export const CATEGORY_IMAGES: Record<string, string> = {
  beach:
    "https://images.unsplash.com/photo-1697809311064-c7a3852206ee?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
  club:
    "https://images.unsplash.com/photo-1597320775230-cca0c1954f20?crop=entropy&cs=srgb&fm=jpg&q=85&w=800",
  cafe: "https://images.pexels.com/photos/16266201/pexels-photo-16266201.jpeg?auto=compress&w=800",
  gym: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80",
  park: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
  travel:
    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80",
  bar: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=80",
  restaurant:
    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80",
  bookstore:
    "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=800&q=80",
  concert:
    "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80",
  gallery:
    "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=800&q=80",
  coworking:
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
  wedding:
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80",
  hotel:
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80",
  transit:
    "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=800&q=80",
};
