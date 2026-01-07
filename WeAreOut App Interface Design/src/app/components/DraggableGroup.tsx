import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { GripVertical } from 'lucide-react';
import { InventoryItem } from './Dashboard';
import { InventoryCard } from './InventoryCard';

type DraggableGroupProps = {
  groupName: string;
  items: InventoryItem[];
  index: number;
  moveGroup: (dragIndex: number, hoverIndex: number) => void;
  onItemClick: (item: InventoryItem) => void;
  isDragMode: boolean;
};

const ItemType = 'GROUP';

export function DraggableGroup({
  groupName,
  items,
  index,
  moveGroup,
  onItemClick,
  isDragMode,
}: DraggableGroupProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ItemType,
    item: () => ({ index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: isDragMode,
  });

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (draggedItem: { index: number }) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = draggedItem.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      moveGroup(dragIndex, hoverIndex);
      draggedItem.index = hoverIndex;
    },
    canDrop: () => isDragMode,
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`mb-1 ${isDragging ? 'opacity-50' : 'opacity-100'}`}
      style={{ cursor: isDragMode ? 'move' : 'default' }}
    >
      {/* Group Header */}
      <div className="sticky top-0 bg-muted/80 backdrop-blur-sm px-6 py-2 border-b border-border z-10 flex items-center gap-2">
        {isDragMode && (
          <div ref={drag} className="cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 flex items-center justify-between">
          <h3 className="text-[13px] font-semibold text-foreground">{groupName}</h3>
          <div className="flex items-center gap-2">
            {items.filter((i) => i.status === 'critical').length > 0 && (
              <span className="text-[11px] px-2 py-0.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full font-medium">
                {items.filter((i) => i.status === 'critical').length} critical
              </span>
            )}
            {items.filter((i) => i.status === 'low').length > 0 && (
              <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full font-medium">
                {items.filter((i) => i.status === 'low').length} low
              </span>
            )}
            <span className="text-[11px] text-muted-foreground">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
      </div>

      {/* Group Items */}
      <div>
        {items
          .sort((a, b) => {
            // Sort by urgency: critical > low > good
            const statusOrder = { critical: 0, low: 1, good: 2 };
            return statusOrder[a.status] - statusOrder[b.status];
          })
          .map((item) => (
            <InventoryCard key={item.id} item={item} onClick={() => onItemClick(item)} />
          ))}
      </div>
    </div>
  );
}