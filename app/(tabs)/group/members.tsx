import { useLocalSearchParams } from "expo-router";
import {
  GroupMembersReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";

export default function GroupMembersScreenRoute() {
  const params = useLocalSearchParams<{ variant?: string }>();
  return <GroupMembersReferenceScreen variant={variantOf(params.variant)} />;
}
