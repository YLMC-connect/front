import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { AppIcon } from "./app-icon";
import { Text } from "./text";

const DOT = 28;
const CURRENT_RING = 4;

/**
 * 디자인 시스템 Stepper. 여러 단계를 거칠 때 지금 위치를 보여 준다.
 * 끝난 단계 `primary` + 체크, 지금 단계 `primary` + 4px `primary-subtle` 고리,
 * 남은 단계 1px `border-button` + 숫자 `text-muted`. 잇는 선 2px.
 */
export function Stepper({
  steps,
  current,
  testID = "stepper",
}: {
  steps: string[];
  /** 0부터 센 지금 단계. */
  current: number;
  testID?: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={`${steps.length}단계 중 ${current + 1}단계, ${steps[current] ?? ""}`}
      style={styles.root}
      testID={testID}
    >
      {steps.map((label, index) => {
        const done = index < current;
        const isCurrent = index === current;
        return (
          <Fragment key={`${label}-${index}`}>
            {index > 0 ? (
              <View
                style={[styles.line, index <= current ? styles.lineDone : null]}
              />
            ) : null}
            <View style={styles.step}>
              <View
                style={[
                  styles.dotWrap,
                  isCurrent ? styles.dotWrapCurrent : null,
                ]}
              >
                <View
                  style={[
                    styles.dot,
                    done || isCurrent ? styles.dotActive : styles.dotTodo,
                  ]}
                  testID={`${testID}-dot-${index}`}
                >
                  {done ? (
                    <AppIcon
                      name="check"
                      size={16}
                      color={theme.colors.onPrimary}
                      weight="bold"
                    />
                  ) : (
                    <Text
                      style={[
                        styles.number,
                        isCurrent ? styles.numberCurrent : null,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
              </View>
              <Text
                numberOfLines={1}
                style={[styles.label, isCurrent ? styles.labelCurrent : null]}
              >
                {label}
              </Text>
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: theme.layout.screenX,
  },
  step: {
    alignItems: "center",
    gap: theme.spacing["1"],
    minWidth: DOT + CURRENT_RING * 2,
  },
  dotWrap: {
    width: DOT + CURRENT_RING * 2,
    height: DOT + CURRENT_RING * 2,
    borderRadius: (DOT + CURRENT_RING * 2) / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dotWrapCurrent: {
    backgroundColor: theme.colors.primarySubtle,
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: DOT / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dotActive: {
    backgroundColor: theme.colors.primary,
  },
  dotTodo: {
    borderWidth: 1,
    borderColor: theme.colors.borderButton,
    backgroundColor: theme.colors.surface,
  },
  number: {
    ...theme.typography.caption,
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
    color: theme.colors.textMuted,
  },
  numberCurrent: {
    color: theme.colors.onPrimary,
  },
  line: {
    flex: 1,
    height: 2,
    marginTop: (DOT + CURRENT_RING * 2) / 2 - 1,
    backgroundColor: theme.colors.border,
  },
  lineDone: {
    backgroundColor: theme.colors.primary,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  labelCurrent: {
    fontFamily: theme.font.semibold,
    fontWeight: "normal",
    color: theme.colors.text,
  },
});
