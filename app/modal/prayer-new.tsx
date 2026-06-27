import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
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

type FormValues = {
  title: string;
  content: string;
  visibility: (typeof visibilityTabs)[number]["key"];
};

type FormErrors = Partial<Record<"title" | "content", string>>;

function validatePrayerTopic(values: FormValues) {
  const errors: FormErrors = {};
  if (values.title.trim().length < 2) {
    errors.title = "기도제목 제목을 입력해주세요.";
  }
  if (values.content.trim().length < 5) {
    errors.content = "기도 내용을 입력해주세요.";
  }
  return errors;
}

export default function PrayerNewModal() {
  const { roomId = "" } = useLocalSearchParams<{ roomId: string }>();
  const createPrayerTopic = useCreatePrayerTopic(roomId);
  const [values, setValues] = useState<FormValues>({
    title: "",
    content: "",
    visibility: "named",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const onSubmit = () => {
    const nextErrors = validatePrayerTopic(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
  };

  return (
    <Screen>
      <TopBar
        title="기도제목 등록"
        subtitle="중보가 필요한 내용을 나눕니다"
        back
        onBack={() => router.back()}
      />
      <FormSection title="기도제목">
        <TextField
          label="제목"
          value={values.title}
          onChangeText={(title) =>
            setValues((current) => ({ ...current, title }))
          }
          error={errors.title}
        />
        <Textarea
          label="내용"
          value={values.content}
          onChangeText={(content) =>
            setValues((current) => ({ ...current, content }))
          }
          error={errors.content}
        />
      </FormSection>
      <FormSection title="작성자 표시">
        <SegmentedTabs
          items={visibilityTabs}
          active={values.visibility}
          onChange={(visibility) =>
            setValues((current) => ({ ...current, visibility }))
          }
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
