// app/(tabs)/index.tsx
import { View, Text, Button, Alert } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();

  async function handleLogout() {
    try {
      await signOut(auth);
      // AuthGate will redirect to /auth/login automatically
    } catch (e: any) {
      Alert.alert("Logout failed", e?.message ?? String(e));
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>
        Welcome{user?.email ? `, ${user.email}` : "!"}
      </Text>
      <Button title="Log out" onPress={handleLogout} />
    </View>
  );
}
