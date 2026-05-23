import { useLocalSearchParams } from "expo-router";
import {
  GroupListReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";

export default function GroupScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();

  return (
    <GroupListReferenceScreen variant={variantOf(params.variant, "all")} />
  );
}
