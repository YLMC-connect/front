import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { Screen } from "../../src/components/layout/Screen";
import {
  Button,
  FormSection,
  SegmentedTabs,
  TextField,
  Textarea,
  TopBar,
} from "../../src/components/ui";
import { useCreatePrayerTopic } from "../../src/hooks/usePrayers";

const visibilityTabs = [
  { key: "named", label: "이름 표시" },
  { key: "anonymous", label: "익명" },
] as const;

const schema = z.object({
  title: z.string().min(2, "기도제목 제목을 입력해주세요."),
  content: z.string().min(5, "기도 내용을 입력해주세요."),
  visibility: z.enum(["named", "anonymous"]),
});

type FormValues = z.infer<typeof schema>;

export default function PrayerNewModal() {
  const { roomId = "" } = useLocalSearchParams<{ roomId: string }>();
  const createPrayerTopic = useCreatePrayerTopic(roomId);
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      content: "",
      visibility: "named",
    },
  });

  const visibility = watch("visibility");
  const onSubmit = handleSubmit((values) => {
    createPrayerTopic.mutate(
      {
        title: values.title,
        content: values.content,
        isAnonymous: values.visibility === "anonymous",
      },
      {
        onSuccess: () =>
          router.replace({ pathname: "/prayer/[id]", params: { id: roomId } }),
      },
    );
  });

  return (
    <Screen>
      <TopBar
        title="기도제목 등록"
        subtitle="중보가 필요한 내용을 나눕니다"
        back
        onBack={() => router.back()}
      />
      <FormSection title="기도제목">
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <TextField
              label="제목"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.title?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="content"
          render={({ field }) => (
            <Textarea
              label="내용"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.content?.message}
            />
          )}
        />
      </FormSection>
      <FormSection title="작성자 표시">
        <SegmentedTabs
          items={visibilityTabs}
          active={visibility}
          onChange={(key) => setValue("visibility", key)}
        />
      </FormSection>
      <View style={styles.actions}>
        <Button variant="soft" onPress={() => router.back()}>
          취소
        </Button>
        <Button onPress={onSubmit} loading={createPrayerTopic.isPending}>
          등록
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: 8 },
});
