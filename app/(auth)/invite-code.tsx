import { useLocalSearchParams } from "expo-router";
import {
  InviteCodeReferenceScreen,
  variantOf,
} from "../../src/components/prototype/OriginalMockScreens";

export default function InviteCodeScreenRoute() {
  const params = useLocalSearchParams<{ variant?: string }>();
  return <InviteCodeReferenceScreen variant={variantOf(params.variant)} />;
}
