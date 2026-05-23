import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, Text } from "react-native";
import { z } from "zod";
import { Screen } from "../../src/components/layout/Screen";
import { Button, Card, TextField, TopBar } from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
import { useAuth } from "../../src/hooks/useAuth";

const schema = z.object({
  id: z.string().min(3, "아이디는 3자 이상 입력해주세요."),
  password: z.string().min(8, "비밀번호는 8자 이상 입력해주세요."),
  userName: z.string().min(2, "이름을 입력해주세요."),
  phone: z.string().min(10, "연락처를 입력해주세요."),
  email: z
    .string()
    .email("이메일 형식이 올바르지 않습니다.")
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof schema>;

export default function SignupScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();
  const { signup } = useAuth();
  const variant = params.variant;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { id: "", password: "", userName: "", phone: "", email: "" },
  });

  const onSubmit = handleSubmit((values) => {
    signup.mutate(values, {
      onSuccess: () => router.replace("/"),
    });
  });

  return (
    <Screen>
      <TopBar
        title="회원가입"
        subtitle="목장 정보는 교회 DB 기준으로 자동 매칭됩니다"
        back
        onBack={() => router.back()}
      />
      <Card style={styles.form}>
        <Controller
          control={control}
          name="id"
          render={({ field }) => (
            <TextField
              label="아이디"
              value={field.value}
              onChangeText={field.onChange}
              error={
                errors.id?.message ??
                (variant === "id-dup"
                  ? "이미 사용 중인 아이디입니다."
                  : undefined)
              }
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
              error={
                errors.password?.message ??
                (variant === "pw-error"
                  ? "비밀번호는 8자 이상이며 영문/숫자를 포함해야 합니다."
                  : undefined)
              }
            />
          )}
        />
        <Controller
          control={control}
          name="userName"
          render={({ field }) => (
            <TextField
              label="이름"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.userName?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field }) => (
            <TextField
              label="연락처"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="phone-pad"
              error={
                errors.phone?.message ??
                (variant === "phone-error"
                  ? "연락처 형식이 올바르지 않습니다."
                  : variant === "phone-dup"
                    ? "이미 등록된 연락처입니다."
                    : undefined)
              }
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <TextField
              label="이메일 선택"
              value={field.value}
              onChangeText={field.onChange}
              keyboardType="email-address"
              error={errors.email?.message}
            />
          )}
        />
        {signup.error ? (
          <Text style={styles.error}>{signup.error.message}</Text>
        ) : null}
        <Button
          onPress={onSubmit}
          loading={signup.isPending || variant === "loading"}
        >
          가입 완료
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { gap: 14 },
  error: { color: theme.colors.danger, fontSize: 13 },
});
