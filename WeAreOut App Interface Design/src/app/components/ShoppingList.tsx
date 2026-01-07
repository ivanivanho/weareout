import { ChevronLeft, ShoppingCart, MapPin, Clock } from 'lucide-react';
import { InventoryItem } from './Dashboard';

type ShoppingListProps = {
  items: InventoryItem[];
  onClose: () => void;
};

export function ShoppingList({ items, onClose }: ShoppingListProps) {
  // Group items by urgency
  const criticalItems = items.filter(item => item.status === 'critical');
  const lowItems = items.filter(item => item.status === 'low');

  // Suggest merchants based on item categories
  const suggestMerchant = (category: string) => {
    const merchantMap: Record<string, string> = {
      'Dairy & Eggs': 'Grocery Store',
      Bakery: 'Bakery / Grocery Store',
      Beverages: 'Grocery Store',
      'Personal Care': 'Pharmacy / Drugstore',
      'Cooking Essentials': 'Grocery Store',
      Snacks: 'Grocery Store',
      Produce: 'Farmers Market / Grocery',
      'Meat & Seafood': 'Butcher / Grocery Store',
    };
    return merchantMap[category] || 'Retail Store';
  };

  const exportList = () => {
    const listText = items
      .map(item => `${item.name} - ${item.quantity} ${item.unit}`)
      .join('\n');
    navigator.clipboard.writeText(listText);
    alert('Shopping list copied to clipboard!');
  };

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <button
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="text-[17px] font-semibold">Shopping List</h2>
        <button
          onClick={exportList}
          className="text-[15px] text-blue-500 hover:opacity-80"
        >
          Export
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
          {/* Critical Items */}
          {criticalItems.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <h3 className="text-foreground">Urgent - Out Soon</h3>
                <span className="text-[13px] text-muted-foreground">
                  ({criticalItems.length})
                </span>
              </div>

              <div className="space-y-3">
                {criticalItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-foreground mb-1">{item.name}</h4>
                        <p className="text-[13px] text-muted-foreground flex items-center gap-1.5 mb-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.location}
                        </p>
                        <div className="flex items-center gap-4 text-[13px]">
                          <span className="text-muted-foreground">
                            Current: {item.quantity} {item.unit}
                          </span>
                          <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {item.daysRemaining} day{item.daysRemaining !== 1 ? 's' : ''} left
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-block px-2.5 py-1 bg-background/80 rounded text-[12px] text-muted-foreground">
                          {suggestMerchant(item.category)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Low Stock Items */}
          {lowItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <h3 className="text-foreground">Running Low</h3>
                <span className="text-[13px] text-muted-foreground">({lowItems.length})</span>
              </div>

              <div className="space-y-3">
                {lowItems.map(item => (
                  <div
                    key={item.id}
                    className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-foreground mb-1">{item.name}</h4>
                        <p className="text-[13px] text-muted-foreground flex items-center gap-1.5 mb-2">
                          <MapPin className="w-3.5 h-3.5" />
                          {item.location}
                        </p>
                        <div className="flex items-center gap-4 text-[13px]">
                          <span className="text-muted-foreground">
                            Current: {item.quantity} {item.unit}
                          </span>
                          <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {item.daysRemaining} day{item.daysRemaining !== 1 ? 's' : ''} left
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="inline-block px-2.5 py-1 bg-background/80 rounded text-[12px] text-muted-foreground">
                          {suggestMerchant(item.category)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Merchant Summary */}
          <div className="mt-8 p-5 bg-muted rounded-lg">
            <h4 className="text-foreground mb-3">Suggested Shopping Trips</h4>
            <div className="space-y-2 text-[14px]">
              {Array.from(new Set(items.map(item => suggestMerchant(item.category)))).map(
                merchant => {
                  const itemCount = items.filter(
                    item => suggestMerchant(item.category) === merchant
                  ).length;
                  return (
                    <div
                      key={merchant}
                      className="flex items-center justify-between py-2 border-b border-border last:border-0"
                    >
                      <span className="text-foreground">{merchant}</span>
                      <span className="text-muted-foreground">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>

          {/* Future Feature Note */}
          <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-[13px] text-foreground mb-2">
              <strong>Coming Soon:</strong> Autonomous Reordering
            </p>
            <p className="text-[12px] text-muted-foreground">
              In Phase 3, WeAreOut will automatically reorder critical items from your preferred
              merchants when stock runs low - with your approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}