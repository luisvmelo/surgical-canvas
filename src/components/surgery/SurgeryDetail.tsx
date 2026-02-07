import { Surgery } from '@/data/types';
import { motion } from 'framer-motion';
import { User, Stethoscope, MapPin, Shield, Package, FileText, Syringe } from 'lucide-react';
import TimelineStage from './TimelineStage';

interface SurgeryDetailProps {
  surgery: Surgery;
}

function InfoCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="glass rounded-lg p-3 border border-border">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={13} className="text-primary" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      </div>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function SurgeryDetail({ surgery }: SurgeryDetailProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-lg font-bold text-foreground">{surgery.paciente_nome}</h2>
        <p className="text-sm text-muted-foreground">{surgery.procedimento}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <InfoCard icon={User} label="Paciente" value={surgery.paciente_nome} />
        <InfoCard icon={Stethoscope} label="Cirurgião" value={surgery.cirurgiao} />
        <InfoCard icon={Syringe} label="Anestesista" value={surgery.anestesista} />
        <InfoCard icon={MapPin} label="Sala" value={surgery.sala_id} />
        <InfoCard icon={Shield} label="Convênio" value={surgery.convenio} />
        <InfoCard icon={Package} label="Risco" value={surgery.risco.toUpperCase()} />
      </div>

      {surgery.observacoes && (
        <div className="glass rounded-lg p-3 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <FileText size={13} className="text-primary" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Observações</span>
          </div>
          <p className="text-sm text-foreground">{surgery.observacoes}</p>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Timeline Cirúrgica</h3>
        <div className="space-y-1">
          {surgery.stages.map((stage, i) => (
            <TimelineStage key={stage.id} stage={stage} isLast={i === surgery.stages.length - 1} />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
