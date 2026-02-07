import { TileData, HospitalLayout } from '@/data/types';
import { RotateCw, Trash2, Copy, X } from 'lucide-react';
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
    const newTile = { ...tile, id: `T${Date.now()}`, nome: `${tile.nome} (cópia)`, posicao: { x: tile.posicao.x + 1, y: tile.posicao.y + 1 } };
    onUpdateLayout({ ...layout, tiles: [...layout.tiles, newTile] });
  };

  const rotateTile = () => {
    updateTile({ rotacao: (tile.rotacao + 90) % 360 });
  };

  return (
    <div className="glass rounded-xl border border-border p-4 space-y-4 animate-slide-in">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Propriedades</h3>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Nome</label>
          <Input value={tile.nome} onChange={e => updateTile({ nome: e.target.value })} className="mt-1 h-8 text-sm bg-secondary border-border" />
        </div>

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
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Capacidade</label>
          <Input type="number" value={tile.capacidade} onChange={e => updateTile({ capacidade: +e.target.value })} className="mt-1 h-8 text-sm bg-secondary border-border" />
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
