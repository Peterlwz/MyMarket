import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/state/AuthContext";
import { colors } from "@/theme/colors";
import { radius, shadows, spacing, typography } from "@/theme/spacing";

export default function AuthScreen() {
  const { authError, clearAuthError, signIn, signUp } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const [password, setPassword] = useState("");
  const [screenError, setScreenError] = useState("");

  const submit = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setScreenError("请填写邮箱和密码。");
      return;
    }

    try {
      setIsSubmitting(true);
      setScreenError("");
      clearAuthError();

      if (mode === "signUp") {
        await signUp(normalizedEmail, password);
      } else {
        await signIn(normalizedEmail, password);
      }

      router.replace("/profile");
    } catch (error) {
      setScreenError(error instanceof Error ? error.message : "登录失败，请稍后再试。");
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorMessage = screenError || authError;

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <View style={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons color={colors.charcoal} name="chevron-back" size={24} />
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>登录 Nest Market</Text>
            <Text style={styles.subtitle}>远程模式需要登录后才能发布、收藏和联系发布者。</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.modeSwitch}>
              <Pressable
                onPress={() => {
                  setMode("signIn");
                  setScreenError("");
                }}
                style={[styles.modeButton, mode === "signIn" && styles.modeButtonActive]}
              >
                <Text style={[styles.modeText, mode === "signIn" && styles.modeTextActive]}>登录</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMode("signUp");
                  setScreenError("");
                }}
                style={[styles.modeButton, mode === "signUp" && styles.modeButtonActive]}
              >
                <Text style={[styles.modeText, mode === "signUp" && styles.modeTextActive]}>注册</Text>
              </Pressable>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>邮箱</Text>
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={(value) => {
                  setEmail(value);
                  setScreenError("");
                }}
                placeholder="you@example.com"
                placeholderTextColor="#A19A90"
                style={styles.input}
                value={email}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>密码</Text>
              <TextInput
                onChangeText={(value) => {
                  setPassword(value);
                  setScreenError("");
                }}
                placeholder="至少 6 位"
                placeholderTextColor="#A19A90"
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>

            {errorMessage ? (
              <View style={styles.error}>
                <Ionicons color={colors.coral} name="alert-circle-outline" size={18} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Pressable disabled={isSubmitting} onPress={submit} style={[styles.submitButton, isSubmitting && styles.disabled]}>
              <Text style={styles.submitText}>
                {isSubmitting ? "处理中..." : mode === "signUp" ? "注册并登录" : "登录"}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignItems: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.md,
    ...shadows.card
  },
  content: {
    flex: 1,
    gap: spacing.lg,
    justifyContent: "center",
    padding: spacing.md
  },
  disabled: {
    opacity: 0.64
  },
  error: {
    alignItems: "center",
    backgroundColor: "#FFF1EE",
    borderColor: "#F4C7BE",
    borderRadius: radius.lg,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 12
  },
  errorText: {
    color: colors.coral,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  field: {
    gap: 8
  },
  header: {
    gap: 8
  },
  input: {
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.charcoal,
    fontSize: typography.bodyLarge,
    minHeight: 52,
    paddingHorizontal: 14
  },
  keyboard: {
    flex: 1
  },
  label: {
    color: colors.charcoal,
    fontSize: 13,
    fontWeight: "900"
  },
  modeButton: {
    alignItems: "center",
    borderRadius: radius.lg,
    flex: 1,
    minHeight: 40,
    justifyContent: "center"
  },
  modeButtonActive: {
    backgroundColor: colors.white,
    ...shadows.soft
  },
  modeSwitch: {
    backgroundColor: colors.sand,
    borderRadius: radius.lg,
    flexDirection: "row",
    gap: 4,
    padding: 4
  },
  modeText: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: "900"
  },
  modeTextActive: {
    color: colors.charcoal
  },
  root: {
    backgroundColor: colors.background,
    flex: 1
  },
  submitButton: {
    alignItems: "center",
    backgroundColor: colors.charcoal,
    borderRadius: radius.lg,
    minHeight: 52,
    justifyContent: "center"
  },
  submitText: {
    color: colors.white,
    fontSize: typography.bodyLarge,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.muted,
    fontSize: typography.body,
    fontWeight: "700",
    lineHeight: 20
  },
  title: {
    color: colors.charcoal,
    fontSize: typography.screenTitle,
    fontWeight: "900"
  }
});
