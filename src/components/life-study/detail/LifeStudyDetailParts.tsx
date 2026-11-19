import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { styles } from "./lifeStudyDetailStyles";

export function InfoRow({
  label,
  value,
  primary = false,
}: {
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, primary ? styles.primaryText : null]}>
        {value}
      </Text>
    </View>
  );
}
