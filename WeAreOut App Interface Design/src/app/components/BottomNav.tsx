import { LayoutDashboard, Plus, Settings } from 'lucide-react';

interface BottomNavProps {
  currentScreen: 'dashboard' | 'setup';
  onNavigate: (screen: 'dashboard' | 'setup') => void;
  onInventoryUpdate: () => void;
}

export function BottomNav({ currentScreen, onNavigate, onInventoryUpdate }: BottomNavProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[90px] bg-background border-t border-border">
      <div className="flex items-start justify-around h-full pt-2 pb-8 px-4">
        {/* Dashboard Tab */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex flex-col items-center gap-1 min-w-[60px] transition-colors"
        >
          <div className={`p-2 rounded-xl transition-colors ${
            currentScreen === 'dashboard' 
              ? 'bg-accent text-accent-foreground' 
              : 'text-muted-foreground'
          }`}>
            <LayoutDashboard className="w-6 h-6" />
          </div>
          <span className={`text-[11px] ${
            currentScreen === 'dashboard' 
              ? 'text-foreground' 
              : 'text-muted-foreground'
          }`}>
            Dashboard
          </span>
        </button>

        {/* Center Quick Action Button */}
        <button
          onClick={onInventoryUpdate}
          className="flex flex-col items-center gap-1 min-w-[80px] -mt-3 transition-transform hover:scale-105 active:scale-95"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Plus className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[11px] text-foreground font-medium">
            Update
          </span>
        </button>

        {/* Setup Tab */}
        <button
          onClick={() => onNavigate('setup')}
          className="flex flex-col items-center gap-1 min-w-[60px] transition-colors"
        >
          <div className={`p-2 rounded-xl transition-colors ${
            currentScreen === 'setup' 
              ? 'bg-accent text-accent-foreground' 
              : 'text-muted-foreground'
          }`}>
            <Settings className="w-6 h-6" />
          </div>
          <span className={`text-[11px] ${
            currentScreen === 'setup' 
              ? 'text-foreground' 
              : 'text-muted-foreground'
          }`}>
            Setup
          </span>
        </button>
      </div>
    </div>
  );
}
