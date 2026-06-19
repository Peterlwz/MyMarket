import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { AuthProvider } from "@/state/AuthContext";
import { ListingsProvider } from "@/state/ListingsContext";
import { MessagesProvider } from "@/state/MessagesContext";
import { colors } from "@/theme/colors";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <AuthProvider>
        <ListingsProvider>
          <MessagesProvider>
            <StatusBar backgroundColor={colors.background} style="dark" />
            <Stack screenOptions={{ contentStyle: styles.content, headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth" />
              <Stack.Screen name="listing/[id]" />
              <Stack.Screen name="chat/[id]" />
              <Stack.Screen name="edit-listing/[id]" />
              <Stack.Screen name="+not-found" />
            </Stack>
          </MessagesProvider>
        </ListingsProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background
  },
  root: {
    flex: 1
  }
});
