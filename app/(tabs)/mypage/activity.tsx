import { useLocalSearchParams } from "expo-router";
import {
  ActivityReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";

export default function ActivityScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();

  return (
    <ActivityReferenceScreen variant={variantOf(params.variant, "posts")} />
  );
}
