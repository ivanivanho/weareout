import { ChevronLeft, TrendingDown, Clock, MapPin, Package, Calendar } from 'lucide-react';
import { InventoryItem } from './Dashboard';

type ItemDetailProps = {
  item: InventoryItem;
  onClose: () => void;
};

export function ItemDetail({ item, onClose }: ItemDetailProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'low':
        return 'text-amber-600 dark:text-amber-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900';
      case 'low':
        return 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900';
      default:
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900';
    }
  };

  // Mock historical data for visualization
  const purchaseHistory = [
    { date: '2025-12-20', quantity: 1, unit: item.unit },
    { date: '2025-12-06', quantity: 1, unit: item.unit },
    { date: '2025-11-22', quantity: 1, unit: item.unit },
  ];

  const daysUntilEmpty = item.daysRemaining;
  const estimatedEmptyDate = new Date();
  estimatedEmptyDate.setDate(estimatedEmptyDate.getDate() + daysUntilEmpty);

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
        <h2 className="text-[17px] font-semibold">Item Details</h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">
          {/* Item Name & Location */}
          <div>
            <h1 className="text-[28px] font-bold mb-2">{item.name}</h1>
            <div className="flex items-center gap-2 text-[15px] text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{item.location}</span>
              <span className="text-border">•</span>
              <span>{item.category}</span>
            </div>
          </div>

          {/* Current Status */}
          <div className={`border rounded-2xl p-5 ${getStatusBg(item.status)}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-foreground">Current Status</h3>
              <span
                className={`text-[13px] font-medium px-3 py-1 rounded-full ${
                  item.status === 'critical'
                    ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                    : item.status === 'low'
                    ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                    : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                }`}
              >
                {item.status === 'critical'
                  ? 'Critical'
                  : item.status === 'low'
                  ? 'Running Low'
                  : 'Good Stock'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-[13px] text-muted-foreground mb-1">Stock Level</p>
                <p className="text-[24px] font-medium text-foreground">
                  {item.quantity} <span className="text-[16px]">{item.unit}</span>
                </p>
              </div>
              <div>
                <p className="text-[13px] text-muted-foreground mb-1">Days Remaining</p>
                <p className={`text-[24px] font-medium ${getStatusColor(item.status)}`}>
                  {item.daysRemaining} <span className="text-[16px]">days</span>
                </p>
              </div>
            </div>
          </div>

          {/* Consumption Intelligence */}
          <div>
            <h3 className="text-foreground mb-4">Consumption Intelligence</h3>

            <div className="space-y-4">
              {/* Burn Rate */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[14px] text-foreground">Average Burn Rate</p>
                    <p className="text-[12px] text-muted-foreground">
                      Based on last 3 purchases
                    </p>
                  </div>
                </div>
                <p className="text-[18px] font-medium text-foreground">
                  {item.consumptionRate} {item.unit}/day
                </p>
              </div>

              {/* Estimated Empty Date */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[14px] text-foreground">Estimated Empty Date</p>
                    <p className="text-[12px] text-muted-foreground">
                      When you'll likely run out
                    </p>
                  </div>
                </div>
                <p className="text-[18px] font-medium text-foreground">
                  {estimatedEmptyDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>

              {/* Confidence Score */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-background rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[14px] text-foreground">Prediction Confidence</p>
                    <p className="text-[12px] text-muted-foreground">
                      {item.confidence === 'high'
                        ? 'High accuracy'
                        : item.confidence === 'medium'
                        ? 'Needs more data'
                        : 'Limited data available'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`w-2 h-6 rounded-full ${
                          (item.confidence === 'high' && i <= 3) ||
                          (item.confidence === 'medium' && i <= 2) ||
                          (item.confidence === 'low' && i <= 1)
                            ? 'bg-primary'
                            : 'bg-border'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase History */}
          <div>
            <h3 className="text-foreground mb-4">Purchase History</h3>
            <div className="space-y-3">
              {purchaseHistory.map((purchase, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[14px] text-foreground">
                        {new Date(purchase.date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-[12px] text-muted-foreground">
                        {index === 0
                          ? 'Most recent purchase'
                          : `${Math.floor(
                              (new Date().getTime() - new Date(purchase.date).getTime()) /
                                (1000 * 60 * 60 * 24)
                            )} days ago`}
                      </p>
                    </div>
                  </div>
                  <p className="text-[14px] text-foreground">
                    {purchase.quantity} {purchase.unit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <button className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors">
              Mark as Out
            </button>
            <button className="flex-1 px-4 py-2.5 border border-border rounded-lg hover:bg-accent transition-colors">
              Update Quantity
            </button>
            <button className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity">
              Add to List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}