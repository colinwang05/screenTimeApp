// app/_layout.tsx
import { Slot, useRouter, useSegments } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

function AuthGate() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments(); // ["auth", "login"] or ["(tabs)", "index"]

  useEffect(() => {
    if (loading) return;

    const inAuth = segments[0] === "auth";

    if (!user && !inAuth) {
      // logged OUT but not in /auth → go to login
      router.replace("/auth/login");
    } else if (user && inAuth) {
      // logged IN but on /auth → go to tabs
      router.replace("/(tabs)");
    }
  }, [user, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Always render current route; effect above will redirect as needed
  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
