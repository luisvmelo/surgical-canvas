import { Alert } from '@/data/types';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';

const iconMap = {
  critical: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styleMap = {
  critical: 'border-destructive/40 bg-destructive/5 text-destructive',
  warning: 'border-warning/40 bg-warning/5 text-warning',
  info: 'border-info/40 bg-info/5 text-info',
};

export default function AlertsList({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Alertas Ativos</h3>
      {alerts.map((alert, i) => {
        const Icon = iconMap[alert.type];
        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs ${styleMap[alert.type]}`}
          >
            <Icon size={14} className="mt-0.5 shrink-0" />
            <span className="font-medium leading-relaxed">{alert.message}</span>
          </motion.div>
        );
      })}
    </div>
  );
}
