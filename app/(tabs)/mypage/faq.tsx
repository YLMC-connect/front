import { useLocalSearchParams } from "expo-router";
import {
  FaqReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";

export default function FaqScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();

  return <FaqReferenceScreen empty={variantOf(params.variant) === "empty"} />;
}
