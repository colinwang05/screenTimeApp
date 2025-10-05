// app/chat/[groupId].tsx
import { useEffect, useRef, useState } from "react";
import { View, TextInput, Button, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { listenMessages, sendTextMessage, ChatMessage } from "@/lib/firestore";
import MessageItem from "@/components/MessageItem";

export default function ChatScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!groupId) return;
    const unsub = listenMessages(groupId, setMsgs);
    return unsub;
  }, [groupId]);

  async function handleSend() {
    if (!user || !groupId) return;
    await sendTextMessage(groupId, user.uid, text);
    setText("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <View style={{ flex: 1, padding: 12 }}>
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageItem me={item.senderId === user?.uid} text={item.text ?? ""} />
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message…"
            style={{ flex: 1, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }}
          />
          <Button title="Send" onPress={handleSend} disabled={!text.trim()} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
