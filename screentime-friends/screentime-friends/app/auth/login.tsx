import { useState } from "react";
import { View, TextInput, Button, Text } from "react-native";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

function fmtFirebaseError(codeOrMsg: string) {
  // Optional: small friendly mapper (expand as you like)
  if (codeOrMsg.includes("auth/invalid-email")) return "Invalid email address.";
  if (codeOrMsg.includes("auth/email-already-in-use")) return "Email already in use.";
  if (codeOrMsg.includes("auth/weak-password")) return "Password should be at least 6 characters.";
  if (codeOrMsg.includes("auth/invalid-credential") || codeOrMsg.includes("auth/wrong-password"))
    return "Incorrect email or password.";
  return codeOrMsg;
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState<"login" | "signup" | null>(null);

  async function doAuth(kind: "login" | "signup") {
    try {
      setSubmitting(kind);
      setError("");
      if (kind === "signup") {
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      // Success: AuthGate will switch stacks automatically.
    } catch (e: any) {
      setError(fmtFirebaseError(e?.code || e?.message || "Auth error"));
    } finally {
      setSubmitting(null);
    }
  }

  const disabled = !email || !password || !!submitting;

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600", marginBottom: 8 }}>Login / Sign up</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, borderRadius: 8, padding: 12 }}
      />

      {!!error && <Text style={{ color: "red" }}>{error}</Text>}

      <Button
        title={submitting === "signup" ? "Signing up..." : "Sign Up"}
        disabled={disabled}
        onPress={() => doAuth("signup")}
      />
      <Button
        title={submitting === "login" ? "Logging in..." : "Log In"}
        disabled={disabled}
        onPress={() => doAuth("login")}
      />
    </View>
  );
}
