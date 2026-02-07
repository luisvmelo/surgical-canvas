import { useState, useRef, useCallback, useEffect } from 'react';
import { TileData, HospitalLayout, ImageCrop } from '@/data/types';
import { ZoomIn, ZoomOut, Maximize, Grid3X3, X, RotateCw } from 'lucide-react';
import CropOverlay from './CropOverlay';

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

interface TileCanvasGridProps {
  layout: HospitalLayout;
  onUpdateLayout: (layout: HospitalLayout) => void;
  selectedTileId: string | null;
  onSelectTile: (id: string | null) => void;
  readOnly?: boolean;
}

const TILE_UNIT = 80;
const DEFAULT_CROP: ImageCrop = { x: 0, y: 0, w: 1, h: 1 };

function CroppedImage({ src, crop, alt, rotation }: { src: string; crop: ImageCrop; alt: string; rotation: number }) {
  const hasCrop = crop.x !== 0 || crop.y !== 0 || crop.w !== 1 || crop.h !== 1;

  // For rotated images, we render the image rotated inside the container
  // Container has swapped dimensions, so image needs to fill the "original" orientation
  const rotStyle: React.CSSProperties = rotation % 360 !== 0 ? {
    transform: `rotate(${rotation}deg)`,
    transformOrigin: 'center center',
    width: rotation % 180 !== 0 ? '100%' : '100%',
    height: rotation % 180 !== 0 ? '100%' : '100%',
  } : {};

  if (!hasCrop) {
    return (
      <div className="w-full h-full overflow-hidden">
        <img src={src} alt={alt} className="w-full h-full object-cover" draggable={false} style={rotStyle} />
      </div>
    );
  }

  return (
    <div
      className="w-full h-full"
      role="img"
      aria-label={alt}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: `${100 / crop.w}% ${100 / crop.h}%`,
        backgroundPosition: `${crop.w < 1 ? (crop.x / (1 - crop.w)) * 100 : 0}% ${crop.h < 1 ? (crop.y / (1 - crop.h)) * 100 : 0}%`,
        backgroundRepeat: 'no-repeat',
        ...rotStyle,
      }}
    />
  );
}

export default function TileCanvasGrid({ layout, onUpdateLayout, selectedTileId, onSelectTile, readOnly = false }: TileCanvasGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragTile, setDragTile] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [resizeTile, setResizeTile] = useState<{ id: string; startX: number; startY: number; startW: number; startH: number } | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(false);
  const [cropMode, setCropMode] = useState<string | null>(null);

  /** Apply crop: resize tile to match cropped area, then exit crop mode */
  const applyCropAndExit = useCallback((tileId: string) => {
    const tile = layout.tiles.find(t => t.id === tileId);
    if (tile) {
      const c = tile.imageCrop || DEFAULT_CROP;
      if (c.x !== 0 || c.y !== 0 || c.w !== 1 || c.h !== 1) {
        const newW = tile.tamanho.w * c.w;
        const newH = tile.tamanho.h * c.h;
        const newX = tile.posicao.x + tile.tamanho.w * TILE_UNIT * c.x;
        const newY = tile.posicao.y + tile.tamanho.h * TILE_UNIT * c.y;
        onUpdateLayout({
          ...layout,
          tiles: layout.tiles.map(t =>
            t.id === tileId ? {
              ...t,
              tamanho: { w: Math.max(0.5, Math.round(newW * 4) / 4), h: Math.max(0.5, Math.round(newH * 4) / 4) },
              posicao: { x: Math.round(newX), y: Math.round(newY) },
              imageCrop: { x: c.x, y: c.y, w: c.w, h: c.h },
            } : t
          ),
        });
      }
    }
    setCropMode(null);
  }, [layout, onUpdateLayout]);

  const SNAP = 20;

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (cropMode) return; // no canvas zoom in crop mode

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(3, Math.max(0.15, zoom * delta));
    const ratio = newZoom / zoom;
    setPan(prev => ({
      x: mouseX - (mouseX - prev.x) * ratio,
      y: mouseY - (mouseY - prev.y) * ratio,
    }));
    setZoom(newZoom);
  }, [zoom, cropMode]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }
    if (e.target === e.currentTarget || (e.target as HTMLElement).dataset.canvasBg === 'true') {
      if (cropMode) { applyCropAndExit(cropMode); return; }
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      onSelectTile(null);
    }
  }, [pan, onSelectTile, cropMode, applyCropAndExit]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }
    if (resizeTile) {
      const dx = (e.clientX - resizeTile.startX) / zoom;
      const dy = (e.clientY - resizeTile.startY) / zoom;
      // Proportional resize: use the larger delta
      const aspect = resizeTile.startW / resizeTile.startH;
      const deltaByX = dx / TILE_UNIT;
      const deltaByY = dy / TILE_UNIT;
      const delta = Math.abs(deltaByX) > Math.abs(deltaByY) ? deltaByX : deltaByY;
      const newW = Math.max(0.5, Math.round((resizeTile.startW + delta) * 4) / 4);
      const newH = Math.max(0.5, Math.round((newW / aspect) * 4) / 4);
      onUpdateLayout({
        ...layout,
        tiles: layout.tiles.map(t =>
          t.id === resizeTile.id ? { ...t, tamanho: { w: newW, h: newH } } : t
        ),
      });
      return;
    }
    if (dragTile) {
      const pos = screenToCanvas(e.clientX, e.clientY);
      let x = pos.x - dragTile.offsetX;
      let y = pos.y - dragTile.offsetY;
      if (snapToGrid) {
        x = Math.round(x / SNAP) * SNAP;
        y = Math.round(y / SNAP) * SNAP;
      }
      onUpdateLayout({
        ...layout,
        tiles: layout.tiles.map(t =>
          t.id === dragTile.id ? { ...t, posicao: { x: Math.round(x), y: Math.round(y) } } : t
        ),
      });
    }
  }, [isPanning, panStart, dragTile, resizeTile, screenToCanvas, snapToGrid, layout, onUpdateLayout, zoom]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setDragTile(null);
    setResizeTile(null);
  }, []);

  const handleTileMouseDown = useCallback((e: React.MouseEvent, tile: TileData) => {
    e.stopPropagation();
    if (readOnly || cropMode) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    setDragTile({
      id: tile.id,
      offsetX: pos.x - tile.posicao.x,
      offsetY: pos.y - tile.posicao.y,
    });
    onSelectTile(tile.id);
  }, [screenToCanvas, onSelectTile, readOnly, cropMode]);

  const handleTileDoubleClick = useCallback((e: React.MouseEvent, tile: TileData) => {
    e.stopPropagation();
    if (readOnly || !tile.imagem_url) return;
    setCropMode(tile.id);
    onSelectTile(tile.id);
  }, [readOnly, onSelectTile]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cropMode) applyCropAndExit(cropMode);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cropMode, applyCropAndExit]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (readOnly) return;
    const newTileType = e.dataTransfer.getData('new-tile-type');
    if (!newTileType) return;
    const pos = screenToCanvas(e.clientX, e.clientY);
    const imageUrl = e.dataTransfer.getData('new-tile-image');
    const newTile: TileData = {
      id: `T${Date.now()}`,
      nome: e.dataTransfer.getData('new-tile-nome') || 'Novo Tile',
      tipo: newTileType as TileData['tipo'],
      imagem_url: imageUrl || undefined,
      capacidade: 0,
      status: 'ativo',
      propriedades: {},
      posicao: { x: Math.round(pos.x), y: Math.round(pos.y) },
      tamanho: { w: 2, h: 2 },
      rotacao: 0,
      layer: 'salas',
      tags: [],
      notas: '',
    };
    onUpdateLayout({ ...layout, tiles: [...layout.tiles, newTile] });
    onSelectTile(newTile.id);
  }, [screenToCanvas, layout, onUpdateLayout, onSelectTile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const zoomIn = () => setZoom(z => Math.min(3, z * 1.25));
  const zoomOut = () => setZoom(z => Math.max(0.15, z * 0.8));
  const resetView = () => { setZoom(1); setPan({ x: 40, y: 40 }); };

  const gridSize = SNAP * zoom;

  return (
    <div className="relative rounded-xl border-0 overflow-hidden bg-background" style={{ height: '100%', minHeight: 300 }}>
      <div
        ref={containerRef}
        className={`w-full h-full ${isPanning ? 'cursor-grabbing' : dragTile ? 'cursor-grabbing' : 'cursor-grab'}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{ overflow: 'hidden' }}
      >
        {/* Grid background */}
        <div
          data-canvas-bg="true"
          className="absolute inset-0"
          style={{
            backgroundImage: snapToGrid
              ? `radial-gradient(circle, hsl(var(--border) / 0.5) 1px, transparent 1px)`
              : `radial-gradient(circle, hsl(var(--border) / 0.2) 0.5px, transparent 0.5px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundPosition: `${pan.x % gridSize}px ${pan.y % gridSize}px`,
          }}
        />

        {/* Origin crosshair */}
        <div className="absolute pointer-events-none" style={{ left: pan.x, top: pan.y - 20, width: 1, height: 40, background: 'hsl(var(--border) / 0.3)' }} />
        <div className="absolute pointer-events-none" style={{ left: pan.x - 20, top: pan.y, width: 40, height: 1, background: 'hsl(var(--border) / 0.3)' }} />

        {/* Tiles */}
        {layout.tiles.map(tile => {
          const isSelected = selectedTileId === tile.id;
          const isDragging = dragTile?.id === tile.id;
          const isCropping = cropMode === tile.id;
          const w = tile.tamanho.w * TILE_UNIT;
          const h = tile.tamanho.h * TILE_UNIT;
          const crop = tile.imageCrop || DEFAULT_CROP;

          return (
            <div
              key={tile.id}
              onMouseDown={(e) => handleTileMouseDown(e, tile)}
              onDoubleClick={(e) => handleTileDoubleClick(e, tile)}
              style={{
                position: 'absolute',
                left: pan.x + tile.posicao.x * zoom,
                top: pan.y + tile.posicao.y * zoom,
                width: w * zoom,
                height: h * zoom,
                zIndex: isDragging ? 100 : isCropping ? 200 : isSelected ? 50 : 1,
                transition: isDragging ? 'none' : 'box-shadow 0.2s',
              }}
              className={`rounded-lg overflow-hidden select-none transition-shadow group/tile ${
                isCropping
                  ? 'ring-2 ring-warning ring-offset-2 ring-offset-background shadow-lg shadow-warning/30'
                  : isSelected
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg shadow-primary/20'
                    : ''
              } ${isDragging ? 'opacity-80 scale-105' : !isCropping ? 'hover:brightness-110' : ''}`}
            >
              {/* Tile controls - delete + rotate */}
              {!readOnly && !isCropping && (
                <div className="absolute top-1 right-1 z-10 flex gap-1 opacity-0 group-hover/tile:opacity-100 transition-opacity">
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateLayout({
                        ...layout,
                        tiles: layout.tiles.map(t =>
                          t.id === tile.id ? { ...t, rotacao: (t.rotacao + 90) % 360, tamanho: { w: t.tamanho.h, h: t.tamanho.w } } : t
                        ),
                      });
                    }}
                    className="w-5 h-5 rounded-full bg-secondary/90 text-foreground flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <RotateCw size={10} />
                  </button>
                  <button
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateLayout({ ...layout, tiles: layout.tiles.filter(t => t.id !== tile.id) });
                      if (selectedTileId === tile.id) onSelectTile(null);
                    }}
                    className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {tile.imagem_url ? (
                isCropping ? (
                  <CropOverlay
                    imageUrl={tile.imagem_url}
                    crop={crop}
                    tileWidth={w * zoom}
                    tileHeight={h * zoom}
                    zoom={zoom}
                    onCropChange={(newCrop) => {
                      onUpdateLayout({
                        ...layout,
                        tiles: layout.tiles.map(t =>
                          t.id === tile.id ? { ...t, imageCrop: newCrop } : t
                        ),
                      });
                    }}
                    onDone={() => applyCropAndExit(tile.id)}
                  />
                ) : (
                  <CroppedImage src={tile.imagem_url} crop={crop} alt={tile.nome} rotation={tile.rotacao} />
                )
              ) : (
                <div className={`w-full h-full flex items-center justify-center border-2 rounded-lg ${tileColors[tile.tipo] || tileColors.custom}`}>
                  <span className="font-bold text-xs">{tile.nome}</span>
                </div>
              )}

              {/* Resize handle */}
              {!readOnly && isSelected && !isCropping && (
                <div
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    setResizeTile({ id: tile.id, startX: e.clientX, startY: e.clientY, startW: tile.tamanho.w, startH: tile.tamanho.h });
                  }}
                  className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-20"
                  style={{
                    background: 'linear-gradient(135deg, transparent 50%, hsl(var(--primary)) 50%)',
                    borderBottomRightRadius: 'inherit',
                  }}
                />
              )}
            </div>
          );
        })}
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
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          className={`p-1.5 rounded transition-colors ${snapToGrid ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
        >
          <Grid3X3 size={14} />
        </button>
      </div>

      {/* Info */}
      <div className="absolute top-4 left-4 text-[10px] text-muted-foreground glass rounded-md px-2 py-1 border border-border">
        {cropMode
          ? 'Modo recorte: arraste as bordas para ajustar · Clique fora ou ESC para sair'
          : `Arraste o fundo para mover · Scroll para zoom · Duplo clique para recortar · ${snapToGrid ? 'Snap ativo' : 'Posição livre'}`
        }
      </div>
    </div>
  );
}
