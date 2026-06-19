import { router } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { colors } from "@/theme/colors";

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>页面不存在</Text>
      <Pressable onPress={() => router.replace("/")} style={styles.button}>
        <Text style={styles.buttonText}>回到首页</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.charcoal,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 24
  },
  buttonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900"
  },
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    gap: 16,
    justifyContent: "center"
  },
  title: {
    color: colors.charcoal,
    fontSize: 20,
    fontWeight: "900"
  }
});
