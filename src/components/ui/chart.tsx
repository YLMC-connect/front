import { StyleSheet, View } from "react-native";
import { theme } from "../../constants/theme";
import { Text } from "./text";

const CHART_COLORS = [
  theme.colors.chart1,
  theme.colors.chart2,
  theme.colors.chart3,
  theme.colors.chart4,
  theme.colors.chart5,
  theme.colors.chart6,
];
const BAR_WIDTH = 40;

export type ChartDatum = { label: string; value: number };

/** 6개를 넘으면 6번째부터 "기타"로 묶는다. */
export function groupChartData(data: ChartDatum[]): ChartDatum[] {
  if (data.length <= CHART_COLORS.length) return data;
  const head = data.slice(0, CHART_COLORS.length - 1);
  const rest = data
    .slice(CHART_COLORS.length - 1)
    .reduce((sum, item) => sum + item.value, 0);
  return [...head, { label: "기타", value: rest }];
}

/**
 * 디자인 시스템 Chart(막대). 색은 `chart-1` 부터 차례로, 막대 폭 40·위 모서리 8,
 * 값은 막대 위 12/700, 항목 이름은 아래 12 `text-muted`. 이름과 값을 글자로 함께 적어
 * 색만으로 구분하지 않는다.
 */
export function BarChart({
  data,
  height = 160,
  testID = "bar-chart",
}: {
  data: ChartDatum[];
  /** 막대가 그려지는 영역 높이. */
  height?: number;
  testID?: string;
}) {
  const items = groupChartData(data);
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <View
      accessible
      accessibilityLabel={items
        .map((item) => `${item.label} ${item.value}`)
        .join(", ")}
      style={styles.root}
      testID={testID}
    >
      {items.map((item, index) => (
        <View key={`${item.label}-${index}`} style={styles.column}>
          <View style={[styles.plot, { height }]}>
            <Text style={styles.value}>{item.value}</Text>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max((item.value / max) * (height - 24), 2),
                  backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                },
              ]}
              testID={`${testID}-bar-${index}`}
            />
          </View>
          <Text numberOfLines={1} style={styles.label}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  column: {
    alignItems: "center",
    gap: theme.spacing["2"],
    minWidth: BAR_WIDTH,
  },
  plot: {
    justifyContent: "flex-end",
    alignItems: "center",
    gap: theme.spacing["1"],
  },
  value: {
    ...theme.typography.caption,
    fontFamily: theme.font.bold,
    fontWeight: "normal",
    color: theme.colors.text,
  },
  bar: {
    width: BAR_WIDTH,
    borderTopLeftRadius: theme.radius.xs,
    borderTopRightRadius: theme.radius.xs,
  },
  label: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
});
