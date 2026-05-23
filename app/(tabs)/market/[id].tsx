import { useLocalSearchParams } from "expo-router";
import {
  MarketDetailReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";

export default function MarketDetailScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();

  return (
    <MarketDetailReferenceScreen variant={variantOf(params.variant, "own")} />
  );
}
