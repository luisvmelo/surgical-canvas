import { TileData, HospitalLayout, ImageCrop } from '@/data/types';
import { RotateCw, Trash2, Copy, X, Minus, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TilePropertyPanelProps {
  tile: TileData;
  layout: HospitalLayout;
  onUpdateLayout: (layout: HospitalLayout) => void;
  onClose: () => void;
}

export default function TilePropertyPanel({ tile, layout, onUpdateLayout, onClose }: TilePropertyPanelProps) {
  const updateTile = (updates: Partial<TileData>) => {
    onUpdateLayout({
      ...layout,
      tiles: layout.tiles.map(t => t.id === tile.id ? { ...t, ...updates } : t),
    });
  };

  const deleteTile = () => {
    onUpdateLayout({ ...layout, tiles: layout.tiles.filter(t => t.id !== tile.id) });
    onClose();
  };

  const duplicateTile = () => {
    const newTile = { ...tile, id: `T${Date.now()}`, nome: `${tile.nome} (cópia)`, posicao: { x: tile.posicao.x + 20, y: tile.posicao.y + 20 } };
    onUpdateLayout({ ...layout, tiles: [...layout.tiles, newTile] });
  };

  const rotateTile = () => updateTile({ rotacao: (tile.rotacao + 90) % 360 });

  const adjustSize = (dw: number, dh: number) => {
    updateTile({ tamanho: { w: Math.max(0.5, tile.tamanho.w + dw), h: Math.max(0.5, tile.tamanho.h + dh) } });
  };

  const resetCrop = () => updateTile({ imageCrop: { x: 0, y: 0, w: 1, h: 1 } });

  const crop = tile.imageCrop || { x: 0, y: 0, w: 1, h: 1 };
  const hasCrop = crop.x !== 0 || crop.y !== 0 || crop.w !== 1 || crop.h !== 1;

  return (
    <div className="glass rounded-xl border border-border p-4 space-y-4 animate-slide-in max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Propriedades</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
      </div>

      {/* Preview */}
      {tile.imagem_url && (
        <div className="rounded-lg overflow-hidden border border-border aspect-square relative">
          <img
            src={tile.imagem_url}
            alt={tile.nome}
            className="absolute pointer-events-none"
            style={{
              width: `${100 / crop.w}%`,
              height: `${100 / crop.h}%`,
              left: `${-(crop.x / crop.w) * 100}%`,
              top: `${-(crop.y / crop.h) * 100}%`,
              objectFit: 'fill',
            }}
          />
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Nome</label>
          <Input value={tile.nome} onChange={e => updateTile({ nome: e.target.value })} className="mt-1 h-8 text-sm bg-secondary border-border" />
        </div>

        {/* Size controls */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Tamanho</label>
          <div className="flex gap-2 mt-1">
            <div className="flex-1">
              <label className="text-[9px] text-muted-foreground">Largura</label>
              <div className="flex items-center gap-1">
                <button onClick={() => adjustSize(-0.25, 0)} className="p-1 rounded bg-secondary hover:bg-card-hover text-muted-foreground"><Minus size={12} /></button>
                <span className="font-mono text-xs text-foreground flex-1 text-center">{tile.tamanho.w}</span>
                <button onClick={() => adjustSize(0.25, 0)} className="p-1 rounded bg-secondary hover:bg-card-hover text-muted-foreground"><Plus size={12} /></button>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[9px] text-muted-foreground">Altura</label>
              <div className="flex items-center gap-1">
                <button onClick={() => adjustSize(0, -0.25)} className="p-1 rounded bg-secondary hover:bg-card-hover text-muted-foreground"><Minus size={12} /></button>
                <span className="font-mono text-xs text-foreground flex-1 text-center">{tile.tamanho.h}</span>
                <button onClick={() => adjustSize(0, 0.25)} className="p-1 rounded bg-secondary hover:bg-card-hover text-muted-foreground"><Plus size={12} /></button>
              </div>
            </div>
          </div>
        </div>

        {/* Crop info */}
        {tile.imagem_url && hasCrop && (
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Recorte</label>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[9px] text-muted-foreground font-mono">
                {Math.round(crop.x * 100)}%, {Math.round(crop.y * 100)}% — {Math.round(crop.w * 100)}×{Math.round(crop.h * 100)}%
              </span>
              <button onClick={resetCrop} className="text-[9px] text-destructive hover:underline flex items-center gap-0.5">
                <RotateCcw size={9} /> Resetar
              </button>
            </div>
          </div>
        )}

        {tile.imagem_url && !hasCrop && (
          <p className="text-[9px] text-muted-foreground">Duplo clique no tile para recortar a imagem</p>
        )}

        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</label>
          <Select value={tile.status} onValueChange={v => updateTile({ status: v as TileData['status'] })}>
            <SelectTrigger className="mt-1 h-8 text-sm bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="ocupado">Ocupado</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
              <SelectItem value="livre">Livre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Notas</label>
          <textarea
            value={tile.notas}
            onChange={e => updateTile({ notas: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded-md border border-border bg-secondary text-sm p-2 text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="text-[10px] text-muted-foreground font-mono">
          Pos: ({tile.posicao.x},{tile.posicao.y}) · {tile.tamanho.w}×{tile.tamanho.h} · {tile.rotacao}°
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={rotateTile} className="flex-1 h-7 text-xs"><RotateCw size={12} className="mr-1" />Rotacionar</Button>
        <Button variant="outline" size="sm" onClick={duplicateTile} className="flex-1 h-7 text-xs"><Copy size={12} className="mr-1" />Duplicar</Button>
        <Button variant="destructive" size="sm" onClick={deleteTile} className="h-7 text-xs px-2"><Trash2 size={12} /></Button>
      </div>
    </div>
  );
}
