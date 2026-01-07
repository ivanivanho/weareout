import { useState } from 'react';
import { ChevronLeft, Plus, X, Edit2, Check, Mail, Key, Layers, MapPin } from 'lucide-react';

type DetailsSettingsProps = {
  onClose: () => void;
};

type Category = {
  id: string;
  name: string;
  icon: string;
};

type Location = {
  id: string;
  name: string;
  description?: string;
};

export function DetailsSettings({ onClose }: DetailsSettingsProps) {
  const [activeTab, setActiveTab] = useState<'auth' | 'categories' | 'locations'>('auth');
  
  // Auth state
  const [email, setEmail] = useState('');
  const [isEmailConnected, setIsEmailConnected] = useState(false);
  const [apiKey, setApiKey] = useState('');
  
  // Categories state
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Dairy & Eggs', icon: '🥛' },
    { id: '2', name: 'Bakery', icon: '🍞' },
    { id: '3', name: 'Beverages', icon: '☕' },
    { id: '4', name: 'Personal Care', icon: '🧴' },
    { id: '5', name: 'Cooking Essentials', icon: '🧂' },
    { id: '6', name: 'Cleaning', icon: '🧹' },
  ]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  
  // Locations state
  const [locations, setLocations] = useState<Location[]>([
    { id: '1', name: 'Fridge - Door', description: 'Refrigerator door shelves' },
    { id: '2', name: 'Fridge - Top Shelf', description: 'Main refrigerator top shelf' },
    { id: '3', name: 'Pantry - Shelf A', description: 'Top pantry shelf' },
    { id: '4', name: 'Pantry - Shelf B', description: 'Middle pantry shelf' },
    { id: '5', name: 'Kitchen - Counter', description: 'Kitchen countertop' },
    { id: '6', name: 'Kitchen - Sink', description: 'Under/near sink area' },
    { id: '7', name: 'Bathroom - Shower', description: 'Shower/bathtub area' },
    { id: '8', name: 'Bathroom - Cabinet', description: 'Bathroom cabinet/vanity' },
  ]);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [newLocationName, setNewLocationName] = useState('');
  const [newLocationDesc, setNewLocationDesc] = useState('');
  const [showAddLocation, setShowAddLocation] = useState(false);

  const handleConnectEmail = () => {
    if (email) {
      setIsEmailConnected(true);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([
        ...categories,
        {
          id: Date.now().toString(),
          name: newCategoryName.trim(),
          icon: '📦',
        },
      ]);
      setNewCategoryName('');
      setShowAddCategory(false);
    }
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const handleUpdateCategory = (id: string, newName: string) => {
    setCategories(
      categories.map(cat => (cat.id === id ? { ...cat, name: newName } : cat))
    );
    setEditingCategoryId(null);
  };

  const handleAddLocation = () => {
    if (newLocationName.trim()) {
      setLocations([
        ...locations,
        {
          id: Date.now().toString(),
          name: newLocationName.trim(),
          description: newLocationDesc.trim() || undefined,
        },
      ]);
      setNewLocationName('');
      setNewLocationDesc('');
      setShowAddLocation(false);
    }
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const handleUpdateLocation = (id: string, newName: string) => {
    setLocations(
      locations.map(loc => (loc.id === id ? { ...loc, name: newName } : loc))
    );
    setEditingLocationId(null);
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
        <h2 className="text-[17px] font-semibold">Add & Adjust Details</h2>
        <div className="w-10" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('auth')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-medium transition-colors ${
            activeTab === 'auth'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-muted-foreground'
          }`}
        >
          <Key className="w-4 h-4" />
          Authentication
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-medium transition-colors ${
            activeTab === 'categories'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-muted-foreground'
          }`}
        >
          <Layers className="w-4 h-4" />
          Categories
        </button>
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[14px] font-medium transition-colors ${
            activeTab === 'locations'
              ? 'text-blue-500 border-b-2 border-blue-500'
              : 'text-muted-foreground'
          }`}
        >
          <MapPin className="w-4 h-4" />
          Locations
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Authentication Tab */}
        {activeTab === 'auth' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-[17px] font-semibold mb-2">Email Receipt Scanning</h3>
              <p className="text-[14px] text-muted-foreground mb-4">
                Connect your email to automatically track purchases from receipts
              </p>

              {!isEmailConnected ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleConnectEmail}
                    disabled={!email}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      Connect Email
                    </div>
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Check className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-600">Connected</span>
                  </div>
                  <p className="text-[14px] text-muted-foreground">{email}</p>
                  <button
                    onClick={() => setIsEmailConnected(false)}
                    className="mt-3 text-[13px] text-red-500 hover:underline"
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-border">
              <h3 className="text-[17px] font-semibold mb-2">API Keys</h3>
              <p className="text-[14px] text-muted-foreground mb-4">
                Manage API keys for third-party integrations
              </p>

              <div>
                <label className="block text-[13px] font-medium mb-2">Gemini Vision API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-••••••••••••••••"
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-[12px] text-muted-foreground">
                  Used for photo parsing and receipt scanning
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[17px] font-semibold">Item Categories</h3>
                <p className="text-[13px] text-muted-foreground">
                  Organize your inventory by type
                </p>
              </div>
              <button
                onClick={() => setShowAddCategory(true)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Add Category Form */}
            {showAddCategory && (
              <div className="mb-4 p-4 bg-muted border border-border rounded-xl">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category name"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddCategory}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-[14px] font-medium hover:bg-blue-600"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategoryName('');
                    }}
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-[14px] font-medium hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <span className="text-[24px]">{category.icon}</span>
                  {editingCategoryId === category.id ? (
                    <input
                      type="text"
                      defaultValue={category.name}
                      onBlur={(e) => handleUpdateCategory(category.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateCategory(category.id, e.currentTarget.value);
                        }
                      }}
                      className="flex-1 px-2 py-1 bg-background border border-border rounded text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1 text-[15px] font-medium">{category.name}</span>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCategoryId(category.id)}
                      className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locations Tab */}
        {activeTab === 'locations' && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[17px] font-semibold">Storage Locations</h3>
                <p className="text-[13px] text-muted-foreground">
                  Define where items are stored
                </p>
              </div>
              <button
                onClick={() => setShowAddLocation(true)}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Add Location Form */}
            {showAddLocation && (
              <div className="mb-4 p-4 bg-muted border border-border rounded-xl">
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="Location name (e.g., Fridge - Top Shelf)"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                  autoFocus
                />
                <input
                  type="text"
                  value={newLocationDesc}
                  onChange={(e) => setNewLocationDesc(e.target.value)}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddLocation}
                    className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-[14px] font-medium hover:bg-blue-600"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => {
                      setShowAddLocation(false);
                      setNewLocationName('');
                      setNewLocationDesc('');
                    }}
                    className="flex-1 px-3 py-2 border border-border rounded-lg text-[14px] font-medium hover:bg-accent"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Locations List */}
            <div className="space-y-2">
              {locations.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-orange-500" />
                  </div>
                  {editingLocationId === location.id ? (
                    <input
                      type="text"
                      defaultValue={location.name}
                      onBlur={(e) => handleUpdateLocation(location.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleUpdateLocation(location.id, e.currentTarget.value);
                        }
                      }}
                      className="flex-1 px-2 py-1 bg-background border border-border rounded text-[15px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <div className="flex-1">
                      <div className="text-[15px] font-medium">{location.name}</div>
                      {location.description && (
                        <div className="text-[13px] text-muted-foreground">
                          {location.description}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingLocationId(location.id)}
                      className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteLocation(location.id)}
                      className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
