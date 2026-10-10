import {
  ArrowLeftRight,
  Ban,
  Bell,
  BookOpen,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleCheck,
  CircleQuestionMark,
  Clock,
  DoorOpen,
  Eye,
  EyeOff,
  FileText,
  Flag,
  Heart,
  HeartHandshake,
  House,
  ImagePlus,
  Inbox,
  Info,
  LogOut,
  Megaphone,
  Package,
  PenLine,
  Plus,
  RefreshCw,
  RotateCcwClock,
  Search,
  SearchX,
  Send,
  Share,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash,
  TriangleAlert,
  User,
  UserMinus,
  UserPlus,
  Users,
  X,
  type LucideIcon,
  type LucideProps,
} from "lucide-react-native";

const iconMap = {
  add: Plus,
  "add-photo-alternate": ImagePlus,
  "account-multiple": Users,
  "account-multiple-outline": Users,
  block: Ban,
  "book-open-page-variant": BookOpen,
  "book-open-page-variant-outline": BookOpen,
  campaign: Megaphone,
  check: Check,
  "check-circle": CircleCheck,
  "chevron-left": ChevronLeft,
  "chevron-right": ChevronRight,
  circle: Circle,
  "circle-outline": Circle,
  close: X,
  "delete-outline": Trash,
  description: FileText,
  "door-front": DoorOpen,
  edit: PenLine,
  "error-outline": CircleAlert,
  favorite: Heart,
  groups: Users,
  "hands-pray": HeartHandshake,
  "help-outline": CircleQuestionMark,
  history: RotateCcwClock,
  home: House,
  "home-outline": House,
  inbox: Inbox,
  info: Info,
  "inventory-2": Package,
  "ios-share": Share,
  logout: LogOut,
  "menu-book": BookOpen,
  notifications: Bell,
  "outlined-flag": Flag,
  "person-outline": User,
  "person-remove": UserMinus,
  "prayer-apply": UserPlus,
  schedule: Clock,
  search: Search,
  "search-off": SearchX,
  send: Send,
  shopping: ShoppingBag,
  "shopping-bag": ShoppingBag,
  "shopping-outline": ShoppingBag,
  star: Star,
  sync: RefreshCw,
  "sync-alt": ArrowLeftRight,
  "verified-user": ShieldCheck,
  visibility: Eye,
  "visibility-off": EyeOff,
  "warning-amber": TriangleAlert,
} as const satisfies Record<string, LucideIcon>;

export type AppIconName = keyof typeof iconMap;

export interface AppIconProps extends Omit<LucideProps, "size"> {
  name: AppIconName;
  size?: number | string;
  weight?: "linear" | "bold";
  mirrored?: boolean;
}

export function AppIcon({
  name,
  weight = "linear",
  size = 24,
  color = "currentColor",
  strokeWidth,
  mirrored = false,
  style,
  ...props
}: AppIconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;

  const resolvedStrokeWidth = strokeWidth ?? (weight === "bold" ? 2.75 : 2);

  const resolvedStyle = mirrored
    ? [style, { transform: [{ scaleX: -1 }] }]
    : style;

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={resolvedStrokeWidth}
      style={resolvedStyle}
      {...props}
    />
  );
}
