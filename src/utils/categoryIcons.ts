import {
  Utensils, Coffee, ShoppingBag, ShoppingCart, Car, Train, Bus, Fuel,
  Home, Zap, Wifi, Smartphone, Tv, Gamepad2, HeartPulse, Pill,
  GraduationCap, BookOpen, Scissors, Shirt, Gift, PartyPopper, Cigarette, Wrench,
  Briefcase, IndianRupee, TrendingUp, Landmark, PiggyBank, Wallet, HandCoins, BadgePercent,
  Building2, Coins, DollarSign, Banknote, CreditCard, Receipt, ChartLine, ChartPie,
  TicketPercent, Award, Star, Gem, Package, CircleDollarSign, ArrowRightLeft, HelpCircle,
  University, Vault, BadgeIndianRupee, WalletCards,
  Percent, CirclePercent, Bitcoin, QrCode, Shield,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface CategoryIconDef {
  name: string
  icon: LucideIcon
  label: string
}

export const EXPENSE_ICONS: CategoryIconDef[] = [
  { name: 'utensils', icon: Utensils, label: 'Food' },
  { name: 'coffee', icon: Coffee, label: 'Coffee' },
  { name: 'shopping-bag', icon: ShoppingBag, label: 'Shopping' },
  { name: 'shopping-cart', icon: ShoppingCart, label: 'Groceries' },
  { name: 'car', icon: Car, label: 'Car' },
  { name: 'train', icon: Train, label: 'Train' },
  { name: 'bus', icon: Bus, label: 'Bus' },
  { name: 'fuel', icon: Fuel, label: 'Fuel' },
  { name: 'home', icon: Home, label: 'Home' },
  { name: 'zap', icon: Zap, label: 'Electric' },
  { name: 'wifi', icon: Wifi, label: 'Internet' },
  { name: 'smartphone', icon: Smartphone, label: 'Phone' },
  { name: 'tv', icon: Tv, label: 'TV' },
  { name: 'gamepad-2', icon: Gamepad2, label: 'Games' },
  { name: 'heart-pulse', icon: HeartPulse, label: 'Health' },
  { name: 'pill', icon: Pill, label: 'Medicine' },
  { name: 'graduation-cap', icon: GraduationCap, label: 'Education' },
  { name: 'book-open', icon: BookOpen, label: 'Books' },
  { name: 'scissors', icon: Scissors, label: 'Grooming' },
  { name: 'shirt', icon: Shirt, label: 'Clothes' },
  { name: 'gift', icon: Gift, label: 'Gifts' },
  { name: 'party-popper', icon: PartyPopper, label: 'Party' },
  { name: 'cigarette', icon: Cigarette, label: 'Smoke' },
  { name: 'wrench', icon: Wrench, label: 'Repair' },
]

export const INCOME_ICONS: CategoryIconDef[] = [
  { name: 'briefcase', icon: Briefcase, label: 'Salary' },
  { name: 'indian-rupee', icon: IndianRupee, label: 'Rupee' },
  { name: 'trending-up', icon: TrendingUp, label: 'Growth' },
  { name: 'landmark', icon: Landmark, label: 'Bank' },
  { name: 'piggy-bank', icon: PiggyBank, label: 'Savings' },
  { name: 'wallet', icon: Wallet, label: 'Wallet' },
  { name: 'hand-coins', icon: HandCoins, label: 'Cashback' },
  { name: 'badge-percent', icon: BadgePercent, label: 'Discount' },
  { name: 'building-2', icon: Building2, label: 'Business' },
  { name: 'coins', icon: Coins, label: 'Coins' },
  { name: 'dollar-sign', icon: DollarSign, label: 'Dollar' },
  { name: 'banknote', icon: Banknote, label: 'Cash' },
  { name: 'credit-card', icon: CreditCard, label: 'Card' },
  { name: 'receipt', icon: Receipt, label: 'Invoice' },
  { name: 'chart-line', icon: ChartLine, label: 'Stocks' },
  { name: 'chart-pie', icon: ChartPie, label: 'Portfolio' },
  { name: 'ticket-percent', icon: TicketPercent, label: 'Coupon' },
  { name: 'award', icon: Award, label: 'Award' },
  { name: 'star', icon: Star, label: 'Bonus' },
  { name: 'gem', icon: Gem, label: 'Premium' },
  { name: 'package', icon: Package, label: 'Package' },
  { name: 'circle-dollar-sign', icon: CircleDollarSign, label: 'Dividend' },
  { name: 'gift', icon: Gift, label: 'Gift' },
  { name: 'heart-pulse', icon: HeartPulse, label: 'Insurance' },
]

export const ACCOUNT_ICONS: CategoryIconDef[] = [
  { name: 'wallet', icon: Wallet, label: 'Wallet' },
  { name: 'credit-card', icon: CreditCard, label: 'Card' },
  { name: 'landmark', icon: Landmark, label: 'Bank' },
  { name: 'university', icon: University, label: 'Bank 2' },
  { name: 'building-2', icon: Building2, label: 'Business' },
  { name: 'piggy-bank', icon: PiggyBank, label: 'Savings' },
  { name: 'banknote', icon: Banknote, label: 'Cash' },
  { name: 'coins', icon: Coins, label: 'Coins' },
  { name: 'indian-rupee', icon: IndianRupee, label: 'Rupee' },
  { name: 'dollar-sign', icon: DollarSign, label: 'Dollar' },
  { name: 'badge-indian-rupee', icon: BadgeIndianRupee, label: 'UPI' },
  { name: 'wallet-cards', icon: WalletCards, label: 'Cards' },
  { name: 'vault', icon: Vault, label: 'Vault' },
  { name: 'hand-coins', icon: HandCoins, label: 'Cashback' },
  { name: 'shield', icon: Shield, label: 'Secure' },
  { name: 'smartphone', icon: Smartphone, label: 'Mobile' },
  { name: 'qr-code', icon: QrCode, label: 'QR Pay' },
  { name: 'bitcoin', icon: Bitcoin, label: 'Crypto' },
  { name: 'circle-dollar-sign', icon: CircleDollarSign, label: 'Fund' },
  { name: 'receipt', icon: Receipt, label: 'Receipt' },
  { name: 'briefcase', icon: Briefcase, label: 'Work' },
  { name: 'percent', icon: Percent, label: 'Interest' },
  { name: 'chart-line', icon: ChartLine, label: 'Invest' },
  { name: 'gift', icon: Gift, label: 'Gift' },
]

const ALL_ICONS: Record<string, LucideIcon> = {}
for (const def of [...EXPENSE_ICONS, ...INCOME_ICONS, ...ACCOUNT_ICONS]) {
  ALL_ICONS[def.name] = def.icon
}
// Also add transfer/fallback icons
ALL_ICONS['arrow-right-left'] = ArrowRightLeft
ALL_ICONS['help-circle'] = HelpCircle

export function getIconComponent(iconName: string | null | undefined): LucideIcon {
  if (!iconName) return HelpCircle
  return ALL_ICONS[iconName] ?? HelpCircle
}

export function getDefaultIconForType(type: 'income' | 'expense'): string {
  return type === 'income' ? 'briefcase' : 'utensils'
}
