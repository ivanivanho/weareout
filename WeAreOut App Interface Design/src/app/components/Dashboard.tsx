import { useState } from 'react';
import { ShoppingCart, Layers, MapPin, Search, Sparkles, ArrowUpDown, GripVertical } from 'lucide-react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { InventoryCard } from './InventoryCard';
import { AddItemModal } from './AddItemModal';
import { ShoppingList } from './ShoppingList';
import { ItemDetail } from './ItemDetail';
import { SearchModal } from './SearchModal';
import { AISummaryModal } from './AISummaryModal';
import { DraggableGroup } from './DraggableGroup';

export type InventoryItem = {
  id: string;
  name: string;
  category: string;
  location: string;
  quantity: number;
  unit: string;
  daysRemaining: number;
  consumptionRate: number; // per day
  lastUpdated: Date;
  confidence: 'high' | 'medium' | 'low';
  status: 'good' | 'low' | 'critical';
};

const mockInventory: InventoryItem[] = [
  {
    id: '1',
    name: 'Whole Milk',
    category: 'Dairy & Eggs',
    location: 'Fridge - Door',
    quantity: 0.5,
    unit: 'L',
    daysRemaining: 2,
    consumptionRate: 0.25,
    lastUpdated: new Date('2026-01-06'),
    confidence: 'high',
    status: 'low',
  },
  {
    id: '2',
    name: 'Sourdough Bread',
    category: 'Bakery',
    location: 'Pantry - Shelf A',
    quantity: 0.5,
    unit: 'loaf',
    daysRemaining: 1,
    consumptionRate: 0.5,
    lastUpdated: new Date('2026-01-06'),
    confidence: 'high',
    status: 'critical',
  },
  {
    id: '3',
    name: 'Organic Eggs',
    category: 'Dairy & Eggs',
    location: 'Fridge - Top Shelf',
    quantity: 6,
    unit: 'eggs',
    daysRemaining: 5,
    consumptionRate: 1.2,
    lastUpdated: new Date('2026-01-05'),
    confidence: 'medium',
    status: 'good',
  },
  {
    id: '4',
    name: 'Shampoo (Daily Care)',
    category: 'Personal Care',
    location: 'Bathroom - Shower',
    quantity: 0.25,
    unit: 'bottle',
    daysRemaining: 8,
    consumptionRate: 0.03,
    lastUpdated: new Date('2026-01-03'),
    confidence: 'medium',
    status: 'good',
  },
  {
    id: '5',
    name: 'Ground Coffee',
    category: 'Beverages',
    location: 'Kitchen - Counter',
    quantity: 150,
    unit: 'g',
    daysRemaining: 3,
    consumptionRate: 50,
    lastUpdated: new Date('2026-01-06'),
    confidence: 'high',
    status: 'low',
  },
  {
    id: '6',
    name: 'Olive Oil',
    category: 'Cooking Essentials',
    location: 'Pantry - Shelf B',
    quantity: 0.8,
    unit: 'L',
    daysRemaining: 16,
    consumptionRate: 0.05,
    lastUpdated: new Date('2026-01-01'),
    confidence: 'low',
    status: 'good',
  },
  {
    id: '7',
    name: 'Greek Yogurt',
    category: 'Dairy & Eggs',
    location: 'Fridge - Top Shelf',
    quantity: 2,
    unit: 'cups',
    daysRemaining: 4,
    consumptionRate: 0.5,
    lastUpdated: new Date('2026-01-04'),
    confidence: 'high',
    status: 'good',
  },
  {
    id: '8',
    name: 'Orange Juice',
    category: 'Beverages',
    location: 'Fridge - Door',
    quantity: 0.3,
    unit: 'L',
    daysRemaining: 2,
    consumptionRate: 0.15,
    lastUpdated: new Date('2026-01-05'),
    confidence: 'high',
    status: 'low',
  },
  {
    id: '9',
    name: 'Dish Soap',
    category: 'Cleaning',
    location: 'Kitchen - Sink',
    quantity: 0.2,
    unit: 'bottle',
    daysRemaining: 6,
    consumptionRate: 0.03,
    lastUpdated: new Date('2026-01-02'),
    confidence: 'medium',
    status: 'good',
  },
  {
    id: '10',
    name: 'Pasta',
    category: 'Cooking Essentials',
    location: 'Pantry - Shelf B',
    quantity: 500,
    unit: 'g',
    daysRemaining: 12,
    consumptionRate: 42,
    lastUpdated: new Date('2026-01-01'),
    confidence: 'high',
    status: 'good',
  },
  {
    id: '11',
    name: 'Toothpaste',
    category: 'Personal Care',
    location: 'Bathroom - Cabinet',
    quantity: 0.4,
    unit: 'tube',
    daysRemaining: 14,
    consumptionRate: 0.03,
    lastUpdated: new Date('2025-12-28'),
    confidence: 'low',
    status: 'good',
  },
  {
    id: '12',
    name: 'Butter',
    category: 'Dairy & Eggs',
    location: 'Fridge - Door',
    quantity: 125,
    unit: 'g',
    daysRemaining: 7,
    consumptionRate: 18,
    lastUpdated: new Date('2026-01-03'),
    confidence: 'high',
    status: 'good',
  },
];

export function Dashboard() {
  const [view, setView] = useState<'inventory' | 'shopping' | 'detail'>('inventory');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [groupBy, setGroupBy] = useState<'category' | 'location'>('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAISummaryModal, setShowAISummaryModal] = useState(false);
  const [sortMode, setSortMode] = useState<'priority' | 'custom'>('priority'); // priority (urgency-based) or custom (drag-n-drop)
  const [customGroupOrder, setCustomGroupOrder] = useState<string[]>([]);

  const handleItemClick = (item: InventoryItem) => {
    setSelectedItem(item);
    setView('detail');
  };

  // Group items by category or location
  const groupedItems = mockInventory.reduce((groups, item) => {
    const key = groupBy === 'category' ? item.category : item.location;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, InventoryItem[]>);

  // Sort groups based on mode
  let sortedGroups: [string, InventoryItem[]][];

  if (sortMode === 'priority') {
    // Sort by urgency: prioritize groups with critical/low items
    sortedGroups = Object.entries(groupedItems).sort(([, itemsA], [, itemsB]) => {
      const urgencyA = itemsA.filter(i => i.status === 'critical' || i.status === 'low').length;
      const urgencyB = itemsB.filter(i => i.status === 'critical' || i.status === 'low').length;
      return urgencyB - urgencyA;
    });
  } else {
    // Custom sort order (alphabetical by default, then reorderable)
    const allKeys = Object.keys(groupedItems);

    // Initialize custom order if empty
    if (customGroupOrder.length === 0) {
      const alphabetical = allKeys.sort();
      setCustomGroupOrder(alphabetical);
      sortedGroups = alphabetical.map(key => [key, groupedItems[key]]);
    } else {
      // Filter out groups that no longer exist and add new ones
      const validOrder = customGroupOrder.filter(key => allKeys.includes(key));
      const newGroups = allKeys.filter(key => !customGroupOrder.includes(key)).sort();
      const fullOrder = [...validOrder, ...newGroups];

      if (fullOrder.length !== customGroupOrder.length) {
        setCustomGroupOrder(fullOrder);
      }

      sortedGroups = fullOrder.map(key => [key, groupedItems[key]]);
    }
  }

  const moveGroup = (dragIndex: number, hoverIndex: number) => {
    const dragGroup = customGroupOrder[dragIndex];
    const newOrder = [...customGroupOrder];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, dragGroup);
    setCustomGroupOrder(newOrder);
  };

  if (view === 'detail' && selectedItem) {
    return (
      <ItemDetail 
        item={selectedItem} 
        onClose={() => setView('inventory')} 
      />
    );
  }

  if (view === 'shopping') {
    return (
      <ShoppingList 
        items={mockInventory}
        onClose={() => setView('inventory')}
      />
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-full flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] font-bold mb-1">WeAreOut</h1>
              <p className="text-[15px] text-muted-foreground">Your inventory concierge</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSearchModal(true)}
                className="p-2.5 bg-accent hover:bg-accent/80 rounded-xl transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowAISummaryModal(true)}
                className="p-2.5 bg-gradient-to-br from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/20 rounded-xl transition-colors"
              >
                <Sparkles className="w-5 h-5 text-blue-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="border-b border-border">
          <div className="px-6 py-4 flex gap-3 overflow-x-auto">
            <button
              onClick={() => setView('shopping')}
              className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/80 rounded-xl transition-colors text-[14px] font-medium whitespace-nowrap"
            >
              <ShoppingCart className="w-4 h-4" />
              Shopping List
              {mockInventory.filter(item => item.status === 'critical' || item.status === 'low').length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-red-500 text-white text-[12px] rounded-full">
                  {mockInventory.filter(item => item.status === 'critical' || item.status === 'low').length}
                </span>
              )}
            </button>

            <div className="flex bg-muted rounded-xl p-1">
              <button
                onClick={() => setGroupBy('category')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  groupBy === 'category' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Category
              </button>
              <button
                onClick={() => setGroupBy('location')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                  groupBy === 'location' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                Location
              </button>
            </div>
          </div>

          {/* Sort Mode Toggle */}
          <div className="px-6 pb-4 flex items-center gap-3">
            <span className="text-[13px] text-muted-foreground font-medium">Sort by:</span>
            <div className="flex bg-muted rounded-xl p-1">
              <button
                onClick={() => setSortMode('priority')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
                  sortMode === 'priority' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Priority
              </button>
              <button
                onClick={() => setSortMode('custom')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors whitespace-nowrap ${
                  sortMode === 'custom' ? 'bg-background shadow-sm' : 'text-muted-foreground'
                }`}
              >
                <GripVertical className="w-3.5 h-3.5" />
                Custom
              </button>
            </div>
          </div>
        </div>

        {/* Grouped Inventory List */}
        <div className="flex-1 overflow-y-auto">
          {sortedGroups.map(([groupName, items], index) => (
            <DraggableGroup
              key={groupName}
              groupName={groupName}
              items={items}
              index={index}
              moveGroup={moveGroup}
              onItemClick={handleItemClick}
              isDragMode={sortMode === 'custom'}
            />
          ))}
        </div>

        {/* Add Item Modal */}
        {showAddItem && <AddItemModal onClose={() => setShowAddItem(false)} />}
        {showSearchModal && (
          <SearchModal 
            items={mockInventory} 
            onClose={() => setShowSearchModal(false)} 
            onSelectItem={handleItemClick}
          />
        )}
        {showAISummaryModal && (
          <AISummaryModal 
            items={mockInventory} 
            onClose={() => setShowAISummaryModal(false)} 
          />
        )}
      </div>
    </DndProvider>
  );
}