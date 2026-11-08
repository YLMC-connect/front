import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { Avatar } from "./display";
import { Text } from "./text";

const SIZE = 32;
const OVERLAP = 8;
const RING = 2;

/**
 * 디자인 시스템 AvatarGroup. Avatar 32 를 8px 씩 겹쳐 3명까지 보이고,
 * 나머지는 +N(`surface-subtle` + 12 `text-muted`). 각자 2px `surface` 테두리로 나눈다.
 */
export function AvatarGroup({
  people,
  max = 3,
  testID,
}: {
  people: { name: string; uri?: string | null; seed?: string | number }[];
  max?: number;
  testID?: string;
}) {
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;

  return (
    <View
      accessible
      accessibilityLabel={`${people.length}명`}
      style={styles.row}
      testID={testID}
    >
      {shown.map((person, index) => (
        <View
          key={`${person.name}-${index}`}
          style={[styles.ring, index > 0 ? styles.overlap : null]}
        >
          <Avatar
            name={person.name}
            seed={person.seed}
            size={SIZE}
            uri={person.uri}
          />
        </View>
      ))}
      {rest > 0 ? (
        <View
          style={[styles.ring, styles.overlap]}
          testID={testID ? `${testID}-rest` : undefined}
        >
          <View style={styles.rest}>
            <Text style={styles.restText}>{`+${rest}`}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  ring: {
    borderRadius: (SIZE + RING * 2) / 2,
    borderWidth: RING,
    borderColor: theme.colors.surface,
  },
  overlap: {
    marginLeft: -OVERLAP,
  },
  rest: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surfaceSubtle,
  },
  restText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});
