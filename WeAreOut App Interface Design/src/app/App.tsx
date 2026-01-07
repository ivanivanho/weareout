import { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { Onboarding } from './components/Onboarding';
import { BottomNav } from './components/BottomNav';
import { InventoryUpdateModal } from './components/InventoryUpdateModal';
import { SetupScreen } from './components/SetupScreen';

type Screen = 'dashboard' | 'setup';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [showInventoryUpdate, setShowInventoryUpdate] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      {/* iOS App Container */}
      <div className="relative w-full max-w-[430px] h-[932px] bg-background overflow-hidden rounded-[60px] shadow-2xl">
        {/* Status Bar */}
        <div className="absolute top-0 left-0 right-0 h-[44px] bg-background z-50">
          <div className="flex items-center justify-between px-8 pt-4">
            <span className="text-[15px] font-semibold">9:41</span>
            <div className="flex items-center gap-1.5">
              <div className="w-[17px] h-[12px] border border-foreground rounded-sm relative">
                <div className="absolute inset-[1.5px] bg-foreground rounded-[1px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area with safe area padding */}
        <div className="h-full pt-[44px] pb-[90px] overflow-hidden">
          {currentScreen === 'dashboard' && <Dashboard />}
          {currentScreen === 'setup' && (
            <SetupScreen 
              hasCompletedOnboarding={hasCompletedOnboarding}
              onCompleteOnboarding={() => setHasCompletedOnboarding(true)}
            />
          )}
        </div>

        {/* Bottom Navigation */}
        <BottomNav 
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          onInventoryUpdate={() => setShowInventoryUpdate(true)}
        />

        {/* Inventory Update Modal */}
        {showInventoryUpdate && (
          <InventoryUpdateModal onClose={() => setShowInventoryUpdate(false)} />
        )}
      </div>
    </div>
  );
}