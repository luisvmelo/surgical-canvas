export type SurgeryStatus = 'agendada' | 'em_preparo' | 'em_andamento' | 'concluida' | 'atrasada' | 'cancelada';
export type StageStatus = 'nao_iniciado' | 'em_andamento' | 'concluido' | 'pulado';
export type TileType = 'sala_cirurgica' | 'consultorio' | 'uti' | 'recuperacao' | 'recepcao' | 'almoxarifado' | 'cme' | 'corredor' | 'elevador' | 'custom';
export type TileStatus = 'ativo' | 'manutencao' | 'ocupado' | 'livre';
export type LayerType = 'estrutura' | 'salas' | 'equipamentos' | 'fluxos';
export type RiskTag = 'alto' | 'medio' | 'baixo';

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Stage {
  id: string;
  surgery_id: string;
  nome: string;
  ordem: number;
  status: StageStatus;
  inicio_previsto: string;
  fim_previsto: string;
  inicio_real?: string;
  fim_real?: string;
  responsavel: string;
  checklist_items: ChecklistItem[];
  comentarios: string[];
}

export interface Surgery {
  id: string;
  paciente_nome: string;
  paciente_id: string;
  procedimento: string;
  cirurgiao: string;
  anestesista: string;
  sala_id: string;
  inicio_previsto: string;
  fim_previsto: string;
  status_geral: SurgeryStatus;
  tags: string[];
  risco: RiskTag;
  observacoes: string;
  convenio: string;
  created_at: string;
  stages: Stage[];
}

export interface ImageCrop {
  objectFit: 'cover' | 'contain' | 'fill';
  objectPosition: string; // e.g. "center center", "top left", "30% 60%"
  scale: number; // 1 = normal, >1 = zoomed in
  offsetX: number; // px offset for drag-crop
  offsetY: number;
}

export interface TileData {
  id: string;
  nome: string;
  tipo: TileType;
  imagem_url?: string;
  imageCrop?: ImageCrop;
  capacidade: number;
  status: TileStatus;
  propriedades: Record<string, any>;
  posicao: { x: number; y: number };
  tamanho: { w: number; h: number };
  rotacao: number;
  layer: LayerType;
  tags: string[];
  notas: string;
}

export interface TileLink {
  id: string;
  from_tile_id: string;
  to_tile_id: string;
  tipo: 'corredor' | 'fluxo';
  label: string;
}

export interface HospitalLayout {
  id: string;
  nome: string;
  hospital_id: string;
  tiles: TileData[];
  links: TileLink[];
  updated_at: string;
}

export interface Alert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  timestamp: string;
}
