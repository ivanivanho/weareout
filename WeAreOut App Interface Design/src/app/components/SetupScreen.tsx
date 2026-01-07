import { useState } from 'react';
import { Onboarding } from './Onboarding';
import { DetailsSettings } from './DetailsSettings';
import { Bell, Mail, MapPin, User, Shield, HelpCircle, ChevronRight, Settings } from 'lucide-react';

interface SetupScreenProps {
  hasCompletedOnboarding: boolean;
  onCompleteOnboarding: () => void;
}

export function SetupScreen({ hasCompletedOnboarding, onCompleteOnboarding }: SetupScreenProps) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showDetailsSettings, setShowDetailsSettings] = useState(false);

  if (showOnboarding) {
    return (
      <Onboarding 
        onComplete={() => {
          onCompleteOnboarding();
          setShowOnboarding(false);
        }} 
      />
    );
  }

  if (showDetailsSettings) {
    return <DetailsSettings onClose={() => setShowDetailsSettings(false)} />;
  }

  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <div className="px-6 py-6 border-b border-border">
        <h1 className="text-[28px] font-bold mb-1">Setup</h1>
        <p className="text-[15px] text-muted-foreground">Manage your preferences</p>
      </div>

      {/* Settings List */}
      <div className="flex-1 overflow-y-auto">
        {/* Quick Actions */}
        <div className="px-6 py-4">
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => setShowOnboarding(true)}
              className="w-full px-5 py-4 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 transition-colors shadow-sm"
            >
              Get Started (View Tutorial)
            </button>
            <button
              onClick={() => setShowDetailsSettings(true)}
              className="w-full px-5 py-4 bg-accent border-2 border-border rounded-2xl font-semibold hover:bg-accent/80 transition-colors"
            >
              <div className="flex items-center justify-center gap-2">
                <Settings className="w-5 h-5" />
                Add & Adjust Details
              </div>
            </button>
          </div>
        </div>

        {/* Account Section */}
        <div className="px-6 py-4">
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Account
          </h3>
          <div className="bg-accent/30 rounded-2xl overflow-hidden border border-border">
            <button className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors border-b border-border">
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[15px]">Profile</div>
                <div className="text-[13px] text-muted-foreground">Name, email, preferences</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[15px]">Privacy & Security</div>
                <div className="text-[13px] text-muted-foreground">Data handling, permissions</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Integrations Section */}
        <div className="px-6 py-4">
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Integrations
          </h3>
          <div className="bg-accent/30 rounded-2xl overflow-hidden border border-border">
            <button className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors border-b border-border">
              <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[15px]">Email Receipts</div>
                <div className="text-[13px] text-muted-foreground">Connect email for auto-tracking</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
              <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-orange-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[15px]">Locations</div>
                <div className="text-[13px] text-muted-foreground">Manage storage locations</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="px-6 py-4">
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Notifications
          </h3>
          <div className="bg-accent/30 rounded-2xl overflow-hidden border border-border">
            <button className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
              <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                <Bell className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[15px]">Alerts & Reminders</div>
                <div className="text-[13px] text-muted-foreground">Low stock notifications</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Support Section */}
        <div className="px-6 py-4 pb-8">
          <h3 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Support
          </h3>
          <div className="bg-accent/30 rounded-2xl overflow-hidden border border-border">
            <button 
              onClick={() => setShowOnboarding(true)}
              className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors border-b border-border"
            >
              <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[15px]">View Tutorial</div>
                <div className="text-[13px] text-muted-foreground">Replay the onboarding experience</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>

            <button className="w-full flex items-center gap-4 p-4 hover:bg-accent/50 transition-colors">
              <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-purple-500" />
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium text-[15px]">Help & FAQ</div>
                <div className="text-[13px] text-muted-foreground">Get answers to common questions</div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}