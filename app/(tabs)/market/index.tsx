import { useLocalSearchParams } from "expo-router";
import {
  MarketListReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";

export default function MarketScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();

  return (
    <MarketListReferenceScreen variant={variantOf(params.variant, "default")} />
  );
}
