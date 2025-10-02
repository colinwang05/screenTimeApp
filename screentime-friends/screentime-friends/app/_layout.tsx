import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "@hooks/useAuth";
import { View, ActivityIndicator } from "react-native";

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    // If logged out, show auth stack
    return <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)/login" />
    </Stack>;
  }

  // If logged in, show main app
  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate>
        <Stack screenOptions={{ headerShown: false }} />
      </AuthGate>
    </AuthProvider>
  );
}
