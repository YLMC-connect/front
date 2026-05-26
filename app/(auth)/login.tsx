import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { Screen } from "../../src/components/layout/Screen";
import { Button, TextField, Toast } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";

const schema = z.object({
  id: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();
  const { login } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { id: "ylmc", password: "password" },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => router.replace("/"),
    });
  });

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>열</Text>
        </View>
        <Text style={styles.title}>열린문 커넥트</Text>
        <Text style={styles.subtitle}>
          성도와 성도를 이어주는 교회 커뮤니티
        </Text>
      </View>

      <View style={styles.form}>
        <Controller
          control={control}
          name="id"
          render={({ field }) => (
            <TextField
              label="아이디"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.id?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          render={({ field }) => (
            <TextField
              label="비밀번호"
              value={field.value}
              onChangeText={field.onChange}
              secureTextEntry
              error={errors.password?.message}
            />
          )}
        />
        {login.error || params.variant === "error" ? (
          <Text style={styles.error}>
            {login.error?.message ?? "아이디 또는 비밀번호를 확인해주세요."}
          </Text>
        ) : null}
        <Button
          onPress={onSubmit}
          loading={login.isPending || params.variant === "loading"}
        >
          로그인
        </Button>
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>처음이신가요?</Text>
          <View style={styles.divider} />
        </View>
        <Link href="/signup" style={styles.signupButton}>
          회원가입
        </Link>
      </View>
      <Toast
        message={
          params.variant === "toast" ? "네트워크 연결을 확인해주세요" : ""
        }
      />
      <Text style={styles.copy}>© 열린문교회</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingTop: 64, paddingBottom: 14, gap: 10 },
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
  logoText: { color: "#fff", fontWeight: "900", fontSize: 36 },
  title: { color: theme.colors.ink, fontWeight: "900", fontSize: 24 },
  subtitle: { color: theme.colors.inkMute, fontWeight: "600", fontSize: 13 },
  form: { gap: 14, marginTop: 18 },
  error: { color: theme.colors.danger, fontSize: 13 },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
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
  copy: {
    color: theme.colors.inkHint,
    textAlign: "center",
    fontSize: 11,
    marginTop: "auto",
    paddingBottom: 10,
  },
});
