import { StyleSheet, Text, View } from "react-native";
import { theme } from "../../src/constants/theme";

export default function SplashScreenRoute() {
  return (
    <View style={styles.root}>
      <View style={styles.topOrb} />
      <View style={styles.bottomOrb} />

      <View style={styles.logo}>
        <View style={styles.doorLeft} />
        <View style={styles.doorRight} />
        <View style={styles.knob} />
      </View>

      <Text style={styles.title}>열린문 커넥트</Text>
      <Text style={styles.subtitle}>성도와 성도, 마음과 마음을 이어요</Text>

      <View style={styles.dots}>
        {[0.4, 0.6, 0.8].map((opacity) => (
          <View key={opacity} style={[styles.dot, { opacity }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    backgroundColor: theme.colors.primary,
  },
  topOrb: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  bottomOrb: {
    position: "absolute",
    bottom: -100,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  logo: {
    width: 112,
    height: 112,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    ...theme.shadow.float,
  },
  doorLeft: {
    position: "absolute",
    left: 36,
    top: 28,
    width: 32,
    height: 56,
    borderRadius: 2,
    backgroundColor: theme.colors.white,
    transform: [{ skewY: "-6deg" }],
  },
  doorRight: {
    position: "absolute",
    left: 66,
    top: 30,
    width: 16,
    height: 52,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.70)",
    transform: [{ skewY: "10deg" }],
  },
  knob: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: theme.colors.primaryDeep,
  },
  title: {
    marginTop: 22,
    color: theme.colors.white,
    fontSize: 24,
    fontWeight: theme.fontWeight.extrabold,
  },
  subtitle: {
    marginTop: 8,
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    fontWeight: theme.fontWeight.medium,
  },
  dots: {
    position: "absolute",
    bottom: 64,
    flexDirection: "row",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.white,
  },
});
