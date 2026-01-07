import { Camera, Mic, X, Image } from 'lucide-react';
import { useState } from 'react';

interface InventoryUpdateModalProps {
  onClose: () => void;
}

export function InventoryUpdateModal({ onClose }: InventoryUpdateModalProps) {
  const [mode, setMode] = useState<'choice' | 'camera' | 'voice' | null>('choice');

  return (
    <div
      className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end"
      onClick={(e) => {
        // Close when clicking backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal Sheet */}
      <div className="w-full bg-background rounded-t-[30px] shadow-2xl animate-slide-up">
        {/* Handle Bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-border rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border">
          <h2 className="text-[20px] font-semibold">Inventory Update</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-8 pb-12">
          {mode === 'choice' && (
            <div className="space-y-4">
              <p className="text-[15px] text-muted-foreground text-center mb-8">
                How would you like to update your inventory?
              </p>

              {/* Camera Option */}
              <button
                onClick={() => setMode('camera')}
                className="w-full flex items-center gap-4 p-5 bg-accent/50 hover:bg-accent rounded-2xl transition-colors border border-border"
              >
                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <Camera className="w-7 h-7 text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-[16px]">Scan with Camera</div>
                  <div className="text-[13px] text-muted-foreground mt-0.5">
                    Take a photo of your groceries or receipts
                  </div>
                </div>
              </button>

              {/* Voice Option */}
              <button
                onClick={() => setMode('voice')}
                className="w-full flex items-center gap-4 p-5 bg-accent/50 hover:bg-accent rounded-2xl transition-colors border border-border"
              >
                <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                  <Mic className="w-7 h-7 text-purple-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-[16px]">Voice Update</div>
                  <div className="text-[13px] text-muted-foreground mt-0.5">
                    Tell us what you need: "We're out of milk"
                  </div>
                </div>
              </button>

              {/* Photo Library Option */}
              <button
                onClick={() => setMode('camera')}
                className="w-full flex items-center gap-4 p-5 bg-accent/50 hover:bg-accent rounded-2xl transition-colors border border-border"
              >
                <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center">
                  <Image className="w-7 h-7 text-green-500" />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-[16px]">Choose from Photos</div>
                  <div className="text-[13px] text-muted-foreground mt-0.5">
                    Upload an existing receipt or photo
                  </div>
                </div>
              </button>
            </div>
          )}

          {mode === 'camera' && (
            <div className="space-y-6">
              {/* Camera Preview Placeholder */}
              <div className="aspect-[3/4] bg-muted rounded-2xl flex items-center justify-center border-2 border-dashed border-border">
                <div className="text-center">
                  <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-3" />
                  <p className="text-[15px] text-muted-foreground">Camera preview</p>
                  <p className="text-[13px] text-muted-foreground mt-1">
                    Position items in frame
                  </p>
                </div>
              </div>

              {/* Camera Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('choice')}
                  className="flex-1 py-4 rounded-xl border border-border hover:bg-accent transition-colors text-[15px] font-medium"
                >
                  Back
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-colors text-[15px] font-medium"
                >
                  Capture & Analyze
                </button>
              </div>
            </div>
          )}

          {mode === 'voice' && (
            <div className="space-y-6">
              {/* Voice Recording Interface */}
              <div className="py-12 flex flex-col items-center">
                <div className="w-32 h-32 bg-purple-500/10 rounded-full flex items-center justify-center mb-6 border-4 border-purple-500/20">
                  <Mic className="w-16 h-16 text-purple-500" />
                </div>
                <p className="text-[17px] font-medium mb-2">Tap to speak</p>
                <p className="text-[14px] text-muted-foreground text-center max-w-[280px]">
                  Say something like "We're out of milk" or "Add coffee to the shopping list"
                </p>
              </div>

              {/* Voice Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setMode('choice')}
                  className="flex-1 py-4 rounded-xl border border-border hover:bg-accent transition-colors text-[15px] font-medium"
                >
                  Back
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-4 rounded-xl bg-purple-500 hover:bg-purple-600 text-white transition-colors text-[15px] font-medium"
                >
                  Start Recording
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}