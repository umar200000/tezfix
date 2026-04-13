import {
  Cog,
  Droplet,
  CircleDot,
  Octagon,
  Zap,
  Car,
  Gauge,
  Snowflake,
  Fuel,
  Truck,
  ShieldAlert,
  Wrench,
  Sparkles,
  Paintbrush,
  Settings,
  CarFront,
  type LucideIcon,
} from 'lucide-react';

type IconConfig = {
  Icon: LucideIcon;
  tint: string; // tailwind bg class
  color: string; // tailwind text class
};

const map: Record<string, IconConfig> = {
  'engine-repair':   { Icon: Cog,         tint: 'bg-primary-50',  color: 'text-primary-600' },
  'oil-change':      { Icon: Droplet,     tint: 'bg-warn-50',     color: 'text-warn-600' },
  'tires':           { Icon: CircleDot,   tint: 'bg-surface-200', color: 'text-surface-800' },
  'brakes':          { Icon: Octagon,     tint: 'bg-danger-50',   color: 'text-danger-600' },
  'electrical':      { Icon: Zap,         tint: 'bg-warn-50',     color: 'text-warn-500' },
  'body-repair':     { Icon: Car,         tint: 'bg-primary-50',  color: 'text-primary-500' },
  'diagnostics':     { Icon: Gauge,       tint: 'bg-primary-50',  color: 'text-primary-600' },
  'ac-repair':       { Icon: Snowflake,   tint: 'bg-primary-50',  color: 'text-primary-400' },
  'fuel-delivery':   { Icon: Fuel,        tint: 'bg-success-50',  color: 'text-success-600' },
  'tow-truck':       { Icon: Truck,       tint: 'bg-warn-50',     color: 'text-warn-600' },
  'traffic-police':  { Icon: ShieldAlert, tint: 'bg-danger-50',   color: 'text-danger-500' },
  'call-mechanic':   { Icon: Wrench,      tint: 'bg-primary-50',  color: 'text-primary-600' },
  'car-wash':        { Icon: Sparkles,    tint: 'bg-primary-50',  color: 'text-primary-500' },
  'painting':        { Icon: Paintbrush,  tint: 'bg-success-50',  color: 'text-success-500' },
  'transmission':    { Icon: Settings,    tint: 'bg-surface-200', color: 'text-surface-800' },
};

const fallback: IconConfig = { Icon: Wrench, tint: 'bg-primary-50', color: 'text-primary-500' };

export function getCategoryIcon(slug: string): IconConfig {
  return map[slug] || fallback;
}

// Service/shop hero icon (used in cards without explicit category)
export const ServiceHeroIcon = CarFront;
