import { X, Sparkles, TrendingDown, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { InventoryItem } from './Dashboard';

type AISummaryModalProps = {
  items: InventoryItem[];
  onClose: () => void;
};

export function AISummaryModal({ items, onClose }: AISummaryModalProps) {
  // Calculate summary statistics
  const criticalItems = items.filter(i => i.status === 'critical');
  const lowItems = items.filter(i => i.status === 'low');
  const goodItems = items.filter(i => i.status === 'good');

  // Items expiring this week (next 7 days)
  const expiringThisWeek = items.filter(i => i.daysRemaining <= 7 && i.status !== 'critical');
  
  // High consumption items
  const highConsumption = items
    .filter(i => i.consumptionRate > 0)
    .sort((a, b) => {
      const rateA = a.consumptionRate / (a.quantity || 1);
      const rateB = b.consumptionRate / (b.quantity || 1);
      return rateB - rateA;
    })
    .slice(0, 3);

  // Generate AI insights
  const insights = [
    {
      icon: AlertTriangle,
      color: 'text-red-500',
      bg: 'bg-red-500/10',
      title: 'Immediate Attention',
      description: criticalItems.length > 0
        ? `${criticalItems.length} ${criticalItems.length === 1 ? 'item needs' : 'items need'} restocking within 24 hours`
        : 'No critical items detected',
    },
    {
      icon: TrendingDown,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      title: 'Running Low',
      description: lowItems.length > 0
        ? `${lowItems.length} ${lowItems.length === 1 ? 'item is' : 'items are'} running low and should be added to shopping list`
        : 'Stock levels are healthy',
    },
    {
      icon: Calendar,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      title: 'Week Ahead',
      description: expiringThisWeek.length > 0
        ? `${expiringThisWeek.length} ${expiringThisWeek.length === 1 ? 'item will' : 'items will'} need attention within 7 days`
        : 'No items expiring soon',
    },
    {
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      title: 'Well Stocked',
      description: `${goodItems.length} ${goodItems.length === 1 ? 'item is' : 'items are'} adequately stocked`,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
      <div className="w-full max-h-[85vh] bg-background rounded-t-3xl shadow-xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[17px] font-semibold">AI Summary</h2>
              <p className="text-[13px] text-muted-foreground">Stock intelligence</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Daily Summary */}
          <div>
            <h3 className="text-[15px] font-semibold mb-3">Today's Overview</h3>
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl">
              <p className="text-[14px] leading-relaxed">
                {criticalItems.length > 0
                  ? `You have ${criticalItems.length} critical ${criticalItems.length === 1 ? 'item' : 'items'} requiring immediate attention. ${
                      criticalItems.map(i => i.name).slice(0, 2).join(' and ')
                    }${criticalItems.length > 2 ? ` and ${criticalItems.length - 2} more` : ''} should be restocked today.`
                  : 'All your inventory levels are stable today. No immediate action required.'}
              </p>
            </div>
          </div>

          {/* Key Insights */}
          <div>
            <h3 className="text-[15px] font-semibold mb-3">Key Insights</h3>
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-4 bg-accent/30 border border-border rounded-xl"
                >
                  <div className={`w-10 h-10 ${insight.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <insight.icon className={`w-5 h-5 ${insight.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[14px] font-semibold mb-1">{insight.title}</h4>
                    <p className="text-[13px] text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High Consumption Items */}
          {highConsumption.length > 0 && (
            <div>
              <h3 className="text-[15px] font-semibold mb-3">High Consumption Items</h3>
              <div className="space-y-2">
                {highConsumption.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-accent/30 border border-border rounded-xl"
                  >
                    <div>
                      <div className="text-[14px] font-medium">{item.name}</div>
                      <div className="text-[12px] text-muted-foreground">{item.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[13px] font-medium text-amber-500">
                        {item.consumptionRate}{item.unit}/day
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {item.daysRemaining}d remaining
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Forecast */}
          <div>
            <h3 className="text-[15px] font-semibold mb-3">7-Day Forecast</h3>
            <div className="p-4 bg-accent/30 border border-border rounded-xl">
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Based on current consumption patterns, you'll need to restock approximately{' '}
                <span className="font-semibold text-foreground">
                  {criticalItems.length + lowItems.length} items
                </span>{' '}
                this week. {expiringThisWeek.length > 0 && (
                  <>Additionally, {expiringThisWeek.length} {expiringThisWeek.length === 1 ? 'item' : 'items'} will approach low stock by next week.</>
                )}
              </p>
            </div>
          </div>

          {/* Action Recommendations */}
          <div>
            <h3 className="text-[15px] font-semibold mb-3">Recommended Actions</h3>
            <div className="space-y-2">
              {criticalItems.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2" />
                  <p className="text-[13px]">
                    Add critical items to shopping list immediately
                  </p>
                </div>
              )}
              {lowItems.length > 0 && (
                <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2" />
                  <p className="text-[13px]">
                    Plan shopping trip for items running low
                  </p>
                </div>
              )}
              {criticalItems.length === 0 && lowItems.length === 0 && (
                <div className="flex items-start gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2" />
                  <p className="text-[13px]">
                    Your inventory is well-maintained. No immediate action needed.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
