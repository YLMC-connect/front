import { useLocalSearchParams } from "expo-router";
import {
  ProfileEditReferenceScreen,
  variantOf,
} from "../../../src/components/prototype/OriginalMockScreens";

export default function EditProfileScreen() {
  const params = useLocalSearchParams<{ variant?: string }>();

  return <ProfileEditReferenceScreen variant={variantOf(params.variant)} />;
}
