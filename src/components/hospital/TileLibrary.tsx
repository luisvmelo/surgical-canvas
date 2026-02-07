import { tileLibraryDefaults } from '@/data/mockData';

export default function TileLibrary() {
  const handleDragStart = (e: React.DragEvent, tipo: string, nome: string, imagem_url: string) => {
    e.dataTransfer.setData('new-tile-type', tipo);
    e.dataTransfer.setData('new-tile-nome', nome);
    e.dataTransfer.setData('new-tile-image', imagem_url);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Biblioteca de Tiles</h3>
      <div className="grid grid-cols-2 gap-2">
        {tileLibraryDefaults.map(item => (
          <div
            key={item.tipo + item.nome}
            draggable
            onDragStart={(e) => handleDragStart(e, item.tipo, item.nome, item.imagem_url)}
            className="glass rounded-lg border border-border cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors text-center overflow-hidden"
          >
            <img src={item.imagem_url} alt={item.nome} className="w-full h-16 object-cover" draggable={false} />
            <span className="text-[10px] font-medium text-muted-foreground block py-1.5">{item.nome}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">Arraste para o canvas para adicionar</p>
    </div>
  );
}
