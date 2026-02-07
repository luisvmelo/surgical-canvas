import { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize, X, Tag, MousePointer2, PenTool } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export type ZoneType = 'sala_cirurgica' | 'consultorio' | 'uti' | 'recuperacao' | 'recepcao' | 'corredor' | 'quarto' | 'almoxarifado' | 'cme' | 'elevador' | 'banheiro' | 'outro';

export interface FloorZone {
  id: string;
  label: string;
  tipo: ZoneType;
  /** Rectangle as percentage of image (0–1) */
  rect: { x: number; y: number; w: number; h: number };
}

const ZONE_COLORS: Record<ZoneType, { bg: string; border: string; text: string }> = {
  sala_cirurgica: { bg: 'bg-primary/25', border: 'border-primary', text: 'text-primary' },
  consultorio: { bg: 'bg-info/25', border: 'border-info', text: 'text-info' },
  uti: { bg: 'bg-destructive/25', border: 'border-destructive', text: 'text-destructive' },
  recuperacao: { bg: 'bg-success/25', border: 'border-success', text: 'text-success' },
  recepcao: { bg: 'bg-warning/25', border: 'border-warning', text: 'text-warning' },
  corredor: { bg: 'bg-muted/40', border: 'border-border', text: 'text-muted-foreground' },
  quarto: { bg: 'bg-accent/30', border: 'border-accent', text: 'text-accent-foreground' },
  almoxarifado: { bg: 'bg-secondary/50', border: 'border-border', text: 'text-secondary-foreground' },
  cme: { bg: 'bg-primary/15', border: 'border-primary/50', text: 'text-primary' },
  elevador: { bg: 'bg-info/15', border: 'border-info/50', text: 'text-info' },
  banheiro: { bg: 'bg-muted/30', border: 'border-muted-foreground/40', text: 'text-muted-foreground' },
  outro: { bg: 'bg-foreground/10', border: 'border-foreground/30', text: 'text-foreground' },
};

const ZONE_LABELS: Record<ZoneType, string> = {
  sala_cirurgica: 'Sala Cirúrgica',
  consultorio: 'Consultório',
  uti: 'UTI',
  recuperacao: 'Recuperação',
  recepcao: 'Recepção',
  corredor: 'Corredor',
  quarto: 'Quarto',
  almoxarifado: 'Almoxarifado',
  cme: 'CME',
  elevador: 'Elevador',
  banheiro: 'Banheiro',
  outro: 'Outro',
};

interface FloorPlanEditorProps {
  imageUrl: string;
  zones: FloorZone[];
  onUpdateZones: (zones: FloorZone[]) => void;
  readOnly?: boolean;
}

type Mode = 'select' | 'draw';

export default function FloorPlanEditor({ imageUrl, zones, onUpdateZones, readOnly = false }: FloorPlanEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const [mode, setMode] = useState<Mode>('select');
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);

  // Drawing state
  const [drawing, setDrawing] = useState<{ startX: number; startY: number; curX: number; curY: number } | null>(null);

  const [imgSize, setImgSize] = useState({ w: 1, h: 1 });

  const onImgLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
  }, []);

  /** Convert client coords to fraction of image (0-1) */
  const clientToFraction = useCallback((clientX: number, clientY: number) => {
    const img = imgRef.current;
    if (!img) return { x: 0, y: 0 };
    const rect = img.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top) / rect.height)),
    };
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(5, Math.max(0.3, zoom * delta));
    const ratio = newZoom / zoom;
    setPan(prev => ({
      x: mouseX - (mouseX - prev.x) * ratio,
      y: mouseY - (mouseY - prev.y) * ratio,
    }));
    setZoom(newZoom);
  }, [zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (mode === 'draw' && !readOnly && e.button === 0) {
      const frac = clientToFraction(e.clientX, e.clientY);
      setDrawing({ startX: frac.x, startY: frac.y, curX: frac.x, curY: frac.y });
      return;
    }

    // Select mode: pan
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.planBg === 'true') {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedZoneId(null);
    }
  }, [pan, mode, readOnly, clientToFraction]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (drawing) {
      const frac = clientToFraction(e.clientX, e.clientY);
      setDrawing(prev => prev ? { ...prev, curX: frac.x, curY: frac.y } : null);
    }
  }, [isPanning, panStart, drawing, clientToFraction]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    if (drawing) {
      const x = Math.min(drawing.startX, drawing.curX);
      const y = Math.min(drawing.startY, drawing.curY);
      const w = Math.abs(drawing.curX - drawing.startX);
      const h = Math.abs(drawing.curY - drawing.startY);
      // Only create if big enough
      if (w > 0.01 && h > 0.01) {
        const newZone: FloorZone = {
          id: `Z${Date.now()}`,
          label: '',
          tipo: 'outro',
          rect: { x, y, w, h },
        };
        onUpdateZones([...zones, newZone]);
        setSelectedZoneId(newZone.id);
        setMode('select');
      }
      setDrawing(null);
    }
  }, [drawing, zones, onUpdateZones]);

  const updateZone = useCallback((id: string, updates: Partial<FloorZone>) => {
    onUpdateZones(zones.map(z => z.id === id ? { ...z, ...updates } : z));
  }, [zones, onUpdateZones]);

  const deleteZone = useCallback((id: string) => {
    onUpdateZones(zones.filter(z => z.id !== id));
    if (selectedZoneId === id) setSelectedZoneId(null);
  }, [zones, onUpdateZones, selectedZoneId]);

  const selectedZone = zones.find(z => z.id === selectedZoneId);

  const zoomIn = () => setZoom(z => Math.min(5, z * 1.25));
  const zoomOut = () => setZoom(z => Math.max(0.3, z * 0.8));
  const resetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  return (
    <div className="relative rounded-xl border border-border overflow-hidden bg-background" style={{ height: '100%', minHeight: 300 }}>
      <div
        ref={containerRef}
        className={`w-full h-full ${drawing ? 'cursor-crosshair' : isPanning ? 'cursor-grabbing' : mode === 'draw' ? 'cursor-crosshair' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ overflow: 'hidden', position: 'relative' }}
      >
        {/* Image */}
        <div
          data-plan-bg="true"
          style={{
            position: 'absolute',
            left: pan.x,
            top: pan.y,
            transform: `scale(${zoom})`,
            transformOrigin: '0 0',
          }}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Planta do Hospital"
            onLoad={onImgLoad}
            draggable={false}
            className="select-none"
            style={{ display: 'block', maxWidth: 'none' }}
          />

          {/* Zones overlay */}
          {zones.map(zone => {
            const colors = ZONE_COLORS[zone.tipo];
            const isSelected = selectedZoneId === zone.id;
            return (
              <div
                key={zone.id}
                onClick={(e) => { e.stopPropagation(); if (mode === 'select') setSelectedZoneId(zone.id); }}
                className={`absolute border-2 ${colors.bg} ${colors.border} ${isSelected ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''} transition-shadow cursor-pointer hover:brightness-110`}
                style={{
                  left: `${zone.rect.x * 100}%`,
                  top: `${zone.rect.y * 100}%`,
                  width: `${zone.rect.w * 100}%`,
                  height: `${zone.rect.h * 100}%`,
                }}
              >
                <span className={`absolute top-0.5 left-1 text-[10px] font-bold ${colors.text} drop-shadow-sm leading-tight`}>
                  {zone.label || ZONE_LABELS[zone.tipo]}
                </span>
                {!readOnly && (
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteZone(zone.id); }}
                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <X size={10} />
                  </button>
                )}
              </div>
            );
          })}

          {/* Drawing preview */}
          {drawing && (
            <div
              className="absolute border-2 border-dashed border-primary bg-primary/15 pointer-events-none"
              style={{
                left: `${Math.min(drawing.startX, drawing.curX) * 100}%`,
                top: `${Math.min(drawing.startY, drawing.curY) * 100}%`,
                width: `${Math.abs(drawing.curX - drawing.startX) * 100}%`,
                height: `${Math.abs(drawing.curY - drawing.startY) * 100}%`,
              }}
            />
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="absolute top-4 left-4 flex items-center gap-1 glass rounded-lg border border-border p-1">
        {!readOnly && (
          <>
            <button
              onClick={() => setMode('select')}
              className={`p-1.5 rounded transition-colors ${mode === 'select' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
              title="Selecionar"
            >
              <MousePointer2 size={14} />
            </button>
            <button
              onClick={() => { setMode('draw'); setSelectedZoneId(null); }}
              className={`p-1.5 rounded transition-colors ${mode === 'draw' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
              title="Desenhar zona"
            >
              <PenTool size={14} />
            </button>
            <div className="w-px h-4 bg-border mx-0.5" />
          </>
        )}
        <span className="text-[10px] text-muted-foreground px-1">
          {mode === 'draw' ? 'Clique e arraste para marcar uma área' : 'Clique numa zona para editar'}
        </span>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 glass rounded-lg border border-border p-1">
        <button onClick={zoomOut} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <ZoomOut size={14} />
        </button>
        <span className="text-[10px] font-mono text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={zoomIn} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <ZoomIn size={14} />
        </button>
        <div className="w-px h-4 bg-border mx-0.5" />
        <button onClick={resetView} className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
          <Maximize size={14} />
        </button>
      </div>

      {/* Selected zone properties */}
      {selectedZone && !readOnly && (
        <div className="absolute bottom-4 left-4 glass rounded-lg border border-border p-3 w-64 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1"><Tag size={12} /> Propriedades</span>
            <button onClick={() => setSelectedZoneId(null)} className="text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Tipo</label>
            <Select value={selectedZone.tipo} onValueChange={(v) => updateZone(selectedZone.id, { tipo: v as ZoneType })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ZONE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-xs">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Nome</label>
            <Input
              value={selectedZone.label}
              onChange={(e) => updateZone(selectedZone.id, { label: e.target.value })}
              placeholder={ZONE_LABELS[selectedZone.tipo]}
              className="h-8 text-xs"
            />
          </div>
          <Button variant="destructive" size="sm" className="w-full h-7 text-xs" onClick={() => deleteZone(selectedZone.id)}>
            Remover zona
          </Button>
        </div>
      )}

      {/* Zone count */}
      <div className="absolute top-4 right-4 text-[10px] text-muted-foreground glass rounded-md px-2 py-1 border border-border">
        {zones.length} zona{zones.length !== 1 ? 's' : ''} marcada{zones.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
