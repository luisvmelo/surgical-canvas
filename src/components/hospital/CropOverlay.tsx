import { useState, useCallback, useRef, useEffect } from 'react';
import { ImageCrop } from '@/data/types';
import { Crop, Check } from 'lucide-react';

interface CropOverlayProps {
  /** tileWidth/tileHeight are in screen pixels (already zoomed) */
  imageUrl: string;
  crop: ImageCrop;
  tileWidth: number;
  tileHeight: number;
  zoom: number;
  onCropChange: (crop: ImageCrop) => void;
  onDone: () => void;
}

type HandleType = 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r' | 'move';

const MIN_CROP = 0.05;

export default function CropOverlay({ imageUrl, crop, tileWidth, tileHeight, zoom, onCropChange, onDone }: CropOverlayProps) {
  const [drag, setDrag] = useState<{
    handle: HandleType;
    startX: number;
    startY: number;
    startCrop: ImageCrop;
  } | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);

  // The overlay shows the full image. The crop rect highlights the visible portion.
  // Image fills the entire overlay area (representing 0,0 to 1,1).
  // Crop rect is drawn as a highlighted area within.

  const imgW = tileWidth;
  const imgH = tileHeight;

  const handleMouseDown = useCallback((e: React.MouseEvent, handle: HandleType) => {
    e.stopPropagation();
    e.preventDefault();
    setDrag({ handle, startX: e.clientX, startY: e.clientY, startCrop: { ...crop } });
  }, [crop]);

  useEffect(() => {
    if (!drag) return;

    const handleMove = (e: MouseEvent) => {
      // imgW/imgH are already in screen pixels, no need to multiply by zoom again
      const dx = (e.clientX - drag.startX) / imgW;
      const dy = (e.clientY - drag.startY) / imgH;
      const s = drag.startCrop;

      let newCrop = { ...s };

      switch (drag.handle) {
        case 'move': {
          let nx = s.x + dx;
          let ny = s.y + dy;
          nx = Math.max(0, Math.min(1 - s.w, nx));
          ny = Math.max(0, Math.min(1 - s.h, ny));
          newCrop = { ...s, x: nx, y: ny };
          break;
        }
        case 'tl': {
          const nx = Math.max(0, Math.min(s.x + s.w - MIN_CROP, s.x + dx));
          const ny = Math.max(0, Math.min(s.y + s.h - MIN_CROP, s.y + dy));
          newCrop = { x: nx, y: ny, w: s.x + s.w - nx, h: s.y + s.h - ny };
          break;
        }
        case 'tr': {
          const nw = Math.max(MIN_CROP, Math.min(1 - s.x, s.w + dx));
          const ny = Math.max(0, Math.min(s.y + s.h - MIN_CROP, s.y + dy));
          newCrop = { x: s.x, y: ny, w: nw, h: s.y + s.h - ny };
          break;
        }
        case 'bl': {
          const nx = Math.max(0, Math.min(s.x + s.w - MIN_CROP, s.x + dx));
          const nh = Math.max(MIN_CROP, Math.min(1 - s.y, s.h + dy));
          newCrop = { x: nx, y: s.y, w: s.x + s.w - nx, h: nh };
          break;
        }
        case 'br': {
          const nw = Math.max(MIN_CROP, Math.min(1 - s.x, s.w + dx));
          const nh = Math.max(MIN_CROP, Math.min(1 - s.y, s.h + dy));
          newCrop = { x: s.x, y: s.y, w: nw, h: nh };
          break;
        }
        case 't': {
          const ny = Math.max(0, Math.min(s.y + s.h - MIN_CROP, s.y + dy));
          newCrop = { ...s, y: ny, h: s.y + s.h - ny };
          break;
        }
        case 'b': {
          const nh = Math.max(MIN_CROP, Math.min(1 - s.y, s.h + dy));
          newCrop = { ...s, h: nh };
          break;
        }
        case 'l': {
          const nx = Math.max(0, Math.min(s.x + s.w - MIN_CROP, s.x + dx));
          newCrop = { ...s, x: nx, w: s.x + s.w - nx };
          break;
        }
        case 'r': {
          const nw = Math.max(MIN_CROP, Math.min(1 - s.x, s.w + dx));
          newCrop = { ...s, w: nw };
          break;
        }
      }

      onCropChange(newCrop);
    };

    const handleUp = () => setDrag(null);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [drag, imgW, imgH, zoom, onCropChange]);

  const handleSize = 8;

  // Crop rect in px relative to the overlay
  const cx = crop.x * imgW;
  const cy = crop.y * imgH;
  const cw = crop.w * imgW;
  const ch = crop.h * imgH;

  const handleStyle = (left: number, top: number, cursor: string): React.CSSProperties => ({
    position: 'absolute',
    left: left - handleSize / 2,
    top: top - handleSize / 2,
    width: handleSize,
    height: handleSize,
    background: 'hsl(var(--primary))',
    border: '1px solid hsl(var(--primary-foreground))',
    borderRadius: 2,
    cursor,
    zIndex: 30,
  });

  const edgeStyle = (left: number, top: number, w: number, h: number, cursor: string): React.CSSProperties => ({
    position: 'absolute',
    left,
    top,
    width: w,
    height: h,
    cursor,
    zIndex: 25,
  });

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0"
      style={{ zIndex: 200 }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Full image behind */}
      <img
        src={imageUrl}
        alt="crop"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ objectFit: 'fill' }}
        draggable={false}
      />

      {/* Dark overlay outside crop area — 4 rects */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
        {/* Top */}
        <div className="absolute bg-black/50" style={{ left: 0, top: 0, width: '100%', height: cy }} />
        {/* Bottom */}
        <div className="absolute bg-black/50" style={{ left: 0, top: cy + ch, width: '100%', height: imgH - cy - ch }} />
        {/* Left */}
        <div className="absolute bg-black/50" style={{ left: 0, top: cy, width: cx, height: ch }} />
        {/* Right */}
        <div className="absolute bg-black/50" style={{ left: cx + cw, top: cy, width: imgW - cx - cw, height: ch }} />
      </div>

      {/* Crop border */}
      <div
        className="absolute border-2 border-primary"
        style={{ left: cx, top: cy, width: cw, height: ch, zIndex: 20 }}
      >
        {/* Grid lines (rule of thirds) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/3 top-0 bottom-0 w-px bg-primary/30" />
          <div className="absolute left-2/3 top-0 bottom-0 w-px bg-primary/30" />
          <div className="absolute top-1/3 left-0 right-0 h-px bg-primary/30" />
          <div className="absolute top-2/3 left-0 right-0 h-px bg-primary/30" />
        </div>
      </div>

      {/* Move handle — drag inside crop area */}
      <div
        style={{ position: 'absolute', left: cx, top: cy, width: cw, height: ch, cursor: 'move', zIndex: 22 }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      />

      {/* Edge handles */}
      <div style={edgeStyle(cx, cy - 4, cw, 8, 'ns-resize')} onMouseDown={(e) => handleMouseDown(e, 't')} />
      <div style={edgeStyle(cx, cy + ch - 4, cw, 8, 'ns-resize')} onMouseDown={(e) => handleMouseDown(e, 'b')} />
      <div style={edgeStyle(cx - 4, cy, 8, ch, 'ew-resize')} onMouseDown={(e) => handleMouseDown(e, 'l')} />
      <div style={edgeStyle(cx + cw - 4, cy, 8, ch, 'ew-resize')} onMouseDown={(e) => handleMouseDown(e, 'r')} />

      {/* Corner handles */}
      <div style={handleStyle(cx, cy, 'nwse-resize')} onMouseDown={(e) => handleMouseDown(e, 'tl')} />
      <div style={handleStyle(cx + cw, cy, 'nesw-resize')} onMouseDown={(e) => handleMouseDown(e, 'tr')} />
      <div style={handleStyle(cx, cy + ch, 'nesw-resize')} onMouseDown={(e) => handleMouseDown(e, 'bl')} />
      <div style={handleStyle(cx + cw, cy + ch, 'nwse-resize')} onMouseDown={(e) => handleMouseDown(e, 'br')} />

      {/* Label + Done */}
      <div className="absolute top-1 left-1 z-30 flex items-center gap-1 bg-warning/90 text-warning-foreground px-2 py-0.5 rounded text-[9px] font-bold">
        <Crop size={10} /> RECORTAR
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDone(); }}
        className="absolute bottom-1 right-1 z-30 bg-primary text-primary-foreground px-2 py-0.5 rounded text-[9px] font-bold hover:brightness-110 flex items-center gap-1"
      >
        <Check size={10} /> OK
      </button>
    </div>
  );
}
