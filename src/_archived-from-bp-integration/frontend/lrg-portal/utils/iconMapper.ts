/**
 * Icon Mapper Utility
 * Maps string icon names to Lucide React icon components
 */

import {
  Home,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Bell,
  Link2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Building,
  Briefcase,
  UserPlus,
  FileCheck,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Layers,
  Box,
  Package,
  Archive,
  Folder,
  FolderOpen,
  File,
  FilePlus,
  FileEdit,
  Download,
  Upload,
  Share2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Menu,
  X,
  Check,
  AlertCircle,
  Info,
  HelpCircle,
  Search,
  Filter,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Star,
  Heart,
  Bookmark,
  MessageSquare,
  Send,
  Image,
  Video,
  Music,
  Headphones,
  Mic,
  Camera,
  Printer,
  Monitor,
  Smartphone,
  Tablet,
  Laptop,
  Wifi,
  WifiOff,
  Globe,
  Map,
  Navigation,
  Compass,
  Target,
  Zap,
  Battery,
  Power,
  Lock,
  Unlock,
  Shield,
  ShieldCheck,
  Key,
  User,
  UserCheck,
  UserMinus,
  UserX,
  Users2,
  Group,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icon map - maps string names to Lucide icon components
 */
export const iconMap: Record<string, LucideIcon> = {
  // Navigation
  home: Home,
  dashboard: LayoutDashboard,
  menu: Menu,

  // Users & People
  users: Users,
  user: User,
  'user-plus': UserPlus,
  'user-check': UserCheck,
  'user-minus': UserMinus,
  'user-x': UserX,
  users2: Users2,
  group: Group,

  // Files & Documents
  file: File,
  'file-text': FileText,
  'file-plus': FilePlus,
  'file-edit': FileEdit,
  'file-check': FileCheck,
  folder: Folder,
  'folder-open': FolderOpen,
  archive: Archive,

  // Communication
  mail: Mail,
  phone: Phone,
  'message-square': MessageSquare,
  send: Send,

  // Location
  'map-pin': MapPin,
  map: Map,
  navigation: Navigation,
  compass: Compass,
  globe: Globe,

  // Time & Schedule
  calendar: Calendar,
  clock: Clock,

  // Finance
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,

  // Business
  building: Building,
  briefcase: Briefcase,

  // Analytics
  'bar-chart-3': BarChart3,
  'pie-chart': PieChart,
  activity: Activity,

  // UI Elements
  settings: Settings,
  bell: Bell,
  link2: Link2,
  'external-link': ExternalLink,
  share2: Share2,
  layers: Layers,
  box: Box,
  package: Package,

  // Actions
  plus: Plus,
  minus: Minus,
  edit: Edit,
  trash2: Trash2,
  eye: Eye,
  'eye-off': EyeOff,
  copy: Copy,
  download: Download,
  upload: Upload,
  search: Search,
  filter: Filter,
  x: X,
  check: Check,

  // Indicators
  'alert-circle': AlertCircle,
  info: Info,
  'help-circle': HelpCircle,
  star: Star,
  heart: Heart,
  bookmark: Bookmark,

  // Media
  image: Image,
  video: Video,
  music: Music,
  headphones: Headphones,
  mic: Mic,
  camera: Camera,

  // Devices
  printer: Printer,
  monitor: Monitor,
  smartphone: Smartphone,
  tablet: Tablet,
  laptop: Laptop,

  // Connectivity
  wifi: Wifi,
  'wifi-off': WifiOff,

  // Navigation Arrows
  'chevron-right': ChevronRight,
  'chevron-down': ChevronDown,

  // Utility
  target: Target,
  zap: Zap,
  battery: Battery,
  power: Power,

  // Security
  lock: Lock,
  unlock: Unlock,
  shield: Shield,
  'shield-check': ShieldCheck,
  key: Key,
};

/**
 * Get icon component by name
 * Returns fallback icon if name not found
 */
export function getIcon(iconName?: string | null): LucideIcon {
  if (!iconName) {
    return FileText; // Default fallback
  }

  const normalizedName = iconName.toLowerCase().trim();
  return iconMap[normalizedName] || FileText;
}

/**
 * Get all available icon names
 */
export function getAvailableIcons(): string[] {
  return Object.keys(iconMap).sort();
}

/**
 * Check if icon name exists
 */
export function hasIcon(iconName: string): boolean {
  const normalizedName = iconName.toLowerCase().trim();
  return normalizedName in iconMap;
}
