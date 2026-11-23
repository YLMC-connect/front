import type { ReactNode } from "react";
import { View } from "react-native";
import { theme } from "../../../constants/theme";
import { AppIcon, type AppIconName } from "../../ui/app-icon";
import { AppText } from "../../ui/app-text";
import { styles } from "./lifeStudyDetailStyles";

/** 상세 정보 한 줄: 아이콘 18 · 라벨(폭 64) 14 muted · 값 14/600. 줄 사이는 구분선. */
export function InfoLine({
  icon,
  label,
  value,
}: {
  icon: AppIconName;
  label: string;
  value: ReactNode;
}) {
  return (
    <View style={styles.infoLine}>
      <AppIcon name={icon} size={18} color={theme.colors.textMuted} />
      <AppText variant="label" tone="muted" style={styles.infoLabel}>
        {label}
      </AppText>
      <View style={styles.infoValue}>
        {typeof value === "string" ? (
          <AppText variant="label" weight="semibold">
            {value}
          </AppText>
        ) : (
          value
        )}
      </View>
    </View>
  );
}
