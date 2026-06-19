import { StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "@/theme/colors";
import { radius, spacing, typography } from "@/theme/spacing";

type FormFieldProps = {
  error?: string;
  keyboardType?: "default" | "numeric";
  label: string;
  multiline?: boolean;
  onChangeText?: (value: string) => void;
  placeholder: string;
  value?: string;
};

export function FormField({
  error,
  keyboardType = "default",
  label,
  multiline = false,
  onChangeText,
  placeholder,
  value
}: FormFieldProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        keyboardType={keyboardType}
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A19A90"
        style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
        value={value}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs
  },
  errorText: {
    color: colors.coral,
    fontSize: typography.caption,
    fontWeight: "700",
    lineHeight: 16
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radius.lg,
    borderWidth: 1,
    color: colors.charcoal,
    fontSize: typography.bodyLarge,
    minHeight: 48,
    paddingHorizontal: 14
  },
  inputError: {
    borderColor: colors.coral
  },
  label: {
    color: colors.charcoal,
    fontSize: typography.body,
    fontWeight: "800"
  },
  multiline: {
    minHeight: 108,
    paddingTop: 14,
    textAlignVertical: "top"
  }
});
