// app/(tabs)/groups.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "expo-router";
import { createGroup, joinGroup, listenMyGroups } from "@/lib/firestore";

export default function Groups() {
  const { user } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<{ id: string; name: string }[]>([]);
  const [newName, setNewName] = useState("");
  const [joinId, setJoinId] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsub = listenMyGroups(user.uid, setRows);
    return unsub;
  }, [user]);

  async function handleCreate() {
    if (!user) return;
    const name = newName.trim();
    if (!name) return;
    try {
      const gid = await createGroup(name, user.uid);
      setNewName("");
      router.push(`/chat/${gid}`);
    } catch (e: any) {
      Alert.alert("Create failed", e.message ?? String(e));
    }
  }

  async function handleJoin() {
    if (!user) return;
    const gid = joinId.trim();
    if (!gid) return;
    try {
      await joinGroup(gid, user.uid);
      setJoinId("");
      router.push(`/chat/${gid}`);
    } catch (e: any) {
      Alert.alert("Join failed", e.message ?? String(e));
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Your Groups</Text>

      <FlatList
        data={rows}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/chat/${item.id}`)}
            style={{ padding: 12, borderWidth: 1, borderRadius: 10, marginBottom: 8 }}
          >
            <Text style={{ fontSize: 16 }}>{item.name}</Text>
            <Text style={{ color: "#666" }}>{item.id}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>No groups yet — create or join below.</Text>}
      />

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "600" }}>Create Group</Text>
        <TextInput
          placeholder="Group name"
          value={newName}
          onChangeText={setNewName}
          style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
        />
        <Button title="Create" onPress={handleCreate} />
      </View>

      <View style={{ gap: 8 }}>
        <Text style={{ fontWeight: "600" }}>Join by Group ID</Text>
        <TextInput
          placeholder="groupId"
          value={joinId}
          onChangeText={setJoinId}
          style={{ borderWidth: 1, borderRadius: 8, padding: 10 }}
        />
        <Button title="Join" onPress={handleJoin} />
      </View>
    </View>
  );
}
