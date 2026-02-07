import { Surgery, HospitalLayout, Alert, TileData } from './types';

const today = new Date().toISOString().split('T')[0];

function t(hour: number, min: number = 0): string {
  return `${today}T${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}:00`;
}

function makeStages(surgeryId: string, startHour: number, status: 'done' | 'in_progress' | 'pending') {
  const names = ['Check-in','Pré-op','Anestesia','Incisão','Procedimento','Fechamento','Recuperação','Limpeza','Montagem','Pronto'];
  const durations = [10,15,20,5,60,15,30,20,15,5]; // minutes
  let cumMin = 0;
  return names.map((nome, i) => {
    const inicio = new Date(new Date(t(startHour)).getTime() + cumMin * 60000).toISOString();
    cumMin += durations[i];
    const fim = new Date(new Date(t(startHour)).getTime() + cumMin * 60000).toISOString();
    
    let stageStatus: 'concluido' | 'em_andamento' | 'nao_iniciado' = 'nao_iniciado';
    let inicio_real: string | undefined;
    let fim_real: string | undefined;
    
    if (status === 'done') {
      stageStatus = 'concluido';
      const delay = Math.floor(Math.random() * 10) - 3;
      inicio_real = new Date(new Date(inicio).getTime() + delay * 60000).toISOString();
      fim_real = new Date(new Date(fim).getTime() + delay * 60000).toISOString();
    } else if (status === 'in_progress') {
      if (i < 4) { stageStatus = 'concluido'; inicio_real = inicio; fim_real = fim; }
      else if (i === 4) { stageStatus = 'em_andamento'; inicio_real = inicio; }
      else { stageStatus = 'nao_iniciado'; }
    }
    
    return {
      id: `${surgeryId}-s${i}`,
      surgery_id: surgeryId,
      nome,
      ordem: i,
      status: stageStatus,
      inicio_previsto: inicio,
      fim_previsto: fim,
      inicio_real,
      fim_real,
      responsavel: ['Dr. Silva','Enf. Ana','Dr. Costa','Tec. Marcos','Dr. Lima'][i % 5],
      checklist_items: [
        { id: `${surgeryId}-s${i}-c1`, label: 'Documentação verificada', checked: stageStatus === 'concluido' },
        { id: `${surgeryId}-s${i}-c2`, label: 'Equipamento pronto', checked: stageStatus === 'concluido' },
      ],
      comentarios: stageStatus === 'concluido' ? ['Sem intercorrências'] : [],
    };
  });
}

export const mockSurgeries: Surgery[] = [
  { id: 'S001', paciente_nome: 'Maria Oliveira', paciente_id: 'P001', procedimento: 'Colecistectomia Laparoscópica', cirurgiao: 'Dr. Roberto Silva', anestesista: 'Dra. Ana Martins', sala_id: 'SALA-01', inicio_previsto: t(7,30), fim_previsto: t(10,0), status_geral: 'concluida', tags: ['laparoscopia','urgência'], risco: 'baixo', observacoes: 'Paciente estável', convenio: 'Unimed', created_at: t(6), stages: makeStages('S001', 7, 'done') },
  { id: 'S002', paciente_nome: 'João Santos', paciente_id: 'P002', procedimento: 'Artroplastia Total do Joelho', cirurgiao: 'Dr. Carlos Lima', anestesista: 'Dr. Pedro Costa', sala_id: 'SALA-02', inicio_previsto: t(8,0), fim_previsto: t(11,30), status_geral: 'em_andamento', tags: ['ortopedia','prótese'], risco: 'medio', observacoes: 'Alergia a latex', convenio: 'Bradesco Saúde', created_at: t(6), stages: makeStages('S002', 8, 'in_progress') },
  { id: 'S003', paciente_nome: 'Ana Pereira', paciente_id: 'P003', procedimento: 'Histerectomia', cirurgiao: 'Dra. Fernanda Rocha', anestesista: 'Dra. Ana Martins', sala_id: 'SALA-03', inicio_previsto: t(9,0), fim_previsto: t(12,0), status_geral: 'atrasada', tags: ['ginecologia'], risco: 'alto', observacoes: 'Material OPME pendente', convenio: 'SulAmérica', created_at: t(6), stages: makeStages('S003', 9, 'in_progress') },
  { id: 'S004', paciente_nome: 'Pedro Almeida', paciente_id: 'P004', procedimento: 'Herniorrafia Inguinal', cirurgiao: 'Dr. Roberto Silva', anestesista: 'Dr. Marcos Vieira', sala_id: 'SALA-01', inicio_previsto: t(11,0), fim_previsto: t(13,0), status_geral: 'agendada', tags: ['ambulatorial'], risco: 'baixo', observacoes: '', convenio: 'Amil', created_at: t(6), stages: makeStages('S004', 11, 'pending') },
  { id: 'S005', paciente_nome: 'Lucia Fernandes', paciente_id: 'P005', procedimento: 'Revascularização do Miocárdio', cirurgiao: 'Dr. André Barros', anestesista: 'Dra. Carla Nunes', sala_id: 'SALA-04', inicio_previsto: t(7,0), fim_previsto: t(12,0), status_geral: 'em_andamento', tags: ['cardíaca','alto risco','UTI'], risco: 'alto', observacoes: 'Reserva UTI confirmada', convenio: 'Unimed', created_at: t(6), stages: makeStages('S005', 7, 'in_progress') },
  { id: 'S006', paciente_nome: 'Carlos Ribeiro', paciente_id: 'P006', procedimento: 'Apendicectomia', cirurgiao: 'Dr. Lucas Mendes', anestesista: 'Dr. Pedro Costa', sala_id: 'SALA-05', inicio_previsto: t(10,0), fim_previsto: t(11,30), status_geral: 'em_preparo', tags: ['emergência','laparoscopia'], risco: 'medio', observacoes: 'Chegou do PS', convenio: 'Particular', created_at: t(6), stages: makeStages('S006', 10, 'pending') },
  { id: 'S007', paciente_nome: 'Fernanda Costa', paciente_id: 'P007', procedimento: 'Mastectomia Parcial', cirurgiao: 'Dra. Beatriz Lopes', anestesista: 'Dra. Ana Martins', sala_id: 'SALA-03', inicio_previsto: t(13,0), fim_previsto: t(15,30), status_geral: 'agendada', tags: ['oncologia','biópsia'], risco: 'medio', observacoes: 'Anatomopatológico intraop', convenio: 'Bradesco Saúde', created_at: t(6), stages: makeStages('S007', 13, 'pending') },
  { id: 'S008', paciente_nome: 'Roberto Dias', paciente_id: 'P008', procedimento: 'Artroscopia do Ombro', cirurgiao: 'Dr. Carlos Lima', anestesista: 'Dr. Marcos Vieira', sala_id: 'SALA-02', inicio_previsto: t(13,30), fim_previsto: t(15,0), status_geral: 'agendada', tags: ['ortopedia','ambulatorial'], risco: 'baixo', observacoes: '', convenio: 'Unimed', created_at: t(6), stages: makeStages('S008', 13, 'pending') },
  { id: 'S009', paciente_nome: 'Mariana Souza', paciente_id: 'P009', procedimento: 'Cesariana', cirurgiao: 'Dra. Fernanda Rocha', anestesista: 'Dra. Carla Nunes', sala_id: 'SALA-06', inicio_previsto: t(14,0), fim_previsto: t(15,30), status_geral: 'agendada', tags: ['obstetrícia','neonatal'], risco: 'baixo', observacoes: 'Neonatologista confirmado', convenio: 'SulAmérica', created_at: t(6), stages: makeStages('S009', 14, 'pending') },
  { id: 'S010', paciente_nome: 'Antonio Moreira', paciente_id: 'P010', procedimento: 'Colectomia Direita', cirurgiao: 'Dr. André Barros', anestesista: 'Dr. Pedro Costa', sala_id: 'SALA-04', inicio_previsto: t(14,0), fim_previsto: t(17,0), status_geral: 'agendada', tags: ['oncologia','laparoscopia'], risco: 'alto', observacoes: 'Hemoderivados reservados', convenio: 'Amil', created_at: t(6), stages: makeStages('S010', 14, 'pending') },
];

export const mockAlerts: Alert[] = [
  { id: 'A1', type: 'critical', message: 'Sala 3 em atraso — 25min além do previsto', timestamp: t(9,45) },
  { id: 'A2', type: 'warning', message: 'UTI lotada — ocupação 95%', timestamp: t(8,30) },
  { id: 'A3', type: 'warning', message: 'Material OPME pendente — Sala 3', timestamp: t(8,0) },
  { id: 'A4', type: 'info', message: 'Sala 1 liberada — pronta para próxima', timestamp: t(10,15) },
  { id: 'A5', type: 'critical', message: 'Hemoderivados não confirmados — S010', timestamp: t(7,30) },
  { id: 'A6', type: 'info', message: 'Dr. Carlos Lima chegou ao CC', timestamp: t(7,45) },
];

const defaultTiles: TileData[] = [
  { id: 'T01', nome: 'Sala Cirúrgica 1', tipo: 'sala_cirurgica', capacidade: 1, status: 'ocupado', propriedades: {}, posicao: { x: 0, y: 0 }, tamanho: { w: 2, h: 2 }, rotacao: 0, layer: 'salas', tags: ['principal'], notas: '' },
  { id: 'T02', nome: 'Sala Cirúrgica 2', tipo: 'sala_cirurgica', capacidade: 1, status: 'ocupado', propriedades: {}, posicao: { x: 2, y: 0 }, tamanho: { w: 2, h: 2 }, rotacao: 0, layer: 'salas', tags: [], notas: '' },
  { id: 'T03', nome: 'Sala Cirúrgica 3', tipo: 'sala_cirurgica', capacidade: 1, status: 'manutencao', propriedades: {}, posicao: { x: 4, y: 0 }, tamanho: { w: 2, h: 2 }, rotacao: 0, layer: 'salas', tags: [], notas: 'Em manutenção preventiva' },
  { id: 'T04', nome: 'UTI', tipo: 'uti', capacidade: 12, status: 'ativo', propriedades: { leitos_ocupados: 11 }, posicao: { x: 0, y: 3 }, tamanho: { w: 3, h: 2 }, rotacao: 0, layer: 'salas', tags: ['crítico'], notas: '' },
  { id: 'T05', nome: 'Recuperação', tipo: 'recuperacao', capacidade: 8, status: 'ativo', propriedades: {}, posicao: { x: 3, y: 3 }, tamanho: { w: 3, h: 2 }, rotacao: 0, layer: 'salas', tags: [], notas: '' },
  { id: 'T06', nome: 'Recepção CC', tipo: 'recepcao', capacidade: 0, status: 'ativo', propriedades: {}, posicao: { x: 0, y: 6 }, tamanho: { w: 2, h: 1 }, rotacao: 0, layer: 'estrutura', tags: [], notas: '' },
  { id: 'T07', nome: 'CME', tipo: 'cme', capacidade: 0, status: 'ativo', propriedades: {}, posicao: { x: 6, y: 0 }, tamanho: { w: 2, h: 2 }, rotacao: 0, layer: 'estrutura', tags: [], notas: '' },
  { id: 'T08', nome: 'Corredor Principal', tipo: 'corredor', capacidade: 0, status: 'ativo', propriedades: {}, posicao: { x: 0, y: 2 }, tamanho: { w: 8, h: 1 }, rotacao: 0, layer: 'estrutura', tags: [], notas: '' },
  { id: 'T09', nome: 'Almoxarifado', tipo: 'almoxarifado', capacidade: 0, status: 'ativo', propriedades: {}, posicao: { x: 6, y: 3 }, tamanho: { w: 2, h: 2 }, rotacao: 0, layer: 'estrutura', tags: [], notas: '' },
  { id: 'T10', nome: 'Sala Cirúrgica 4', tipo: 'sala_cirurgica', capacidade: 1, status: 'ocupado', propriedades: {}, posicao: { x: 2, y: 6 }, tamanho: { w: 2, h: 1 }, rotacao: 0, layer: 'salas', tags: ['cardíaca'], notas: '' },
];

export const mockLayout: HospitalLayout = {
  id: 'L001',
  nome: 'Andar 2 — Centro Cirúrgico',
  hospital_id: 'H001',
  tiles: defaultTiles,
  links: [
    { id: 'LK1', from_tile_id: 'T08', to_tile_id: 'T01', tipo: 'corredor', label: '' },
    { id: 'LK2', from_tile_id: 'T08', to_tile_id: 'T04', tipo: 'corredor', label: '' },
  ],
  updated_at: new Date().toISOString(),
};

export const tileLibraryDefaults: { tipo: TileData['tipo']; nome: string; icon: string }[] = [
  { tipo: 'sala_cirurgica', nome: 'Sala Cirúrgica', icon: '🏥' },
  { tipo: 'consultorio', nome: 'Consultório', icon: '🩺' },
  { tipo: 'uti', nome: 'UTI', icon: '❤️‍🩹' },
  { tipo: 'recuperacao', nome: 'Recuperação', icon: '🛏️' },
  { tipo: 'recepcao', nome: 'Recepção', icon: '🪑' },
  { tipo: 'almoxarifado', nome: 'Almoxarifado', icon: '📦' },
  { tipo: 'cme', nome: 'CME', icon: '🧪' },
  { tipo: 'corredor', nome: 'Corredor', icon: '↔️' },
  { tipo: 'elevador', nome: 'Elevador', icon: '🛗' },
];
