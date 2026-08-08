import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Compass,
  ExternalLink,
  FolderKanban,
  GraduationCap,
  Heart,
  Image,
  Mail,
  MapPin,
  Moon,
  Share2,
  Sparkles,
  Sun,
  UserRound,
  X,
} from 'lucide-react'

const icons = {
  arrow: ArrowUpRight,
  check: Check,
  chevron: ChevronDown,
  compass: Compass,
  external: ExternalLink,
  folder: FolderKanban,
  graduation: GraduationCap,
  heart: Heart,
  image: Image,
  mail: Mail,
  map: MapPin,
  moon: Moon,
  share: Share2,
  sparkles: Sparkles,
  sun: Sun,
  user: UserRound,
  close: X,
}

export function Icon({ name, size = 22, strokeWidth = 1.8, ...props }) {
  const Component = icons[name] ?? Sparkles
  return <Component aria-hidden="true" size={size} strokeWidth={strokeWidth} {...props} />
}
