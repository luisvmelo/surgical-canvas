import { TileData, HospitalLayout, ImageCrop } from '@/data/types';
import { RotateCw, Trash2, Copy, X, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

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

  const crop: ImageCrop = { objectFit: 'cover', objectPosition: 'center center', scale: 1, offsetX: 0, offsetY: 0, ...tile.imageCrop };

  const updateCrop = (updates: Partial<ImageCrop>) => {
    updateTile({ imageCrop: { ...crop, ...updates } });
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

  return (
    <div className="glass rounded-xl border border-border p-4 space-y-4 animate-slide-in max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Propriedades</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
      </div>

      {/* Preview */}
      {tile.imagem_url && (
        <div className="rounded-lg overflow-hidden border border-border aspect-square">
          <img
            src={tile.imagem_url}
            alt={tile.nome}
            className="w-full h-full"
            style={{
              objectFit: crop.objectFit,
              objectPosition: crop.objectPosition,
              transform: `scale(${crop.scale})`,
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

        {/* Image Crop controls */}
        {tile.imagem_url && (
          <>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Ajuste da Imagem</label>
              <Select value={crop.objectFit} onValueChange={v => updateCrop({ objectFit: v as ImageCrop['objectFit'] })}>
                <SelectTrigger className="mt-1 h-8 text-sm bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cover">Preencher (cortar)</SelectItem>
                  <SelectItem value="contain">Encaixar (sem corte)</SelectItem>
                  <SelectItem value="fill">Esticar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Posição</label>
              <div className="grid grid-cols-3 gap-1 mt-1">
                {['top left','top center','top right','center left','center center','center right','bottom left','bottom center','bottom right'].map(pos => (
                  <button
                    key={pos}
                    onClick={() => updateCrop({ objectPosition: pos })}
                    className={`h-6 rounded text-[8px] transition-colors ${
                      crop.objectPosition === pos
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-card-hover'
                    }`}
                  >
                    {pos.split(' ').map(w => w[0].toUpperCase()).join('')}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Zoom da Imagem ({Math.round(crop.scale * 100)}%)</label>
              <Slider
                value={[crop.scale]}
                onValueChange={([v]) => updateCrop({ scale: v })}
                min={0.5}
                max={3}
                step={0.1}
                className="mt-2"
              />
            </div>
          </>
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
