import { useLocalSearchParams } from "expo-router";
import {
  GroupCreateReferenceScreen,
  variantOf,
} from "../../src/components/prototype/OriginalMockScreens";

export default function GroupNewModal() {
  const params = useLocalSearchParams<{ variant?: string }>();

  return (
    <GroupCreateReferenceScreen variant={variantOf(params.variant, "create")} />
  );
}
