import { Surgery, SurgeryStatus, RiskTag } from '@/data/types';
import { motion } from 'framer-motion';
import { Clock, User, MapPin, AlertTriangle } from 'lucide-react';

const statusColors: Record<SurgeryStatus, string> = {
  agendada: 'bg-muted text-muted-foreground',
  em_preparo: 'bg-info/20 text-info',
  em_andamento: 'bg-primary/20 text-primary',
  concluida: 'bg-success/20 text-success',
  atrasada: 'bg-destructive/20 text-destructive',
  cancelada: 'bg-muted text-muted-foreground line-through',
};

const statusLabels: Record<SurgeryStatus, string> = {
  agendada: 'Agendada',
  em_preparo: 'Em Preparo',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída',
  atrasada: 'Atrasada',
  cancelada: 'Cancelada',
};

const riskColors: Record<RiskTag, string> = {
  alto: 'bg-destructive/20 text-destructive',
  medio: 'bg-warning/20 text-warning',
  baixo: 'bg-success/20 text-success',
};

interface SurgeryCardProps {
  surgery: Surgery;
  isSelected: boolean;
  onClick: () => void;
}

export default function SurgeryCard({ surgery, isSelected, onClick }: SurgeryCardProps) {
  const startTime = new Date(surgery.inicio_previsto).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(surgery.fim_previsto).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      layout
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`glass rounded-xl p-4 cursor-pointer transition-all border ${
        isSelected ? 'border-primary glow-primary' : 'border-border hover:border-primary/30'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground truncate">{surgery.paciente_nome}</h4>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{surgery.procedimento}</p>
        </div>
        <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full shrink-0 ml-2 ${statusColors[surgery.status_geral]}`}>
          {statusLabels[surgery.status_geral]}
        </span>
      </div>

      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-3">
        <span className="flex items-center gap-1"><User size={11} />{surgery.cirurgiao.split(' ').slice(-1)}</span>
        <span className="flex items-center gap-1"><MapPin size={11} />{surgery.sala_id}</span>
        <span className="flex items-center gap-1"><Clock size={11} />{startTime}–{endTime}</span>
      </div>

      <div className="flex gap-1.5 mt-3 flex-wrap">
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${riskColors[surgery.risco]}`}>
          {surgery.risco === 'alto' && <AlertTriangle size={9} className="inline mr-0.5 -mt-0.5" />}
          {surgery.risco.toUpperCase()}
        </span>
        {surgery.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{tag}</span>
        ))}
      </div>
    </motion.div>
  );
}
