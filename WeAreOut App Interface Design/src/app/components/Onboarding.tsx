import { useState } from 'react';
import { Camera, Receipt, Scan, CircleCheck, ArrowRight } from 'lucide-react';

type OnboardingProps = {
  onComplete: () => void;
};

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<'welcome' | 'how-it-works' | 'test-scan' | 'ready'>(
    'welcome'
  );

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <h1 className="text-foreground mb-3">Welcome to WeAreOut</h1>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              Your personal inventory concierge. We'll help you never run out of essentials
              again - without the mental burden of tracking everything.
            </p>
          </div>

          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CircleCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-foreground mb-1">Zero-Effort Tracking</h3>
                <p className="text-[13px] text-muted-foreground">
                  Snap photos, scan receipts, or connect your email - no manual entry needed
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CircleCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-foreground mb-1">Predictive Intelligence</h3>
                <p className="text-[13px] text-muted-foreground">
                  We learn your consumption patterns and predict when you'll run out
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
              <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <CircleCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-foreground mb-1">Proactive Shopping Lists</h3>
                <p className="text-[13px] text-muted-foreground">
                  Automatic shopping lists based on what's running low, grouped by store
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('how-it-works')}
            className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (step === 'how-it-works') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center">
            <h2 className="text-foreground mb-3">How WeAreOut Works</h2>
            <p className="text-[14px] text-muted-foreground">
              Three simple ways to keep your inventory up to date
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="border border-border rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Camera className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2">1. Snap Photos</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Take a quick photo of your pantry, fridge, or bathroom shelves. Our AI
                    identifies items and quantities automatically.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Receipt className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2">2. Scan Receipts</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Photo or digital receipts from any store. We extract items, quantities,
                    and dates to track consumption patterns.
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-border rounded-lg p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Scan className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-foreground mb-2">3. Connect Your Email</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Automatically import digital receipts from Amazon, Instacart, and other
                    retailers - completely hands-free.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('welcome')}
              className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep('test-scan')}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              Try a Test Scan
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'test-scan') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="mb-8 text-center">
            <h2 className="text-foreground mb-3">Test the Learning Scan</h2>
            <p className="text-[14px] text-muted-foreground">
              Try scanning a receipt or taking a photo to see how easy it is
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <button className="w-full p-5 border-2 border-dashed border-border rounded-lg hover:bg-accent transition-colors group">
              <div className="flex flex-col items-center">
                <Camera className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-foreground mb-1">Take a Photo</h3>
                <p className="text-[13px] text-muted-foreground">
                  Snap your pantry or fridge
                </p>
              </div>
            </button>

            <button className="w-full p-5 border-2 border-dashed border-border rounded-lg hover:bg-accent transition-colors group">
              <div className="flex flex-col items-center">
                <Receipt className="w-8 h-8 text-primary mb-3" />
                <h3 className="text-foreground mb-1">Scan a Receipt</h3>
                <p className="text-[13px] text-muted-foreground">Upload or photo a receipt</p>
              </div>
            </button>
          </div>

          <div className="text-center mb-6">
            <button
              onClick={() => setStep('ready')}
              className="text-[14px] text-primary hover:underline"
            >
              Skip for now →
            </button>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
            <p className="text-[13px] text-amber-800 dark:text-amber-400">
              <strong>No pressure:</strong> This is completely optional. You can start adding
              items anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Ready step
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CircleCheck className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-foreground mb-3">You're All Set!</h2>
          <p className="text-[15px] text-muted-foreground leading-relaxed">
            WeAreOut is ready to be your personal inventory concierge. Start by adding a few
            items you buy regularly, and we'll learn your patterns over time.
          </p>
        </div>

        <div className="space-y-4 mb-8 text-left">
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-[14px] text-foreground mb-2">🎯 First Steps</h4>
            <ul className="text-[13px] text-muted-foreground space-y-1.5">
              <li>• Add 3-5 items you buy most frequently</li>
              <li>• Mark items as "out" when you finish them</li>
              <li>• Check your dashboard daily for updates</li>
            </ul>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="text-[14px] text-foreground mb-2">💡 Pro Tip</h4>
            <p className="text-[13px] text-muted-foreground">
              The more you use WeAreOut, the smarter it gets at predicting when you'll run
              out. After 2-3 purchase cycles, predictions become highly accurate.
            </p>
          </div>
        </div>

        <button
          onClick={onComplete}
          className="w-full px-6 py-3.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}