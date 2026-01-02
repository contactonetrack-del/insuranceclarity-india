import { LucideIcon } from 'lucide-react'
import {
    Shield, Heart, Building2, Car, Home, Plane, Gem, UserCheck,
    Search, Scale, Calculator, FileText, BarChart3, Sparkles,
    ArrowRight, ArrowLeft, ChevronDown, ChevronUp, ChevronRight,
    Check, CheckCircle, X, XCircle, AlertTriangle, AlertCircle, Info,
    Lightbulb, TrendingUp, TrendingDown, Users, Award, Star, Clock,
    MapPin, Globe, Phone, Mail, ExternalLink, Download, Upload,
    Menu, Settings, Sun, Moon, Eye, EyeOff, Lock, Unlock,
    Plus, Minus, RefreshCw, Filter, SortAsc, SortDesc, Loader2
} from 'lucide-react'

// ============================================
// CENTRALIZED ICON MAP
// Single source of truth for all icons
// ============================================

export const iconMap = {
    // Brand & Trust
    shield: Shield,

    // Insurance Types
    life: Heart,
    health: Building2,
    motor: Car,
    home: Home,
    travel: Plane,
    specialized: Gem,
    'personal-accident': UserCheck,

    // Tools
    search: Search,
    compare: Scale,
    calculator: Calculator,
    cases: FileText,
    chart: BarChart3,
    sparkles: Sparkles,

    // Navigation
    arrowRight: ArrowRight,
    arrowLeft: ArrowLeft,
    chevronDown: ChevronDown,
    chevronUp: ChevronUp,
    chevronRight: ChevronRight,
    menu: Menu,
    settings: Settings,

    // Status & Feedback
    check: Check,
    checkCircle: CheckCircle,
    close: X,
    error: XCircle,
    warning: AlertTriangle,
    alert: AlertCircle,
    info: Info,

    // Content
    tip: Lightbulb,
    trendUp: TrendingUp,
    trendDown: TrendingDown,
    users: Users,
    award: Award,
    star: Star,
    clock: Clock,

    // Contact & Location
    location: MapPin,
    globe: Globe,
    phone: Phone,
    email: Mail,
    external: ExternalLink,
    download: Download,
    upload: Upload,

    // Theme
    sun: Sun,
    moon: Moon,

    // Actions
    eye: Eye,
    eyeOff: EyeOff,
    lock: Lock,
    unlock: Unlock,
    plus: Plus,
    minus: Minus,
    refresh: RefreshCw,
    filter: Filter,
    sortAsc: SortAsc,
    sortDesc: SortDesc,
    loader: Loader2,
} as const

export type IconName = keyof typeof iconMap

// ============================================
// ICON SIZE TOKENS
// Consistent sizing across the app
// ============================================

export const ICON_SIZES = {
    xs: 14,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
    '2xl': 48,
} as const

export type IconSize = keyof typeof ICON_SIZES

// ============================================
// ICON COMPONENT
// ============================================

interface IconProps {
    name: IconName
    size?: IconSize
    className?: string
    label?: string
    strokeWidth?: number
}

export default function Icon({
    name,
    size = 'md',
    className = '',
    label,
    strokeWidth = 2
}: IconProps) {
    const IconComponent = iconMap[name]

    if (!IconComponent) {
        console.warn(`Icon "${name}" not found in iconMap`)
        return null
    }

    return (
        <IconComponent
            size={ICON_SIZES[size]}
            strokeWidth={strokeWidth}
            className={`inline-block flex-shrink-0 ${className}`}
            aria-label={label}
            aria-hidden={!label}
        />
    )
}

// ============================================
// ICON CONTAINER
// For icons with background/gradient
// ============================================

interface IconContainerProps {
    name: IconName
    size?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'primary' | 'accent' | 'muted'
    gradient?: string
    className?: string
}

const containerSizes = {
    sm: { container: 'w-10 h-10', icon: 18 },
    md: { container: 'w-12 h-12', icon: 20 },
    lg: { container: 'w-14 h-14', icon: 24 },
    xl: { container: 'w-16 h-16', icon: 28 },
}

export function IconContainer({
    name,
    size = 'md',
    variant = 'primary',
    gradient,
    className = '',
}: IconContainerProps) {
    const IconComponent = iconMap[name]
    const { container, icon } = containerSizes[size]

    if (!IconComponent) return null

    const variantClasses = {
        primary: 'bg-gradient-accent text-white shadow-sm',
        accent: 'bg-accent-10 text-accent',
        muted: 'bg-theme-secondary/10 text-theme-secondary',
    }

    return (
        <div
            className={`
        ${container} rounded-xl flex items-center justify-center
        transition-transform duration-200
        ${gradient ? '' : variantClasses[variant]}
        ${className}
      `}
            style={gradient ? { background: gradient } : undefined}
        >
            <IconComponent size={icon} strokeWidth={2} />
        </div>
    )
}

// ============================================
// DIRECT ICON ACCESS (for advanced usage)
// ============================================

export function getIcon(name: IconName): LucideIcon | null {
    return iconMap[name] || null
}
