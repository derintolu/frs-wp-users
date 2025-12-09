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
  
  activity: Activity,
  




archive: Archive,
  







// Analytics
'bar-chart-3': BarChart3,

  
  







bell: Bell,
  








briefcase: Briefcase,
  







// Business
building: Building,
  







box: Box,
  






// Time & Schedule
calendar: Calendar,
  






clock: Clock,
  






compass: Compass,
  







dashboard: LayoutDashboard,

  
  






// Finance
'dollar-sign': DollarSign,
  






edit: Edit,
  






'external-link': ExternalLink,
  






copy: Copy,
  






eye: Eye,
  






download: Download,
  





// Files & Documents
file: File,
  





'eye-off': EyeOff,

  
  





'file-check': FileCheck,
  







'file-edit': FileEdit,
  








'file-plus': FilePlus,
  








check: Check,

  
  







'file-text': FileText,
  







// Indicators
'alert-circle': AlertCircle,
  








filter: Filter,
  








folder: Folder,
  








'folder-open': FolderOpen,

  
  







globe: Globe,
  







group: Group,

  
  







bookmark: Bookmark,
  








heart: Heart,

  
  







'help-circle': HelpCircle,
  






// Navigation
home: Home,

  
  





headphones: Headphones,
  




menu: Menu,
  



camera: Camera,

  
  



user: User,
  




// Media
image: Image,
  





'user-check': UserCheck,
  





info: Info,
  





'user-minus': UserMinus,
  





laptop: Laptop,
  




// Users & People
users: Users,
  




// Navigation Arrows
'chevron-right': ChevronRight,

  
  





'user-plus': UserPlus,
  






'chevron-down': ChevronDown,
  






'user-x': UserX,
  






battery: Battery,
  







users2: Users2,
  








layers: Layers,
  







link2: Link2,
  





// Communication
mail: Mail,
  





key: Key,
  





map: Map,
  





// Security
lock: Lock,
  





// Location
'map-pin': MapPin,
  





'message-square': MessageSquare,

  
  




mic: Mic,
  





minus: Minus,
  





phone: Phone,
  




monitor: Monitor,
  




send: Send,
  




music: Music,

  
  



navigation: Navigation,
  



package: Package,
  



'pie-chart': PieChart,
  



// Actions
plus: Plus,
  




power: Power,
  




// Devices
printer: Printer,

  
  




search: Search,
  




'trending-up': TrendingUp,
  



// UI Elements
settings: Settings,
  



share2: Share2,
  



shield: Shield,

  
  



'shield-check': ShieldCheck,
  




smartphone: Smartphone,

  
  



star: Star,
  


tablet: Tablet,

  
  

// Utility
target: Target,
  



trash2: Trash2,
  



unlock: Unlock,
  



upload: Upload,

  
  


video: Video,
  


// Connectivity
wifi: Wifi,
  

'wifi-off': WifiOff,
  x: X,
  zap: Zap,
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
