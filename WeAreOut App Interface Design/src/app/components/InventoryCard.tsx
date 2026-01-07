import { ChevronRight } from 'lucide-react';
import { InventoryItem } from './Dashboard';

type InventoryCardProps = {
  item: InventoryItem;
  onClick?: () => void;
};

export function InventoryCard({ item, onClick }: InventoryCardProps) {
  const getBarColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'low':
        return 'bg-amber-500';
      default:
        return 'bg-green-500';
    }
  };

  const getTextColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'low':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  // Calculate fuel gauge percentage (based on 14 day max)
  const gaugePercentage = Math.min(100, (item.daysRemaining / 14) * 100);

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 py-3 px-4 border-b border-border hover:bg-accent/50 active:bg-accent transition-colors cursor-pointer"
    >
      {/* Left side: Item name and stock info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1.5">
          <h4 className="text-[15px] font-medium text-foreground truncate">
            {item.name}
          </h4>
          <span className="text-[13px] text-muted-foreground whitespace-nowrap">
            {item.quantity} {item.unit}
          </span>
        </div>
        
        {/* Fuel gauge bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-1">
          <div
            className={`h-full transition-all ${getBarColor(item.status)}`}
            style={{ width: `${gaugePercentage}%` }}
          />
        </div>
      </div>

      {/* Right side: Days remaining */}
      <div className="flex items-center gap-2">
        <div className="text-right">
          <div className={`text-[18px] font-semibold ${getTextColor(item.status)}`}>
            {item.daysRemaining}
          </div>
          <div className="text-[11px] text-muted-foreground -mt-0.5">
            {item.daysRemaining === 1 ? 'day' : 'days'}
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      </div>
    </div>
  );
}