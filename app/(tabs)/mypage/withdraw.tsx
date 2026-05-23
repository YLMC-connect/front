import { useLocalSearchParams } from "expo-router";
import {
  variantOf,
  WithdrawReferenceScreen,
} from "../../../src/components/prototype/OriginalMockScreens";

export default function WithdrawScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();

  return (
    <WithdrawReferenceScreen
      confirm={variantOf(params.variant) === "confirm"}
    />
  );
}
