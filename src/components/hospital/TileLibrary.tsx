import { tileLibraryDefaults } from '@/data/mockData';

export default function TileLibrary() {
  const handleDragStart = (e: React.DragEvent, tipo: string, nome: string) => {
    e.dataTransfer.setData('new-tile-type', tipo);
    e.dataTransfer.setData('new-tile-nome', nome);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Biblioteca de Tiles</h3>
      <div className="grid grid-cols-2 gap-2">
        {tileLibraryDefaults.map(item => (
          <div
            key={item.tipo}
            draggable
            onDragStart={(e) => handleDragStart(e, item.tipo, item.nome)}
            className="glass rounded-lg p-3 border border-border cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors text-center"
          >
            <div className="text-lg mb-1">{item.icon}</div>
            <span className="text-[10px] font-medium text-muted-foreground">{item.nome}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">Arraste para o canvas para adicionar</p>
    </div>
  );
}
