"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";

interface ActivationData {
  status: string;
  confirmation: {
    iccid: string | null;
    smdpAddress: string | null;
    activationCode: string | null;
    qrCode: string | null;
  };
}

function ActivationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionId = searchParams.get("transactionId");
  const [loading, setLoading] = useState(true);
  const [activationData, setActivationData] = useState<ActivationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transactionId) {
      setError("No transaction ID provided");
      setLoading(false);
      return;
    }

    const fetchActivationDetails = async () => {
      try {
        const response = await fetch(`/api/purchases/${transactionId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            // Transaction not found yet, might still be processing
            setError('Transaction not found. Please wait a moment and refresh the page.');
          } else {
            throw new Error('Failed to fetch activation details');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setActivationData(data);
        
        // If status is pending, poll every 5 seconds
        if (data.status === 'PENDING' || data.status === 'PROCESSING') {
          setLoading(true);
          setTimeout(fetchActivationDetails, 5000);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching activation details:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchActivationDetails();
  }, [transactionId]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <div className="mb-4">
        <button 
          onClick={() => router.push('/orders')}
          className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium flex items-center gap-2 cursor-pointer"
        >
          <span>←</span> Back to Orders
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              eSIM Activation Details
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Your eSIM purchase is being processed
            </p>
          </div>
          {transactionId && (
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Transaction ID</p>
              <p className="text-xs font-mono text-gray-900 dark:text-white">{transactionId.substring(0, 16)}...</p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <p className="text-red-800 dark:text-red-200 font-medium text-sm">Error</p>
            <p className="text-red-700 dark:text-red-300 text-xs">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="w-10 h-10 border-4 border-sky-200 dark:border-sky-800 border-t-sky-600 dark:border-t-sky-400 rounded-full animate-spin mb-2"></div>
            <p className="text-gray-600 dark:text-gray-300 text-xs">Fetching activation details...</p>
          </div>
        ) : activationData ? (
          <div className="space-y-3 max-w-xl mx-auto">
            {/* Status Badge */}
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                activationData.status === 'DONE' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                activationData.status === 'PROCESSING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                activationData.status === 'FAILED' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
                {activationData.status}
              </span>
              {(activationData.status === 'PENDING' || activationData.status === 'PROCESSING') && (
                <span className="text-xs text-gray-500 dark:text-gray-400">(Auto-refreshing...)</span>
              )}
            </div>

            {/* QR Code */}
            {activationData.confirmation.qrCode ? (
              <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg p-3 text-center">
                <div className="w-40 h-40 bg-white dark:bg-white border border-gray-200 dark:border-slate-400 rounded mx-auto mb-1.5 flex items-center justify-center overflow-hidden">
                  <Image
                    src={activationData.confirmation.qrCode}
                    alt="eSIM QR Code"
                    width={80}
                    height={80}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  Scan to activate
                </p>
              </div>
            ) : (
              <div className="bg-linear-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 border border-dashed border-gray-300 dark:border-slate-500 rounded-lg p-3 text-center">
                <div className="w-40 h-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded mx-auto mb-1.5 flex items-center justify-center">
                  <p className="text-gray-400 dark:text-gray-500 text-xs">
                    {activationData.status === 'DONE' ? 'QR code not available' : 'QR code pending...'}
                  </p>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  {activationData.status === 'DONE' 
                    ? 'Use manual details below'
                    : 'Will appear when ready'}
                </p>
              </div>
            )}

            {/* Manual Activation */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-xs">Manual Activation</h3>
              <div className="space-y-1.5 text-xs">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-0.5 text-xs">SM-DP+ Address:</p>
                  <p className="font-mono text-gray-900 dark:text-white bg-white dark:bg-slate-700 px-2 py-1 rounded border dark:border-slate-600 break-all text-[10px]">
                    {activationData.confirmation.smdpAddress || '[Pending activation]'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-0.5 text-xs">Activation Code:</p>
                  <p className="font-mono text-gray-900 dark:text-white bg-white dark:bg-slate-700 px-2 py-1 rounded border dark:border-slate-600 break-all text-[10px]">
                    {activationData.confirmation.activationCode || '[Pending activation]'}
                  </p>
                </div>
                {activationData.confirmation.iccid && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-0.5 text-xs">ICCID:</p>
                    <p className="font-mono text-gray-900 dark:text-white bg-white dark:bg-slate-700 px-2 py-1 rounded border dark:border-slate-600 break-all text-[10px]">
                      {activationData.confirmation.iccid}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-3">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-xs">How to Activate</h3>
              <ol className="space-y-1 text-[11px] text-gray-700 dark:text-gray-300">
                <li className="flex gap-1.5">
                  <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">1.</span>
                  <span>Open Settings on your device</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">2.</span>
                  <span>Navigate to Cellular or Mobile Data</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">3.</span>
                  <span>Select "Add eSIM" or "Add Cellular Plan"</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">4.</span>
                  <span>Scan QR code or enter activation code</span>
                </li>
                <li className="flex gap-1.5">
                  <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">5.</span>
                  <span>Follow prompts to complete</span>
                </li>
              </ol>
            </div>

            {/* Support */}
            <div className="text-center pt-1">
              <p className="text-xs text-gray-600 dark:text-gray-300 mb-1.5">
                Need help?
              </p>
              <a
                href="#support"
                className="inline-block px-3 py-1.5 text-xs bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white font-medium rounded-lg transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
            <p className="text-yellow-800 dark:text-yellow-200">No activation data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivationPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-sky-200 dark:border-sky-800 border-t-sky-600 dark:border-t-sky-400 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading activation details...</p>
          </div>
        </div>
      </div>
    }>
      <ActivationContent />
    </Suspense>
  );
}
