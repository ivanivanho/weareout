import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { InventoryItem } from './Dashboard';

type SearchModalProps = {
  items: InventoryItem[];
  onClose: () => void;
  onSelectItem: (item: InventoryItem) => void;
};

export function SearchModal({ items, onClose, onSelectItem }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <button
          onClick={onClose}
          className="p-2 -ml-2 hover:bg-accent rounded-lg transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search items, categories, or locations..."
            className="w-full pl-10 pr-4 py-2.5 bg-muted border border-border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {searchQuery === '' ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <Search className="w-12 h-12 text-muted-foreground/30 mb-3" />
            <p className="text-[15px] text-muted-foreground">
              Search for items in your inventory
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <p className="text-[15px] text-muted-foreground mb-2">No items found</p>
            <p className="text-[13px] text-muted-foreground">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2">
            <p className="text-[13px] text-muted-foreground px-2 mb-2">
              {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'}
            </p>
            {filteredItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectItem(item);
                  onClose();
                }}
                className="w-full p-4 bg-accent/30 hover:bg-accent/60 border border-border rounded-xl text-left transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-[15px] font-semibold">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[12px] text-muted-foreground">
                        {item.category}
                      </span>
                      <span className="text-[12px] text-muted-foreground">•</span>
                      <span className="text-[12px] text-muted-foreground">
                        {item.location}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-medium">
                      {item.quantity} {item.unit}
                    </div>
                    <div
                      className={`text-[12px] font-medium ${
                        item.status === 'critical'
                          ? 'text-red-500'
                          : item.status === 'low'
                          ? 'text-amber-500'
                          : 'text-green-500'
                      }`}
                    >
                      {item.daysRemaining}d left
                    </div>
                  </div>
                </div>

                {/* Status Bar */}
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      item.status === 'critical'
                        ? 'bg-red-500'
                        : item.status === 'low'
                        ? 'bg-amber-500'
                        : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.max(
                        10,
                        Math.min(100, (item.daysRemaining / 14) * 100)
                      )}%`,
                    }}
                  />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
