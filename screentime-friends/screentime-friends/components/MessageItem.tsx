// components/MessageItem.tsx
import { View, Text } from "react-native";

export default function MessageItem({
  me,
  text,
}: {
  me: boolean;
  text: string;
}) {
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
      <Text>{text}</Text>
    </View>
  );
}
