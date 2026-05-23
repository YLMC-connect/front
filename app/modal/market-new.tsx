import { useLocalSearchParams } from "expo-router";
import {
  MarketCreateReferenceScreen,
  variantOf,
} from "../../src/components/prototype/OriginalMockScreens";

export default function MarketNewModal() {
  const params = useLocalSearchParams<{ variant?: string }>();

  return (
    <MarketCreateReferenceScreen
      variant={variantOf(params.variant, "create")}
    />
  );
}
