import type { IconProps } from "@solar-icons/react-native";
import {
  AddCircle,
  AltArrowLeft,
  AltArrowRight,
  Bag,
  Bell,
  Book2,
  Box,
  CheckCircle,
  ClockCircle,
  CloseCircle,
  DangerCircle,
  DangerTriangle,
  DocumentText,
  Eye,
  EyeClosed,
  Flag2,
  ForbiddenCircle,
  GalleryAdd,
  HandHeart,
  Heart,
  History,
  Home2,
  House,
  Inbox,
  InfoCircle,
  Logout2,
  Magnifer,
  Pen2,
  Plain,
  QuestionCircle,
  RecordCircle,
  Restart,
  Share,
  ShieldCheck,
  Shop,
  Speaker,
  Star,
  TransferHorizontal,
  TrashBin2,
  UserMinusRounded,
  UserRounded,
  UsersGroupRounded,
} from "@solar-icons/react-native/Linear";
import {
  Book2 as Book2Bold,
  HandHeart as HandHeartBold,
  Home2 as Home2Bold,
  Shop as ShopBold,
  UsersGroupRounded as UsersGroupRoundedBold,
} from "@solar-icons/react-native/Bold";
import type { ComponentType } from "react";

type SolarIconComponent = ComponentType<IconProps>;

const linearIcons = {
  add: AddCircle,
  "add-photo-alternate": GalleryAdd,
  "account-multiple": UsersGroupRounded,
  "account-multiple-outline": UsersGroupRounded,
  block: ForbiddenCircle,
  "book-open-page-variant": Book2,
  "book-open-page-variant-outline": Book2,
  campaign: Speaker,
  check: CheckCircle,
  "check-circle": CheckCircle,
  "chevron-left": AltArrowLeft,
  "chevron-right": AltArrowRight,
  circle: RecordCircle,
  "circle-outline": RecordCircle,
  close: CloseCircle,
  "delete-outline": TrashBin2,
  description: DocumentText,
  "door-front": House,
  edit: Pen2,
  "error-outline": DangerCircle,
  favorite: Heart,
  groups: UsersGroupRounded,
  "hands-pray": HandHeart,
  "help-outline": QuestionCircle,
  history: History,
  home: Home2,
  "home-outline": Home2,
  inbox: Inbox,
  info: InfoCircle,
  "inventory-2": Box,
  "ios-share": Share,
  logout: Logout2,
  "menu-book": Book2,
  notifications: Bell,
  "outlined-flag": Flag2,
  "person-outline": UserRounded,
  "person-remove": UserMinusRounded,
  schedule: ClockCircle,
  search: Magnifer,
  "search-off": Magnifer,
  send: Plain,
  shopping: Shop,
  "shopping-bag": Bag,
  "shopping-outline": Shop,
  star: Star,
  sync: Restart,
  "sync-alt": TransferHorizontal,
  "verified-user": ShieldCheck,
  visibility: Eye,
  "visibility-off": EyeClosed,
  "volunteer-activism": HandHeart,
  "warning-amber": DangerTriangle,
} satisfies Record<string, SolarIconComponent>;

export type AppIconName = keyof typeof linearIcons;

const boldIcons: Partial<Record<AppIconName, SolarIconComponent>> = {
  "book-open-page-variant": Book2Bold,
  "book-open-page-variant-outline": Book2Bold,
  "hands-pray": HandHeartBold,
  home: Home2Bold,
  "home-outline": Home2Bold,
  shopping: ShopBold,
  "shopping-outline": ShopBold,
  "account-multiple": UsersGroupRoundedBold,
  "account-multiple-outline": UsersGroupRoundedBold,
};

export function AppIcon({
  name,
  weight = "linear",
  ...props
}: IconProps & {
  name: AppIconName;
  weight?: "linear" | "bold";
}) {
  const Icon =
    weight === "bold"
      ? (boldIcons[name] ?? linearIcons[name])
      : linearIcons[name];

  return <Icon {...props} />;
}
