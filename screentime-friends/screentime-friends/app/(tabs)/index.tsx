import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator } from "react-native";
import { auth } from "@lib/firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User
} from "firebase/auth";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // watch auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      console.log(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 20, marginBottom: 16 }}>Login / Sign up</Text>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ borderWidth: 1, marginBottom: 12, padding: 8 }}
        />
        {error ? <Text style={{ color: "red" }}>{error}</Text> : null}
        <Button
          title="Sign Up"
          onPress={async () => {
            try {
              await createUserWithEmailAndPassword(auth, email, password);
              setError("");
            } catch (e: any) {
              setError(e.message);
            }
          }}
        />
        <View style={{ height: 8 }} />
        <Button
          title="Log In"
          onPress={async () => {
            try {
              await signInWithEmailAndPassword(auth, email, password);
              setError("");
            } catch (e: any) {
              setError(e.message);
            }
          }}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 16 }}>
        Welcome, {user.email}
      </Text>
      <Button title="Log out" onPress={() => signOut(auth)} />
    </View>
  );
}
