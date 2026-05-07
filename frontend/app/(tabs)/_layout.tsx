import React from "react";
import { Tabs } from "expo-router";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { Home, Library, Sparkles, Heart, User } from "lucide-react-native";
import { COLORS } from "../../src/theme";
import { useAuth } from "../../src/auth";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function TabsLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 0.3,
          marginTop: 2,
        },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: Platform.OS === "ios" ? 24 : 16,
          height: 68,
          borderRadius: 28,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: "rgba(0,0,0,0.06)",
          backgroundColor: "rgba(255,255,255,0.92)",
          marginHorizontal: 16,
          paddingTop: 10,
          paddingBottom: 10,
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
          elevation: 12,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFillObject} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home size={size - 2} color={color} strokeWidth={2.2} />,
          tabBarTestID: "tab-home",
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "Library",
          tabBarIcon: ({ color, size }) => <Library size={size - 2} color={color} strokeWidth={2.2} />,
          tabBarTestID: "tab-library",
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "AI",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.aiIconWrap}>
              <Sparkles size={size - 2} color={color} strokeWidth={2.4} />
            </View>
          ),
          tabBarTestID: "tab-assistant",
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => <Heart size={size - 2} color={color} strokeWidth={2.2} />,
          tabBarTestID: "tab-favorites",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User size={size - 2} color={color} strokeWidth={2.2} />,
          tabBarTestID: "tab-profile",
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  aiIconWrap: { alignItems: "center", justifyContent: "center" },
});
