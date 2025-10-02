// import { Image } from 'expo-image';
// import { Platform, StyleSheet } from 'react-native';

// import { HelloWave } from '@/components/hello-wave';
// import ParallaxScrollView from '@/components/parallax-scroll-view';
// import { ThemedText } from '@/components/themed-text';
// import { ThemedView } from '@/components/themed-view';
// import { Link } from 'expo-router';

// // export default function HomeScreen() {
// //   return (
// //     <ParallaxScrollView
// //       headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
// //       headerImage={
// //         <Image
// //           source={require('@/assets/images/partial-react-logo.png')}
// //           style={styles.reactLogo}
// //         />
// //       }>
// //       <ThemedView style={styles.titleContainer}>
// //         <ThemedText type="title">Welcome!</ThemedText>
// //         <HelloWave />
// //       </ThemedView>
// //       <ThemedView style={styles.stepContainer}>
// //         <ThemedText type="subtitle">Step 1: Try it</ThemedText>
// //         <ThemedText>
// //           Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
// //           Press{' '}
// //           <ThemedText type="defaultSemiBold">
// //             {Platform.select({
// //               ios: 'cmd + d',
// //               android: 'cmd + m',
// //               web: 'F12',
// //             })}
// //           </ThemedText>{' '}
// //           to open developer tools.
// //         </ThemedText>
// //       </ThemedView>
// //       <ThemedView style={styles.stepContainer}>
// //         <Link href="/modal">
// //           <Link.Trigger>
// //             <ThemedText type="subtitle">Step 2: Explore</ThemedText>
// //           </Link.Trigger>
// //           <Link.Preview />
// //           <Link.Menu>
// //             <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
// //             <Link.MenuAction
// //               title="Share"
// //               icon="square.and.arrow.up"
// //               onPress={() => alert('Share pressed')}
// //             />
// //             <Link.Menu title="More" icon="ellipsis">
// //               <Link.MenuAction
// //                 title="Delete"
// //                 icon="trash"
// //                 destructive
// //                 onPress={() => alert('Delete pressed')}
// //               />
// //             </Link.Menu>
// //           </Link.Menu>
// //         </Link>

// //         <ThemedText>
// //           {`Tap the Explore tab to learn more about what's included in this starter app.`}
// //         </ThemedText>
// //       </ThemedView>
// //       <ThemedView style={styles.stepContainer}>
// //         <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
// //         <ThemedText>
// //           {`When you're ready, run `}
// //           <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
// //           <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
// //           <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
// //           <ThemedText type="defaultSemiBold">app-example</ThemedText>.
// //         </ThemedText>
// //       </ThemedView>
// //     </ParallaxScrollView>
// //   );
// // }

// import { View, Text } from "react-native";
// // import ThemedText from "@components/themed-text"; // adjust if it's a named export
// //import theme from "@constants/theme";

// export default function HomeSmoke() {
//   return (
//     <View style={{ padding: 20, gap: 8 }}>
//       <Text>ENV OK: {process.env.EXPO_PUBLIC_FB_PROJECT_ID ? "yes" : "no"}</Text>
//       <ThemedText type="title">Aliases OK</ThemedText>
//       <Text>Theme keys: {Object.keys(ThemedText || {}).slice(0, 5).join(", ")}</Text>
//     </View>
//   );
// }


// const styles = StyleSheet.create({
//   titleContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   stepContainer: {
//     gap: 8,
//     marginBottom: 8,
//   },
//   reactLogo: {
//     height: 178,
//     width: 290,
//     bottom: 0,
//     left: 0,
//     position: 'absolute',
//   },
// });

import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator } from "react-native";
import { onAuthStateChanged, User, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "@lib/firebase";

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Watch auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
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

  // 🔹 If not logged in → show login/signup
  if (!user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 24, marginBottom: 12 }}>Login</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
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

  // 🔹 If logged in → show logged-in page
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24, marginBottom: 12 }}>
        Welcome {user.email} 🎉
      </Text>
      <Button title="Log out" onPress={() => signOut(auth)} />
    </View>
  );
}
