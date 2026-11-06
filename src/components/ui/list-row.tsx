import { Image } from "expo-image";
import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { theme } from "../../constants/theme";
import type { AppIconName } from "./app-icon";
import { AppText } from "./app-text";
import { Avatar, VisualThumb } from "./display";
import { MotionPressable } from "./motion";

type RowBaseProps = {
  /** 오른쪽 끝(배지·작은 버튼). */
  trailing?: ReactNode;
  /** 주면 누를 수 있는 행이 되고, 누르는 동안 0.97 로 작아진다. */
  onPress?: () => void;
  accessibilityLabel?: string;
  /** 아래 1px 구분선. 목록 마지막 행은 false. */
  divider?: boolean;
  /** 끝난 항목 흐림(opacity) 같은 바깥 스타일은 부르는 쪽이 준다. */
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

function RowShell({
  children,
  onPress,
  accessibilityLabel,
  divider = true,
  style,
  testID,
  rowStyle,
}: RowBaseProps & { children: ReactNode; rowStyle: StyleProp<ViewStyle> }) {
  const composed = [rowStyle, divider ? styles.divider : null, style];

  if (onPress) {
    return (
      <MotionPressable
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={composed}
      >
        {children}
      </MotionPressable>
    );
  }

  return (
    <View testID={testID} style={composed}>
      {children}
    </View>
  );
}

/**
 * 목록 한 줄(디자인 시스템 ListRow): 썸네일 88(radius-md, 사진 없으면 thumb-1~6),
 * 간격 12, 위아래 16, 좌우 20. 제목 16/600, 메타 12/500 text-muted.
 * 내부에서 흐리지 않는다 — 끝난 항목은 부르는 쪽이 style 로 opacity 를 준다.
 */
export function ListRow({
  title,
  meta,
  thumbnailUri,
  thumbnailSeed = 0,
  thumbnailIcon,
  children,
  ...base
}: RowBaseProps & {
  title: string;
  meta?: string;
  thumbnailUri?: string | null;
  /** 사진이 없을 때 thumb-1~6 중 고를 번호. */
  thumbnailSeed?: number;
  thumbnailIcon?: AppIconName;
  /** 메타 아래 덧붙일 내용(배지 줄 등). */
  children?: ReactNode;
}) {
  return (
    <RowShell {...base} rowStyle={styles.row}>
      {thumbnailUri ? (
        <Image
          testID="list-row-thumbnail"
          source={{ uri: thumbnailUri }}
          contentFit="cover"
          accessibilityIgnoresInvertColors
          style={styles.thumb}
        />
      ) : (
        <VisualThumb
          size={theme.layout.listThumb}
          seed={thumbnailSeed}
          icon={thumbnailIcon}
        />
      )}
      <View style={styles.body}>
        <AppText variant="body" weight="semibold" numberOfLines={2}>
          {title}
        </AppText>
        {meta ? (
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {meta}
          </AppText>
        ) : null}
        {children}
      </View>
      {base.trailing}
    </RowShell>
  );
}

/**
 * 사람 목록 한 줄(멤버·차단 사용자): 높이 64, 아바타 40, 이름 16/600, 보조 12 text-muted.
 */
export function PersonRow({
  name,
  subtitle,
  avatarUri,
  avatarSeed,
  ...base
}: RowBaseProps & {
  name: string;
  subtitle?: string;
  avatarUri?: string | null;
  avatarSeed?: string | number;
}) {
  return (
    <RowShell {...base} rowStyle={styles.personRow}>
      <Avatar name={name} size={40} seed={avatarSeed} uri={avatarUri} />
      <View style={styles.body}>
        <AppText variant="body" weight="semibold" numberOfLines={1}>
          {name}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" tone="muted" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {base.trailing}
    </RowShell>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.layout.listGap,
    paddingVertical: theme.spacing["4"],
    paddingHorizontal: theme.layout.screenX,
  },
  personRow: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    gap: theme.layout.listGap,
    paddingVertical: theme.spacing["3"],
    paddingHorizontal: theme.layout.screenX,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  thumb: {
    width: theme.layout.listThumb,
    height: theme.layout.listThumb,
    borderRadius: theme.radius.md,
  },
  body: {
    flex: 1,
    gap: theme.spacing["1"],
  },
});
