import { View, Text, Image } from "react-native";

type Props = {
  me: boolean;
  text?: string | null;
  imageUrl?: string | null;
};

export default function MessageItem({ me, text, imageUrl }: Props) {
  return (
    <View
      style={{
        alignSelf: me ? "flex-end" : "flex-start",
        backgroundColor: me ? "#DCF8C6" : "#EEE",
        padding: 10,
        borderRadius: 12,
        marginVertical: 4,
        maxWidth: "80%",
      }}
    >
      {/* 🖼️ Show image if exists */}
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{
            width: 200,
            height: 200,
            borderRadius: 10,
            marginBottom: text ? 6 : 0,
          }}
          resizeMode="cover"
        />
      ) : null}

      {/* 💬 Show text if exists */}
      {text ? <Text style={{ color: "#000" }}>{text}</Text> : null}
    </View>
  );
}
