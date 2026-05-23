import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../layout/Screen";
import {
  Avatar,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  TextField,
  Textarea,
  Toast,
  TopBar,
  VisualCover,
} from "../ui";
import { theme } from "../../constants/theme";

export type IconName = ComponentProps<typeof MaterialIcons>["name"];

export function usePrototypeVariant(defaultVariant = "default") {
  const params = useLocalSearchParams<{ variant?: string }>();
  return params.variant ?? defaultVariant;
}

export function PrototypeScreen({
  title,
  children,
  subtitle,
  right,
  back = true,
  toast,
  dialog,
  testID,
}: {
  title: string;
  children: ReactNode;
  subtitle?: string;
  right?: ReactNode;
  back?: boolean;
  toast?: string;
  dialog?: {
    visible: boolean;
    title: string;
    message?: string;
    confirmText?: string;
    danger?: boolean;
  };
  testID?: string;
}) {
  return (
    <Screen padded={false}>
      <TopBar
        testID={testID}
        title={title}
        subtitle={subtitle}
        back={back}
        onBack={() => router.back()}
        right={right}
      />
      <View style={styles.body}>{children}</View>
      <Toast message={toast} />
      {dialog ? (
        <ConfirmDialog
          visible={dialog.visible}
          title={dialog.title}
          message={dialog.message}
          confirmText={dialog.confirmText}
          onCancel={() => router.back()}
          onConfirm={() => router.back()}
        />
      ) : null}
    </Screen>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function MenuList({ children }: { children: ReactNode }) {
  return <Card style={styles.menuList}>{children}</Card>;
}

export function MenuRow({
  icon,
  title,
  subtitle,
  value,
  danger,
  onPress,
}: {
  icon: IconName;
  title: string;
  subtitle?: string;
  value?: string;
  danger?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuRow,
        pressed && onPress ? styles.pressed : null,
      ]}
    >
      <MaterialIcons
        name={icon}
        size={22}
        color={danger ? theme.colors.danger : theme.colors.inkSoft}
      />
      <View style={styles.menuText}>
        <Text style={[styles.menuTitle, danger ? styles.dangerText : null]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      {value ? <Text style={styles.menuValue}>{value}</Text> : null}
      {onPress ? (
        <MaterialIcons
          name="chevron-right"
          size={20}
          color={theme.colors.inkHint}
        />
      ) : null}
    </Pressable>
  );
}

export function ProfileHero({
  name,
  subtitle,
  value,
  actionLabel,
  onAction,
}: {
  name: string;
  subtitle: string;
  value?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card style={styles.profileHero}>
      <Avatar name={name} size={60} />
      <View style={styles.profileText}>
        <Text style={styles.profileName}>{name}</Text>
        <Text style={styles.profileSubtitle}>{subtitle}</Text>
      </View>
      {value ? <Badge tone="primary">{value}</Badge> : null}
      {actionLabel ? (
        <Pressable onPress={onAction} style={styles.smallPill}>
          <Text style={styles.smallPillText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

export function StatStrip({
  items,
}: {
  items: { label: string; value: string | number }[];
}) {
  return (
    <View style={styles.statStrip}>
      {items.map((item) => (
        <Card key={item.label} style={styles.statCard}>
          <Text style={styles.statValue}>{item.value}</Text>
          <Text style={styles.statLabel}>{item.label}</Text>
        </Card>
      ))}
    </View>
  );
}

export function InfoCard({
  rows,
}: {
  rows: { icon: IconName; label: string; value: string }[];
}) {
  return (
    <Card style={styles.infoCard}>
      {rows.map((row) => (
        <View key={row.label} style={styles.infoRow}>
          <MaterialIcons
            name={row.icon}
            size={20}
            color={theme.colors.primaryDeep}
          />
          <Text style={styles.infoLabel}>{row.label}</Text>
          <Text style={styles.infoValue}>{row.value}</Text>
        </View>
      ))}
    </Card>
  );
}

export function FormCard({
  children,
  note,
}: {
  children: ReactNode;
  note?: string;
}) {
  return (
    <Card style={styles.formCard}>
      {note ? <Text style={styles.helperText}>{note}</Text> : null}
      {children}
    </Card>
  );
}

export function TextBlock({ title, body }: { title: string; body: string }) {
  return (
    <Card style={styles.textBlock}>
      <Text style={styles.blockTitle}>{title}</Text>
      <Text style={styles.blockBody}>{body}</Text>
    </Card>
  );
}

export function NoticeItem({
  title,
  body,
  meta,
}: {
  title: string;
  body: string;
  meta?: string;
}) {
  return (
    <Card style={styles.noticeItem}>
      <Text style={styles.noticeTitle}>{title}</Text>
      <Text style={styles.noticeBody}>{body}</Text>
      {meta ? <Text style={styles.noticeMeta}>{meta}</Text> : null}
    </Card>
  );
}

export function EmptyPanel({
  icon,
  title,
  body,
}: {
  icon: IconName;
  title: string;
  body: string;
}) {
  return (
    <View style={styles.emptyPanel}>
      <View style={styles.emptyIcon}>
        <MaterialIcons name={icon} size={40} color={theme.colors.inkHint} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

export function CoverHeader({
  title,
  subtitle,
  badge,
  seed = 0,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  seed?: number;
}) {
  return (
    <Card style={styles.coverHeader}>
      <VisualCover height={126} seed={seed} />
      <View style={styles.coverTitleRow}>
        <Text style={styles.coverTitle}>{title}</Text>
        {badge ? <Badge tone="success">{badge}</Badge> : null}
      </View>
      <Text style={styles.coverSubtitle}>{subtitle}</Text>
    </Card>
  );
}

export function RadioOption({
  label,
  selected,
  subtitle,
}: {
  label: string;
  selected?: boolean;
  subtitle?: string;
}) {
  return (
    <View style={styles.radioRow}>
      <View style={[styles.radio, selected ? styles.radioSelected : null]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.menuText}>
        <Text style={styles.menuTitle}>{label}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

export function FieldStack({
  title,
  description,
  error,
  multiline,
}: {
  title: string;
  description?: string;
  error?: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldStack}>
      {multiline ? (
        <Textarea label={title} placeholder={description} error={error} />
      ) : (
        <TextField label={title} placeholder={description} error={error} />
      )}
    </View>
  );
}

export function BottomActions({
  primary,
  secondary,
  danger,
}: {
  primary: string;
  secondary?: string;
  danger?: boolean;
}) {
  return (
    <View style={styles.actions}>
      {secondary ? <Button variant="soft">{secondary}</Button> : null}
      <Button variant={danger ? "danger" : "primary"}>{primary}</Button>
    </View>
  );
}

export function VariantNote({ children }: { children: ReactNode }) {
  return (
    <View style={styles.variantNote}>
      <MaterialIcons
        name="info-outline"
        size={18}
        color={theme.colors.primaryDeep}
      />
      <Text style={styles.variantText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: 14, paddingHorizontal: 18, paddingBottom: 110 },
  sectionLabel: {
    paddingTop: 8,
    color: theme.colors.inkMute,
    fontSize: 12,
    fontWeight: "900",
  },
  menuList: { paddingVertical: 0, paddingHorizontal: 0, overflow: "hidden" },
  menuRow: {
    minHeight: 56,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  pressed: { opacity: 0.72 },
  menuText: { flex: 1, minWidth: 0 },
  menuTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: "800" },
  menuSubtitle: {
    color: theme.colors.inkMute,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  menuValue: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "700" },
  dangerText: { color: theme.colors.danger },
  profileHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
    padding: 18,
  },
  profileText: { flex: 1 },
  profileName: { color: theme.colors.ink, fontSize: 20, fontWeight: "900" },
  profileSubtitle: {
    color: theme.colors.inkMute,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 2,
  },
  smallPill: {
    minHeight: 34,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primarySoft,
  },
  smallPillText: {
    color: theme.colors.primaryDeep,
    fontSize: 12,
    fontWeight: "900",
  },
  statStrip: { flexDirection: "row", gap: 10 },
  statCard: { flex: 1, alignItems: "center", gap: 3, paddingVertical: 16 },
  statValue: {
    color: theme.colors.primaryDeep,
    fontSize: 23,
    fontWeight: "900",
  },
  statLabel: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "800" },
  infoCard: { gap: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  infoLabel: {
    color: theme.colors.inkMute,
    fontSize: 13,
    fontWeight: "900",
    width: 54,
  },
  infoValue: { flex: 1, color: theme.colors.ink, fontWeight: "800" },
  formCard: { gap: 12 },
  helperText: { color: theme.colors.inkMute, fontSize: 13, lineHeight: 19 },
  textBlock: { gap: 8 },
  blockTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: "900" },
  blockBody: { color: theme.colors.inkSoft, fontSize: 14, lineHeight: 22 },
  noticeItem: { gap: 8 },
  noticeTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: "900" },
  noticeBody: { color: theme.colors.inkSoft, fontSize: 14, lineHeight: 21 },
  noticeMeta: { color: theme.colors.inkMute, fontSize: 12, fontWeight: "700" },
  emptyPanel: { alignItems: "center", paddingVertical: 42, gap: 10 },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
  emptyTitle: { color: theme.colors.inkSoft, fontSize: 16, fontWeight: "900" },
  emptyBody: {
    color: theme.colors.inkMute,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  coverHeader: { gap: 12 },
  coverTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  coverTitle: {
    flex: 1,
    color: theme.colors.ink,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 29,
  },
  coverSubtitle: { color: theme.colors.inkSoft, fontSize: 14, lineHeight: 21 },
  radioRow: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: theme.colors.lineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.white,
  },
  fieldStack: { gap: 6 },
  actions: { flexDirection: "row", gap: 8 },
  variantNote: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: theme.radius.md,
    padding: 12,
    backgroundColor: theme.colors.primaryTint,
  },
  variantText: { flex: 1, color: theme.colors.primaryDeep, fontWeight: "800" },
});
