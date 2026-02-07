import { Stage, StageStatus } from '@/data/types';
import { Check, Clock, Circle, SkipForward } from 'lucide-react';
import { motion } from 'framer-motion';

const statusConfig: Record<StageStatus, { icon: any; color: string; bgLine: string }> = {
  concluido: { icon: Check, color: 'text-success bg-success/20 border-success/40', bgLine: 'bg-success/40' },
  em_andamento: { icon: Clock, color: 'text-primary bg-primary/20 border-primary/40 animate-pulse-glow', bgLine: 'bg-primary/30' },
  nao_iniciado: { icon: Circle, color: 'text-muted-foreground bg-muted border-border', bgLine: 'bg-border' },
  pulado: { icon: SkipForward, color: 'text-muted-foreground bg-muted border-border', bgLine: 'bg-border' },
};

function fmt(iso?: string) {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function diffMin(a?: string, b?: string) {
  if (!a || !b) return null;
  return Math.round((new Date(a).getTime() - new Date(b).getTime()) / 60000);
}

export default function TimelineStage({ stage, isLast }: { stage: Stage; isLast: boolean }) {
  const config = statusConfig[stage.status];
  const Icon = config.icon;
  const delay = diffMin(stage.inicio_real, stage.inicio_previsto);

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`w-8 h-8 rounded-full flex items-center justify-center border ${config.color}`}
        >
          <Icon size={14} />
        </motion.div>
        {!isLast && <div className={`w-0.5 flex-1 min-h-[24px] ${config.bgLine}`} />}
      </div>

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex-1 pb-4"
      >
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-foreground">{stage.nome}</h4>
          {delay !== null && delay !== 0 && (
            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
              delay > 0 ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'
            }`}>
              {delay > 0 ? `+${delay}min` : `${delay}min`}
            </span>
          )}
        </div>

        <div className="flex gap-4 mt-1 text-[11px] text-muted-foreground">
          <span>Previsto: <span className="font-mono">{fmt(stage.inicio_previsto)}–{fmt(stage.fim_previsto)}</span></span>
          {stage.inicio_real && (
            <span>Real: <span className="font-mono text-foreground">{fmt(stage.inicio_real)}{stage.fim_real ? `–${fmt(stage.fim_real)}` : '…'}</span></span>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground mt-0.5">{stage.responsavel}</p>
      </motion.div>
    </div>
  );
}
