import { useLocalSearchParams } from "expo-router";
import {
  GroupDetailReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";

export default function GroupDetailScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();

  return (
    <GroupDetailReferenceScreen variant={variantOf(params.variant, "leader")} />
  );
}
