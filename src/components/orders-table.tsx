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
            </div>

            <button className="w-full bg-sky-600 dark:bg-sky-500 text-white py-2.5 rounded-lg text-sm font-medium active:bg-sky-700 transition-colors">
              View Details
            </button>
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
                <td className="px-8 py-5 whitespace-nowrap text-right text-base">
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
