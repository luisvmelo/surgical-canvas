import { useState, useCallback } from 'react';
import { TileData, HospitalLayout } from '@/data/types';
import { motion } from 'framer-motion';

const CELL_SIZE = 60;

const tileColors: Record<string, string> = {
  sala_cirurgica: 'bg-primary/20 border-primary/40 text-primary',
  consultorio: 'bg-info/20 border-info/40 text-info',
  uti: 'bg-destructive/20 border-destructive/40 text-destructive',
  recuperacao: 'bg-success/20 border-success/40 text-success',
  recepcao: 'bg-warning/20 border-warning/40 text-warning',
  almoxarifado: 'bg-secondary border-border text-secondary-foreground',
  cme: 'bg-accent/30 border-accent/40 text-accent-foreground',
  corredor: 'bg-muted/50 border-border text-muted-foreground',
  elevador: 'bg-info/10 border-info/30 text-info',
  custom: 'bg-primary/10 border-primary/30 text-primary',
};

const statusDot: Record<string, string> = {
  ativo: 'bg-success',
  ocupado: 'bg-warning',
  manutencao: 'bg-destructive',
  livre: 'bg-primary',
};

interface TileCanvasGridProps {
  layout: HospitalLayout;
  onUpdateLayout: (layout: HospitalLayout) => void;
  selectedTileId: string | null;
  onSelectTile: (id: string | null) => void;
}

export default function TileCanvasGrid({ layout, onUpdateLayout, selectedTileId, onSelectTile }: TileCanvasGridProps) {
  const [dragOffset, setDragOffset] = useState<{ id: string; dx: number; dy: number } | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const tileId = e.dataTransfer.getData('tile-id');
    const newTileType = e.dataTransfer.getData('new-tile-type');
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    if (newTileType) {
      const newTile: TileData = {
        id: `T${Date.now()}`,
        nome: e.dataTransfer.getData('new-tile-nome') || 'Novo Tile',
        tipo: newTileType as TileData['tipo'],
        capacidade: 0,
        status: 'ativo',
        propriedades: {},
        posicao: { x, y },
        tamanho: { w: 2, h: 1 },
        rotacao: 0,
        layer: 'salas',
        tags: [],
        notas: '',
      };
      onUpdateLayout({ ...layout, tiles: [...layout.tiles, newTile] });
      onSelectTile(newTile.id);
      return;
    }

    if (tileId) {
      const updated = layout.tiles.map(t =>
        t.id === tileId ? { ...t, posicao: { x: Math.max(0, x), y: Math.max(0, y) } } : t
      );
      onUpdateLayout({ ...layout, tiles: updated });
    }
  }, [layout, onUpdateLayout, onSelectTile]);

  const handleTileDragStart = (e: React.DragEvent, tile: TileData) => {
    e.dataTransfer.setData('tile-id', tile.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const maxX = Math.max(...layout.tiles.map(t => t.posicao.x + t.tamanho.w), 10);
  const maxY = Math.max(...layout.tiles.map(t => t.posicao.y + t.tamanho.h), 8);

  return (
    <div className="relative overflow-auto scrollbar-thin rounded-xl border border-border bg-background">
      <div
        className="relative tile-grid-bg"
        style={{ width: maxX * CELL_SIZE + 120, height: maxY * CELL_SIZE + 120, minWidth: '100%', minHeight: 400 }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelectTile(null);
        }}
      >
        {layout.tiles.map(tile => (
          <motion.div
            key={tile.id}
            draggable
            onDragStart={(e: any) => handleTileDragStart(e, tile)}
            onClick={(e) => { e.stopPropagation(); onSelectTile(tile.id); }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute',
              left: tile.posicao.x * CELL_SIZE,
              top: tile.posicao.y * CELL_SIZE,
              width: tile.tamanho.w * CELL_SIZE - 4,
              height: tile.tamanho.h * CELL_SIZE - 4,
              transform: `rotate(${tile.rotacao}deg)`,
            }}
            className={`rounded-lg border-2 cursor-grab active:cursor-grabbing p-2 flex flex-col justify-between transition-all ${
              tileColors[tile.tipo] || tileColors.custom
            } ${selectedTileId === tile.id ? 'ring-2 ring-primary ring-offset-1 ring-offset-background' : ''}`}
          >
            <div className="flex items-start justify-between">
              <span className="text-[10px] font-bold truncate leading-tight">{tile.nome}</span>
              <span className={`w-2 h-2 rounded-full shrink-0 ${statusDot[tile.status]}`} />
            </div>
            {tile.tamanho.h > 1 && (
              <span className="text-[9px] opacity-60 capitalize">{tile.tipo.replace('_', ' ')}</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
