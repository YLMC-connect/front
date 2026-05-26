import { MaterialIcons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput as NativeTextInput,
  View,
} from "react-native";
import { z } from "zod";
import { Screen } from "../../src/components/layout/Screen";
import { Button, Toast } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";
import { variantOf } from "../../src/components/prototype/OriginalMockScreens";

const schema = z.object({
  id: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();
  const variant = variantOf(params.variant);
  const isDefault = variant === "default";
  const isError = variant === "error";
  const isLoading = variant === "loading";
  const isToast = variant === "toast";
  const { login } = useAuth();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: isDefault ? "" : "gracekim",
      password: isDefault ? "" : "password",
    },
  });
  const values = watch();
  const isFilled = values.id.length > 0 && values.password.length > 0;

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => router.replace("/"),
    });
  });

  return (
    <Screen scroll={false} padded={false}>
      <View style={styles.root}>
        <View style={styles.hero}>
          <View style={styles.logo}>
            <MaterialIcons name="door-front" size={38} color="#fff" />
          </View>
          <Text style={styles.title}>열린문 커넥트</Text>
          <Text style={styles.subtitle}>교회 가족과 함께하는 일상</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="id"
            render={({ field }) => (
              <AuthField
                label="아이디"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="아이디를 입력해주세요"
                error={errors.id?.message}
                hasError={isError}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <AuthField
                label="비밀번호"
                value={field.value}
                onChangeText={field.onChange}
                placeholder="비밀번호를 입력해주세요"
                secureTextEntry
                error={errors.password?.message}
                hasError={isError}
                trailingIcon="visibility-off"
              />
            )}
          />
          {login.error || isError ? (
            <Text style={styles.error}>
              {login.error?.message ??
                "아이디 또는 비밀번호가 올바르지 않습니다"}
            </Text>
          ) : null}
          <Button
            onPress={onSubmit}
            loading={login.isPending || isLoading}
            disabled={!isFilled && isDefault}
          >
            로그인
          </Button>
          <Pressable style={styles.findPassword}>
            <Text style={styles.findPasswordText}>비밀번호 찾기</Text>
          </Pressable>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>처음이신가요?</Text>
            <View style={styles.divider} />
          </View>
          <Link href="/signup" style={styles.signupButton}>
            회원가입
          </Link>
        </View>
        <View style={styles.spacer} />
        <Text style={styles.copy}>© 열린문교회</Text>
      </View>
      <Toast
        message={isToast ? "네트워크 연결을 확인해주세요" : ""}
        icon="sync"
      />
    </Screen>
  );
}

function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  hasError = false,
  trailingIcon,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  hasError?: boolean;
  trailingIcon?: keyof typeof MaterialIcons.glyphMap;
}) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputBox, hasError ? styles.inputBoxError : null]}>
        <NativeTextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.inkMute}
          secureTextEntry={secureTextEntry}
          style={styles.input}
        />
        {trailingIcon ? (
          <MaterialIcons
            name={trailingIcon}
            size={20}
            color={theme.colors.inkMute}
          />
        ) : null}
      </View>
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  hero: { alignItems: "center", marginTop: 28 },
  logo: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    shadowColor: "rgba(91,122,176,0.55)",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 6,
  },
  title: {
    color: theme.colors.ink,
    fontWeight: "900",
    fontSize: 22,
    marginTop: 16,
  },
  subtitle: { color: theme.colors.inkMute, fontWeight: "600", fontSize: 13 },
  form: { gap: 14, marginTop: 36 },
  fieldLabel: {
    marginBottom: 6,
    color: theme.colors.inkSoft,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  inputBox: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface2,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputBoxError: {
    borderColor: theme.colors.danger,
    backgroundColor: "#FDF4F1",
  },
  input: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: theme.fontSize.md,
    padding: 0,
  },
  error: { color: theme.colors.danger, fontSize: 13 },
  fieldError: { marginTop: 6, color: theme.colors.danger, fontSize: 12 },
  findPassword: {
    alignSelf: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  findPasswordText: { color: theme.colors.inkMute, fontSize: 13 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
    marginBottom: 2,
  },
  divider: { flex: 1, height: 1, backgroundColor: theme.colors.line },
  dividerText: { color: theme.colors.inkHint, fontSize: 12, fontWeight: "600" },
  signupButton: {
    color: theme.colors.primaryDeep,
    textAlign: "center",
    fontWeight: "800",
    paddingVertical: 15,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.colors.lineStrong,
    backgroundColor: theme.colors.surface,
  },
  spacer: { flex: 1 },
  copy: {
    color: theme.colors.inkHint,
    textAlign: "center",
    fontSize: 11,
    paddingVertical: 12,
    paddingBottom: 28,
  },
});
