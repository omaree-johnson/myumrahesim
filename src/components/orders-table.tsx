'use client';

import { useState, useEffect } from 'react';

interface Purchase {
  id: string;
  transaction_id: string;
  offer_id: string;
  created_at: string;
  price_amount: number;
  price_currency: string;
  status: string;
  activation_details?: {
    iccid?: string;
  };
  esim_provider_response?: {
    esimTranNo?: string;
    esim_tran_no?: string;
  };
}

interface UsageData {
  used: number;
  total: number;
  remaining: number;
  unit: string;
  percentage: number;
  lastUpdateTime?: string;
}

interface OrdersTableProps {
  purchases: Purchase[];
}

export default function OrdersTable({ purchases }: OrdersTableProps) {
  const [usageData, setUsageData] = useState<Record<string, UsageData>>({});
  const [loadingUsage, setLoadingUsage] = useState<Record<string, boolean>>({});

  const handleRowClick = (transactionId: string) => {
    window.location.href = `/activation?transactionId=${transactionId}`;
  };

  // Fetch usage data for active eSIMs
  useEffect(() => {
    const fetchUsage = async (transactionId: string) => {
      // Only fetch for active orders (IN_USE, GOT_RESOURCE, DONE)
      const purchase = purchases.find(p => p.transaction_id === transactionId);
      if (!purchase) return;
      
      const activeStatuses = ['IN_USE', 'GOT_RESOURCE', 'DONE', 'completed'];
      if (!activeStatuses.includes(purchase.status)) return;

      // Check if we have esimTranNo
      const esimTranNo = purchase.esim_provider_response?.esimTranNo || 
                        purchase.esim_provider_response?.esim_tran_no;
      if (!esimTranNo) return;

      setLoadingUsage(prev => ({ ...prev, [transactionId]: true }));
      
      try {
        const response = await fetch(`/api/orders/${transactionId}/usage`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.usage) {
            setUsageData(prev => ({ ...prev, [transactionId]: data.usage }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      } finally {
        setLoadingUsage(prev => ({ ...prev, [transactionId]: false }));
      }
    };

    // Fetch usage for all active purchases
    purchases.forEach(purchase => {
      fetchUsage(purchase.transaction_id);
    });
  }, [purchases]);

  const refreshUsage = async (transactionId: string) => {
    setLoadingUsage((prev) => ({ ...prev, [transactionId]: true }));
    try {
      const response = await fetch(`/api/orders/${transactionId}/usage?refresh=1`);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to refresh usage");
      if (data.success && data.usage) {
        setUsageData((prev) => ({ ...prev, [transactionId]: data.usage }));
      }
    } catch (error) {
      console.error("Failed to refresh usage:", error);
    } finally {
      setLoadingUsage((prev) => ({ ...prev, [transactionId]: false }));
    }
  };

  const formatUsage = (usage: UsageData | undefined) => {
    if (!usage) return null;
    return `${usage.used} / ${usage.total} ${usage.unit} (${usage.percentage}% used)`;
  };

  const formatLastUpdated = (usage: UsageData | undefined) => {
    if (!usage?.lastUpdateTime) return null;
    const t = Date.parse(String(usage.lastUpdateTime));
    if (Number.isFinite(t)) return new Date(t).toLocaleString();
    return String(usage.lastUpdateTime);
  };

  const needsTopUp = (usage: UsageData | undefined) => {
    if (!usage) return false;
    // Recommend “top up” when low remaining or high % used.
    return usage.remaining <= 0.5 || usage.percentage >= 85;
  };

  return (
    <>
      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            onClick={() => handleRowClick(purchase.transaction_id)}
            className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow active:scale-98 touch-manipulation"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(purchase.created_at).toLocaleDateString()}
                </p>
                <p className="font-medium text-gray-900 dark:text-white mt-1">
                  {purchase.offer_id}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  purchase.status === 'DONE' || purchase.status === 'completed' || purchase.status === 'GOT_RESOURCE' || purchase.status === 'IN_USE'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : purchase.status === 'PROCESSING' || purchase.status === 'pending' || purchase.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    : purchase.status === 'FAILED' || purchase.status === 'CANCELLED' || purchase.status === 'REVOKED'
                    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {purchase.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Transaction ID:</span>
                <span className="text-gray-900 dark:text-white font-mono text-xs">
                  {purchase.transaction_id.substring(0, 8)}...
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="text-gray-900 dark:text-white font-semibold">
                  {purchase.price_currency} {purchase.price_amount.toFixed(2)}
                </span>
              </div>
              {(purchase.status === 'IN_USE' || purchase.status === 'GOT_RESOURCE' || purchase.status === 'DONE') && usageData[purchase.transaction_id] && (
                <div className="flex justify-between text-sm pt-2 border-t border-gray-200 dark:border-slate-700">
                  <span className="text-gray-600 dark:text-gray-400">Data Usage:</span>
                  <div className="text-right">
                    <div className="text-gray-900 dark:text-white font-semibold">
                      {formatUsage(usageData[purchase.transaction_id])}
                    </div>
                    {formatLastUpdated(usageData[purchase.transaction_id]) && (
                      <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                        Last updated: {formatLastUpdated(usageData[purchase.transaction_id])}
                      </div>
                    )}
                    {needsTopUp(usageData[purchase.transaction_id]) && (
                      <div className="mt-1 inline-flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                          Top up recommended
                        </span>
                        <a
                          href={`/topup/${purchase.transaction_id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200 underline"
                        >
                          Get more data
                        </a>
                      </div>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        refreshUsage(purchase.transaction_id);
                      }}
                      className="mt-2 text-[11px] font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white underline"
                    >
                      Refresh usage
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="w-full bg-sky-600 dark:bg-sky-500 text-white py-2.5 rounded-lg text-sm font-medium active:bg-sky-700 transition-colors">
              View Details
            </button>

            {(purchase.status === 'DONE' || purchase.status === 'completed' || purchase.status === 'GOT_RESOURCE' || purchase.status === 'IN_USE') && (
              <a
                href={`/review/${purchase.transaction_id}`}
                onClick={(e) => e.stopPropagation()}
                className="mt-3 block text-center text-sm font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200 underline"
              >
                Leave a review (get 5% off)
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Date
              </th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Product
              </th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-8 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Usage
              </th>
              <th className="px-8 py-4 text-right text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {purchases.map((purchase) => (
              <tr
                key={purchase.id}
                onClick={() => handleRowClick(purchase.transaction_id)}
                className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-all hover:shadow-sm"
              >
                <td className="px-8 py-5 whitespace-nowrap text-base text-gray-900 dark:text-gray-200">
                  {new Date(purchase.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-8 py-5 text-base text-gray-900 dark:text-white">
                  <div className="font-semibold">eSIM Plan</div>
                  <div className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{purchase.offer_id}</div>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm">
                  <code className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-900 px-3 py-1.5 rounded-md font-mono">
                    {purchase.transaction_id.substring(0, 12)}...
                  </code>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-base font-semibold text-gray-900 dark:text-white">
                  {purchase.price_currency} {purchase.price_amount.toFixed(2)}
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                  <span className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-semibold ${
                    purchase.status === 'DONE' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    purchase.status === 'PROCESSING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                    purchase.status === 'FAILED' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {purchase.status}
                  </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {(purchase.status === 'IN_USE' || purchase.status === 'GOT_RESOURCE' || purchase.status === 'DONE') ? (
                    loadingUsage[purchase.transaction_id] ? (
                      <span className="text-gray-400">Loading...</span>
                    ) : usageData[purchase.transaction_id] ? (
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {formatUsage(usageData[purchase.transaction_id])}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {usageData[purchase.transaction_id].remaining.toFixed(2)} {usageData[purchase.transaction_id].unit} remaining
                        </div>
                        {formatLastUpdated(usageData[purchase.transaction_id]) && (
                          <div className="text-[11px] text-gray-500 dark:text-gray-500 mt-1">
                            Last updated: {formatLastUpdated(usageData[purchase.transaction_id])}
                          </div>
                        )}
                        {needsTopUp(usageData[purchase.transaction_id]) && (
                          <div className="mt-2 inline-flex items-center gap-2">
                            <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                              Top up recommended
                            </span>
                            <a
                              href={`/topup/${purchase.transaction_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200 underline"
                            >
                              Get more data
                            </a>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            refreshUsage(purchase.transaction_id);
                          }}
                          className="mt-2 text-[11px] font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white underline"
                        >
                          Refresh usage
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-right text-base">
                  <div className="inline-flex flex-col items-end gap-2">
                    <a
                      href={`/activation?transactionId=${purchase.transaction_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      {(purchase.status === 'DONE' || purchase.status === 'completed' || purchase.status === 'GOT_RESOURCE' || purchase.status === 'IN_USE') ? 'View Details' : 'Check Status'}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>

                    {(purchase.status === 'DONE' || purchase.status === 'completed' || purchase.status === 'GOT_RESOURCE' || purchase.status === 'IN_USE') && (
                      <a
                        href={`/review/${purchase.transaction_id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[12px] font-semibold text-sky-700 hover:text-sky-800 dark:text-sky-300 dark:hover:text-sky-200 underline"
                      >
                        Leave a review (5% off)
                      </a>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
        {/* Summary footer */}
        <div className="bg-gray-50 dark:bg-slate-900 px-8 py-5 border-t border-gray-200 dark:border-slate-700">
          <p className="text-base text-gray-600 dark:text-gray-400">
            Total orders: <span className="font-semibold text-gray-900 dark:text-white text-lg">{purchases.length}</span>
          </p>
        </div>
      </div>
    </>
  );
}
