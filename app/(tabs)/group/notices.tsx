import { useLocalSearchParams } from "expo-router";
import {
  GroupNoticeReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";

export default function GroupNoticesScreenRoute() {
  const params = useLocalSearchParams<{ variant?: string }>();
  return <GroupNoticeReferenceScreen variant={variantOf(params.variant)} />;
}
