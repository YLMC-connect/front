import { zodResolver } from "@hookform/resolvers/zod";
import { router, useLocalSearchParams } from "expo-router";
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
import { MARKET_CATEGORIES } from "../../src/constants/domainOptions";
import { useCreateMarketItem } from "../../src/hooks/useMarketItems";
import {
  MarketCreateReferenceScreen,
  variantOf,
} from "../../src/components/prototype/OriginalMockScreens";
import type { MarketCategory } from "../../src/types/market";

const categories = MARKET_CATEGORIES.filter((item) => item.key !== "all") as {
  key: Exclude<MarketCategory, "all">;
  label: string;
}[];

const schema = z.object({
  title: z.string().min(2, "제목을 입력해주세요."),
  description: z.string().min(5, "물품 설명을 입력해주세요."),
  category: z.enum(["cloth", "home", "book", "food", "baby", "sport", "etc"]),
  condition: z.string().min(2, "물품 상태를 입력해주세요."),
  location: z.string().min(2, "전달 장소를 입력해주세요."),
  images: z.array(z.string()).min(1, "나눔 사진은 1장 이상 필요합니다.").max(5),
});

type FormValues = z.infer<typeof schema>;

export default function MarketNewModal() {
  const params = useLocalSearchParams<{ variant?: string }>();
  const createMarketItem = useCreateMarketItem();
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
      description: "",
      category: "baby",
      condition: "",
      location: "본당 1층 로비",
      images: [],
    },
  });

  const selectedCategory = watch("category");
  const onSubmit = handleSubmit((values) => {
    createMarketItem.mutate(values, {
      onSuccess: (item) =>
        router.replace({ pathname: "/market/[id]", params: { id: item.id } }),
    });
  });

  if (params.variant) {
    return <MarketCreateReferenceScreen variant={variantOf(params.variant)} />;
  }

  return (
    <Screen>
      <TopBar
        title="나눔 글쓰기"
        subtitle="무료 나눔만 등록할 수 있습니다"
        back
        onBack={() => router.back()}
      />
      <FormSection title="물품 정보">
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
        <Controller
          control={control}
          name="condition"
          render={({ field }) => (
            <TextField
              label="물품 상태"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.condition?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="location"
          render={({ field }) => (
            <TextField
              label="전달 장소"
              value={field.value}
              onChangeText={field.onChange}
              error={errors.location?.message}
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
      <Controller
        control={control}
        name="images"
        render={({ field }) => (
          <ImagePickerField
            label="나눔 사진"
            value={field.value}
            onChange={field.onChange}
            maxImages={5}
            error={errors.images?.message}
          />
        )}
      />
      <View style={styles.actions}>
        <Button variant="soft" onPress={() => router.back()}>
          취소
        </Button>
        <Button onPress={onSubmit} loading={createMarketItem.isPending}>
          등록
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: 8 },
});
