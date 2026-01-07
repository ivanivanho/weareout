import { useState } from 'react';
import { Camera, Receipt, Plus, Scan, X } from 'lucide-react';

type AddItemModalProps = {
  onClose: () => void;
};

export function AddItemModal({ onClose }: AddItemModalProps) {
  const [mode, setMode] = useState<'select' | 'photo' | 'receipt' | 'manual'>('select');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Item added:', { itemName, category, location, quantity, unit });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-foreground">Add Item</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {mode === 'select' && (
          <div className="p-6">
            <p className="text-[14px] text-muted-foreground mb-6">
              Choose how you'd like to add items to your inventory
            </p>

            <div className="space-y-3">
              {/* Photo Scan Option */}
              <button
                onClick={() => setMode('photo')}
                className="w-full p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground mb-1">Scan Pantry or Fridge</h3>
                    <p className="text-[13px] text-muted-foreground">
                      Take a photo and let AI identify items automatically
                    </p>
                  </div>
                </div>
              </button>

              {/* Receipt Scan Option */}
              <button
                onClick={() => setMode('receipt')}
                className="w-full p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Receipt className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground mb-1">Scan Receipt</h3>
                    <p className="text-[13px] text-muted-foreground">
                      Photo or digital receipt - we'll extract the items
                    </p>
                  </div>
                </div>
              </button>

              {/* Manual Entry Option */}
              <button
                onClick={() => setMode('manual')}
                className="w-full p-4 border border-border rounded-lg hover:bg-accent transition-colors text-left group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-foreground mb-1">Manual Entry</h3>
                    <p className="text-[13px] text-muted-foreground">
                      Add items one at a time with details
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Email Integration Note */}
            <div className="mt-6 p-4 bg-muted rounded-lg">
              <div className="flex items-start gap-3">
                <Scan className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="text-[13px] text-foreground mb-1">
                    Automatic Email Scanning
                  </h4>
                  <p className="text-[12px] text-muted-foreground">
                    Connect your email to automatically import digital receipts from Amazon,
                    Instacart, and other retailers.
                  </p>
                  <button className="text-[12px] text-primary mt-2 hover:underline">
                    Set up email integration →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {mode === 'photo' && (
          <div className="p-6">
            <button
              onClick={() => setMode('select')}
              className="text-[13px] text-primary mb-4 hover:underline"
            >
              ← Back to options
            </button>

            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-foreground mb-2">Scan Your Pantry or Fridge</h3>
              <p className="text-[13px] text-muted-foreground mb-6">
                Take a photo of your shelves, and our AI will identify and add items
                automatically
              </p>
              <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                Open Camera
              </button>
            </div>

            <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
              <p className="text-[12px] text-amber-800 dark:text-amber-400">
                <strong>Tip:</strong> For best results, ensure good lighting and capture items
                clearly with their labels visible.
              </p>
            </div>
          </div>
        )}

        {mode === 'receipt' && (
          <div className="p-6">
            <button
              onClick={() => setMode('select')}
              className="text-[13px] text-primary mb-4 hover:underline"
            >
              ← Back to options
            </button>

            <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-foreground mb-2">Scan Your Receipt</h3>
              <p className="text-[13px] text-muted-foreground mb-6">
                Upload a photo of your paper receipt or forward a digital receipt
              </p>
              <div className="flex gap-3 justify-center">
                <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
                  Take Photo
                </button>
                <button className="px-6 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors">
                  Upload File
                </button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-[12px] text-muted-foreground">
                We'll extract item names, quantities, and purchase dates to help track your
                consumption patterns.
              </p>
            </div>
          </div>
        )}

        {mode === 'manual' && (
          <form onSubmit={handleSubmit} className="p-6">
            <button
              onClick={() => setMode('select')}
              type="button"
              className="text-[13px] text-primary mb-4 hover:underline"
            >
              ← Back to options
            </button>

            <div className="space-y-4">
              <div>
                <label className="block text-[14px] text-foreground mb-2">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={itemName}
                  onChange={e => setItemName(e.target.value)}
                  placeholder="e.g., Whole Milk"
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[14px] text-foreground mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    placeholder="1"
                    step="0.1"
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[14px] text-foreground mb-2">Unit *</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="">Select...</option>
                    <option value="L">Liters</option>
                    <option value="ml">Milliliters</option>
                    <option value="kg">Kilograms</option>
                    <option value="g">Grams</option>
                    <option value="items">Items</option>
                    <option value="bottle">Bottle</option>
                    <option value="loaf">Loaf</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[14px] text-foreground mb-2">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Select category...</option>
                  <option value="Dairy & Eggs">Dairy & Eggs</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Beverages">Beverages</option>
                  <option value="Personal Care">Personal Care</option>
                  <option value="Cooking Essentials">Cooking Essentials</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Produce">Produce</option>
                  <option value="Meat & Seafood">Meat & Seafood</option>
                </select>
              </div>

              <div>
                <label className="block text-[14px] text-foreground mb-2">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  placeholder="e.g., Fridge - Door, Pantry - Shelf A"
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="text-[12px] text-muted-foreground mt-1.5">
                  Optional: Helps you find items quickly
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
              >
                Add Item
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
