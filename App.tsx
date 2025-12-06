import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-purple-500">
      <Text className="text-white text-2xl font-bold">SkyFrame 🎨</Text>
      <StatusBar style="auto" />
    </View>
  );
}
