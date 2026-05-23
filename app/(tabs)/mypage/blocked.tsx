import { useLocalSearchParams } from "expo-router";
import {
  BlockedReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";

export default function BlockedScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();

  return <BlockedReferenceScreen variant={variantOf(params.variant)} />;
}
