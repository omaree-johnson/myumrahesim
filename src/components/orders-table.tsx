'use client';

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
}

interface OrdersTableProps {
  purchases: Purchase[];
}

export default function OrdersTable({ purchases }: OrdersTableProps) {
  const handleRowClick = (transactionId: string) => {
    window.location.href = `/activation?transactionId=${transactionId}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Transaction ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {purchases.map((purchase) => (
              <tr
                key={purchase.id}
                onClick={() => handleRowClick(purchase.transaction_id)}
                className="hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                  {new Date(purchase.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                  <div className="font-medium">eSIM Plan</div>
                  <div className="text-gray-500 dark:text-gray-400 text-xs">{purchase.offer_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <code className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-slate-900 px-2 py-1 rounded">
                    {purchase.transaction_id.substring(0, 12)}...
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {purchase.price_currency} {purchase.price_amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    purchase.status === 'DONE' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    purchase.status === 'PROCESSING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                    purchase.status === 'FAILED' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                    'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {purchase.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <a
                    href={`/activation?transactionId=${purchase.transaction_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium inline-flex items-center gap-1"
                  >
                    {purchase.status === 'DONE' ? 'View Details' : 'Check Status'}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Summary footer */}
      <div className="bg-gray-50 dark:bg-slate-900 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Total orders: <span className="font-medium text-gray-900 dark:text-white">{purchases.length}</span>
        </p>
      </div>
    </div>
  );
}
