import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { StyleSheet, View } from "react-native";
import { z } from "zod";
import { Screen } from "../../src/components/layout/Screen";
import {
  Button,
  FormSection,
  HorizontalChips,
  ImagePickerField,
  TextField,
  Textarea,
  TopBar,
} from "../../src/components/ui";
import { GROUP_CATEGORIES } from "../../src/constants/domainOptions";
import { useCreateGroup } from "../../src/hooks/useGroups";
import type { GroupCategory } from "../../src/types/group";

const categories = GROUP_CATEGORIES.filter((item) => item.key !== "all") as {
  key: Exclude<GroupCategory, "all">;
  label: string;
}[];

const schema = z.object({
  name: z.string().min(2, "소모임명을 입력해주세요."),
  description: z.string().min(8, "소모임 설명을 입력해주세요."),
  category: z.enum([
    "bible",
    "pray",
    "volunteer",
    "hobby",
    "sport",
    "cell",
    "mission",
    "carpool",
    "etc",
  ]),
  maxMembers: z
    .number()
    .min(2, "최소 2명 이상이어야 합니다.")
    .max(100, "최대 100명까지 가능합니다."),
  schedule: z.string().min(2, "일정을 입력해주세요."),
  location: z.string().min(2, "장소를 입력해주세요."),
  coverImage: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function GroupNewModal() {
  const createGroup = useCreateGroup();
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      category: "hobby",
      maxMembers: 10,
      schedule: "",
      location: "교회",
      coverImage: undefined,
    },
  });

  const selectedCategory = watch("category");
  const onSubmit = handleSubmit((values) => {
    createGroup.mutate(values, {
      onSuccess: (group) =>
        router.replace({ pathname: "/group/[id]", params: { id: group.id } }),
    });
  });

  return (
    <Screen>
      <TopBar
        title="소모임 개설"
        subtitle="봉사와 카풀도 소모임으로 운영합니다"
        back
        onBack={() => router.back()}
      />
      <FormSection title="기본 정보">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <TextField
              label="소모임명"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Textarea
              label="설명"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.description?.message}
            />
          )}
        />
      </FormSection>
      <FormSection title="카테고리">
        <HorizontalChips
          items={categories}
          active={selectedCategory}
          onChange={(key) => setValue("category", key)}
        />
      </FormSection>
      <FormSection title="운영 정보">
        <Controller
          control={control}
          name="maxMembers"
          render={({ field }) => (
            <TextField
              label="최대 인원"
              value={String(field.value)}
              onChangeText={(text) => field.onChange(Number(text) || 0)}
              keyboardType="number-pad"
              error={errors.maxMembers?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="schedule"
          render={({ field }) => (
            <TextField
              label="일정"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.schedule?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="location"
          render={({ field }) => (
            <TextField
              label="장소"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.location?.message}
            />
          )}
        />
      </FormSection>
      <Controller
        control={control}
        name="coverImage"
        render={({ field }) => (
          <ImagePickerField
            label="대표 이미지"
            value={field.value ? [field.value] : []}
            onChange={(uris) => field.onChange(uris[0])}
            maxImages={1}
          />
        )}
      />
      <View style={styles.actions}>
        <Button variant="soft" onPress={() => router.back()}>
          취소
        </Button>
        <Button onPress={onSubmit} loading={createGroup.isPending}>
          개설
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: 8 },
});
