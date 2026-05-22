import { zodResolver } from "@hookform/resolvers/zod";
import { Link, router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text, View } from "react-native";
import { z } from "zod";
import { Screen } from "../../src/components/layout/Screen";
import { Button, Card, TextField } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";

const schema = z.object({
  id: z.string().min(1, "아이디를 입력해주세요."),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
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

      <Card style={styles.form}>
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
        {login.error ? (
          <Text style={styles.error}>{login.error.message}</Text>
        ) : null}
        <Button onPress={onSubmit} loading={login.isPending}>
          로그인
        </Button>
        <Link href="/signup" style={styles.signupLink}>
          아직 계정이 없으신가요? 회원가입
        </Link>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: "center", paddingTop: 54, paddingBottom: 12, gap: 10 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
  },
  logoText: { color: "#fff", fontWeight: "900", fontSize: 34 },
  title: { color: theme.colors.ink, fontWeight: "900", fontSize: 28 },
  subtitle: { color: theme.colors.inkMute, fontWeight: "600" },
  form: { gap: 16 },
  error: { color: theme.colors.danger, fontSize: 13 },
  signupLink: {
    color: theme.colors.primaryDeep,
    textAlign: "center",
    fontWeight: "700",
    paddingVertical: 6,
  },
});
