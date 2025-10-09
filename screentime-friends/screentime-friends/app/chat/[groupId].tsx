// app/chat/[groupId].tsx
import { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { listenMessages, sendTextMessage, ChatMessage } from "@/lib/firestore";
import MessageItem from "@/components/MessageItem";
import * as ImagePicker from "expo-image-picker";
import { getPresignedUrl, uploadToS3 } from "@/lib/aws/image-handler"; // ← your AWS helper

export default function ChatScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>();
  const { user } = useAuth();
  const [msgs, setMsgs] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Listen for chat messages in this group
  useEffect(() => {
    if (!groupId) return;
    const unsub = listenMessages(groupId, setMsgs);
    return unsub;
  }, [groupId]);

  // --- TEXT MESSAGE HANDLER ---
  async function handleSend() {
    if (!user || !groupId) return;
    if (!text.trim()) return;

    await sendTextMessage(groupId, user.uid, text);
    setText("");
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }

  // --- IMAGE UPLOAD HANDLER ---
  async function handlePickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      const fileName = uri.split("/").pop()!;
      const fileType = "image/jpeg";

      setUploading(true);

      // Step 1: ask your backend for a pre-signed URL
      const uploadUrl = await getPresignedUrl(fileName, fileType);

      // Step 2: upload to S3
      const s3Url = await uploadToS3(uri, uploadUrl, fileType);

      // Step 3: send Firestore message with image URL
      await sendTextMessage(groupId!, user!.uid, "", s3Url); // modify sendTextMessage to support imageUrl

      setUploading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (err) {
      console.error("Image upload failed:", err);
      setUploading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1, padding: 12 }}>
        <FlatList
          ref={listRef}
          data={msgs}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MessageItem
              me={item.senderId === user?.uid}
              text={item.text ?? ""}
              imageUrl={item.imageUrl ?? null}
            />
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* 📷 Image upload button */}
          <TouchableOpacity onPress={handlePickImage} disabled={uploading}>
            <Image
              source={{
                uri: "https://img.icons8.com/?size=100&id=85785&format=png", // simple camera icon
              }}
              style={{ width: 28, height: 28, opacity: uploading ? 0.5 : 1 }}
            />
          </TouchableOpacity>

          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message…"
            style={{
              flex: 1,
              borderWidth: 1,
              borderRadius: 20,
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          />
          <Button title="Send" onPress={handleSend} disabled={!text.trim()} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
