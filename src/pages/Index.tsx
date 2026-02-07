import { useState } from 'react';
import { mockSurgeries, mockAlerts, mockLayout } from '@/data/mockData';
import { Surgery, HospitalLayout } from '@/data/types';
import BigNumberCard from '@/components/dashboard/BigNumberCard';
import MiniCharts from '@/components/dashboard/MiniCharts';
import AlertsList from '@/components/dashboard/AlertsList';
import SurgeryCard from '@/components/surgery/SurgeryCard';
import SurgeryDetail from '@/components/surgery/SurgeryDetail';
import TileCanvasGrid from '@/components/hospital/TileCanvasGrid';
import TileLibrary from '@/components/hospital/TileLibrary';

import {
  Activity, Clock, AlertTriangle, CalendarClock, DoorOpen,
  RotateCcw, Timer, Search, Download, Upload
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

type TabType = 'dashboard' | 'mapa' | 'hospital';

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [selectedSurgery, setSelectedSurgery] = useState<Surgery | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [layout, setLayout] = useState<HospitalLayout>(mockLayout);
  const [selectedTileId, setSelectedTileId] = useState<string | null>(null);

  const surgeries = mockSurgeries;
  const emAndamento = surgeries.filter(s => s.status_geral === 'em_andamento').length;
  const atrasadas = surgeries.filter(s => s.status_geral === 'atrasada').length;
  const proximas2h = surgeries.filter(s => {
    const start = new Date(s.inicio_previsto).getTime();
    const now = Date.now();
    return start > now && start - now < 2 * 60 * 60 * 1000 && s.status_geral === 'agendada';
  }).length;
  const salasEmUso = new Set(surgeries.filter(s => ['em_andamento', 'em_preparo'].includes(s.status_geral)).map(s => s.sala_id)).size;

  const filtered = surgeries.filter(s =>
    !searchQuery ||
    s.paciente_nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.procedimento.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.cirurgiao.toLowerCase().includes(searchQuery.toLowerCase())
  );



  const tabs: { id: TabType; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'mapa', label: 'Mapa Cirúrgico' },
    { id: 'hospital', label: 'Hospital Virtual' },
  ];

  const exportLayout = () => {
    const blob = new Blob([JSON.stringify(layout, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'layout.json'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="glass border-b border-border sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Activity size={16} className="text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-foreground tracking-tight">SurgiControl</h1>
                <p className="text-[10px] text-muted-foreground">Centro Cirúrgico</p>
              </div>
            </div>

            <nav className="flex ml-6 gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setSelectedSurgery(null); }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente, procedimento..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 h-8 w-64 text-xs bg-secondary border-border"
              />
            </div>
            <div className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
            <span className="text-[10px] text-muted-foreground">Ao vivo</span>
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-up">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <BigNumberCard title="Cirurgias Hoje" value={surgeries.length} icon={CalendarClock} variant="default" subtitle="total agendadas" />
              <BigNumberCard title="Em Andamento" value={emAndamento} icon={Activity} variant="info" />
              <BigNumberCard title="Atrasadas" value={atrasadas} icon={AlertTriangle} variant="destructive" />
              <BigNumberCard title="Próximas 2h" value={proximas2h} icon={Clock} variant="warning" />
              <BigNumberCard title="Salas em Uso" value={`${salasEmUso}/6`} icon={DoorOpen} variant="success" />
              <BigNumberCard title="Giro Médio" value="2.3" icon={RotateCcw} subtitle="cirurgias/sala" />
              <BigNumberCard title="Tempo Médio" value="42min" icon={Timer} subtitle="por etapa" />
            </div>

            {/* Hospital Virtual Preview */}
            <div className="glass rounded-xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mapa do Hospital — {layout.nome}</h3>
                <button
                  onClick={() => setActiveTab('hospital')}
                  className="text-[10px] text-primary hover:underline font-medium"
                >
                  Editar no Hospital Virtual →
                </button>
              </div>
              <div style={{ height: 600 }}>
                <TileCanvasGrid
                  layout={layout}
                  onUpdateLayout={setLayout}
                  selectedTileId={null}
                  onSelectTile={() => {}}
                  readOnly
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MiniCharts />
              <AlertsList alerts={mockAlerts} />
            </div>
          </div>
        )}

        {/* Mapa Cirúrgico Tab */}
        {activeTab === 'mapa' && (
          <div className="flex gap-6 animate-fade-up">
            <div className="w-80 shrink-0 space-y-3 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin pr-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Cirurgias ({filtered.length})
              </h2>
              {filtered.map(s => (
                <SurgeryCard
                  key={s.id}
                  surgery={s}
                  isSelected={selectedSurgery?.id === s.id}
                  onClick={() => setSelectedSurgery(s)}
                />
              ))}
            </div>
            <div className="flex-1 max-h-[calc(100vh-120px)] overflow-y-auto scrollbar-thin">
              {selectedSurgery ? (
                <SurgeryDetail surgery={selectedSurgery} />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  <div className="text-center">
                    <Activity size={40} className="mx-auto mb-3 opacity-20" />
                    <p>Selecione uma cirurgia para ver os detalhes</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Hospital Virtual Tab */}
        {activeTab === 'hospital' && (
          <div className="flex gap-6 animate-fade-up">
            <div className="w-56 shrink-0 space-y-4">
              <TileLibrary />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-bold text-foreground">{layout.nome}</h2>
                  <p className="text-[10px] text-muted-foreground">{layout.tiles.length} tiles · Última edição: {new Date(layout.updated_at).toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs" onClick={exportLayout}><Download size={12} className="mr-1" />Exportar</Button>
                  <Button variant="outline" size="sm" className="h-7 text-xs"><Upload size={12} className="mr-1" />Importar</Button>
                </div>
              </div>
              <div style={{ height: 'calc(100vh - 220px)' }}>
                <TileCanvasGrid
                  layout={layout}
                  onUpdateLayout={setLayout}
                  selectedTileId={selectedTileId}
                  onSelectTile={setSelectedTileId}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
