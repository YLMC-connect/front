import { AppIcon } from "@/components/ui/app-icon";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  Button,
  ConfirmDialog,
  ModalFormSection as Section,
  ModalFormTextInput as FormInput,
  TopBar,
} from "../../src/components/ui";
import { theme } from "../../src/constants/theme";
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

export default function PrayerNewModal() {
  const router = useRouter();
  const { roomId = "" } = useLocalSearchParams<{ roomId: string }>();
  const createPrayerTopic = useCreatePrayerTopic(roomId);
  const [values, setValues] = useState<FormValues>({
    title: "",
    content: "",
    visibility: "named",
  });
  const [error, setError] = useState<string>();
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const isDirty =
    values.title.trim().length > 0 ||
    values.content.trim().length > 0 ||
    values.visibility !== "named";

  const close = () => {
    if (isDirty) {
      setShowCloseConfirm(true);
      return;
    }
    router.back();
  };

  const onSubmit = () => {
    setError(undefined);
    if (values.title.trim().length < 2) {
      setError("기도제목 제목을 2자 이상 입력해주세요.");
      return;
    }
    if (values.content.trim().length < 5) {
      setError("기도 내용을 5자 이상 입력해주세요.");
      return;
    }

    createPrayerTopic.mutate(
      {
        title: values.title,
        content: values.content,
        isAnonymous: values.visibility === "anonymous",
      },
      {
        onSuccess: () => {
          if (roomId) {
            router.replace({
              pathname: "/prayer/[id]",
              params: { id: roomId },
            });
          } else {
            router.back();
          }
        },
        onError: (submitError) => {
          setError(
            submitError instanceof Error
              ? submitError.message
              : "기도제목을 등록하지 못했습니다.",
          );
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
      testID="prayer-form-screen"
    >
      <TopBar
        title="기도제목 등록"
        back
        onBack={close}
        testID="prayer-form-header"
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={styles.body}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View>
            <Section label="작성자 표시" required>
              <View style={styles.optionRow}>
                {visibilityTabs.map((option) => {
                  const selected = values.visibility === option.key;
                  return (
                    <Pressable
                      key={option.key}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        setError(undefined);
                        setValues((current) => ({
                          ...current,
                          visibility: option.key,
                        }));
                      }}
                      style={[styles.option, selected ? styles.optionOn : null]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected ? styles.optionTextOn : null,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </Section>

            <Section label="제목" required hint={`${values.title.length}/30`}>
              <FormInput
                accessibilityLabel="기도제목 제목"
                value={values.title}
                onChangeText={(title) => {
                  setError(undefined);
                  setValues((current) => ({ ...current, title }));
                }}
                maxLength={30}
                placeholder="기도제목 제목을 입력해주세요 (최대 30자)"
              />
            </Section>

            <Section
              label="기도 내용"
              required
              hint={`${values.content.length}/500`}
            >
              <FormInput
                accessibilityLabel="기도 내용"
                multiline
                value={values.content}
                onChangeText={(content) => {
                  setError(undefined);
                  setValues((current) => ({ ...current, content }));
                }}
                maxLength={500}
                placeholder="함께 기도받고 싶은 내용을 자세히 적어주세요"
                textAlignVertical="top"
              />
            </Section>

            <View style={styles.infoBox}>
              <AppIcon name="info" size={16} color={theme.colors.primaryDeep} />
              <Text style={styles.infoText}>
                작성한 기도제목은 중보기도팀 검토 후 기도방에 게시됩니다.
              </Text>
            </View>
            {error ? (
              <Text accessibilityRole="alert" style={styles.errorText}>
                {error}
              </Text>
            ) : null}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>

      <View pointerEvents="box-none" style={styles.footer}>
        <LinearGradient
          colors={[
            "rgba(246,247,249,0)",
            "rgba(246,247,249,0.78)",
            "rgba(246,247,249,0.96)",
          ]}
          locations={[0, 0.38, 1]}
          pointerEvents="none"
          style={StyleSheet.absoluteFill}
          testID="prayer-new-bottom-bar"
        />
        <Button onPress={onSubmit} loading={createPrayerTopic.isPending}>
          기도제목 등록
        </Button>
      </View>

      <ConfirmDialog
        visible={showCloseConfirm}
        title="작성을 그만둘까요?"
        message="입력한 내용은 저장되지 않습니다."
        confirmText="나가기"
        danger
        onCancel={() => setShowCloseConfirm(false)}
        onConfirm={() => router.back()}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: theme.layout.screenX,
  },
  body: { paddingBottom: 112 },
  optionRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: theme.layout.screenX,
  },
  option: {
    minHeight: 44,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    backgroundColor: theme.colors.surface,
  },
  optionOn: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  optionText: { color: theme.colors.inkSoft, fontSize: theme.fontSize.sm },
  optionTextOn: {
    color: theme.colors.primaryDeep,
    fontWeight: theme.fontWeight.bold,
  },
  infoBox: {
    marginHorizontal: theme.layout.screenX,
    marginTop: 22,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primarySoft,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  infoText: {
    flex: 1,
    color: theme.colors.primaryDeep,
    fontSize: theme.fontSize.sm,
    lineHeight: 19,
  },
  errorText: {
    marginHorizontal: theme.layout.screenX,
    marginTop: 12,
    color: theme.colors.danger,
    fontSize: theme.fontSize.sm,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: theme.layout.screenX,
    paddingTop: 24,
    paddingBottom: Platform.OS === "ios" ? 28 : 16,
  },
});
