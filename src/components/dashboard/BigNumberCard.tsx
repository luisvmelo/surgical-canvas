import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface BigNumberCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'info';
}

const variantStyles = {
  default: 'border-border',
  success: 'border-success/30 glow-primary',
  warning: 'border-warning/30 glow-warning',
  destructive: 'border-destructive/30 glow-destructive',
  info: 'border-info/30',
};

const iconVariantStyles = {
  default: 'text-primary bg-primary/10',
  success: 'text-success bg-success/10',
  warning: 'text-warning bg-warning/10',
  destructive: 'text-destructive bg-destructive/10',
  info: 'text-info bg-info/10',
};

export default function BigNumberCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: BigNumberCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-4 border ${variantStyles[variant]} transition-all hover:scale-[1.02] cursor-default`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${iconVariantStyles[variant]}`}>
          <Icon size={16} />
        </div>
      </div>
      <div className="font-mono text-3xl font-bold text-foreground tracking-tight">{value}</div>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
      {trend && (
        <div className={`text-xs mt-2 font-medium ${trend.value >= 0 ? 'text-success' : 'text-destructive'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </div>
      )}
    </motion.div>
  );
}
