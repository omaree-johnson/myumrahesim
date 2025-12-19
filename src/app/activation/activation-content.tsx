"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface ActivationData {
  status: string;
  confirmation: {
    iccid: string | null;
    smdpAddress: string | null;
    activationCode: string | null;
    qrCode: string | null;
  };
}

export function ActivationContent() {
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
            setError('Transaction not found. Please wait a moment and refresh the page.');
          } else {
            throw new Error('Failed to fetch activation details');
          }
          setLoading(false);
          return;
        }

        const data = await response.json();
        setActivationData(data);
        
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

  if (!transactionId) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-4">
        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              No Transaction ID Provided
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please access this page from your order details or use a valid transaction ID.
            </p>
            <Link
              href="/orders"
              className="inline-block px-6 py-3 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white font-medium rounded-lg transition-colors"
            >
              View My Orders
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-4">
      <section className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200 font-medium mb-1">Error</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-sky-200 dark:border-sky-800 border-t-sky-600 dark:border-t-sky-400 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Fetching activation details...</p>
          </div>
        ) : activationData ? (
          <div className="space-y-6 max-w-2xl mx-auto">
            {/* Status Badge */}
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                activationData.status === 'DONE' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                activationData.status === 'PROCESSING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                activationData.status === 'FAILED' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}>
                {activationData.status}
              </span>
              {(activationData.status === 'PENDING' || activationData.status === 'PROCESSING') && (
                <span className="text-sm text-gray-500 dark:text-gray-400">(Auto-refreshing...)</span>
              )}
            </div>

            {/* QR Code */}
            {activationData.confirmation.qrCode ? (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 border border-gray-300 dark:border-slate-500 rounded-lg p-6 text-center">
                <div className="w-48 h-48 bg-white dark:bg-white border border-gray-200 dark:border-slate-400 rounded-lg mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  <Image
                    src={activationData.confirmation.qrCode}
                    alt="eSIM QR Code for activation"
                    width={200}
                    height={200}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                  Scan this QR code to activate your eSIM
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-700 dark:to-slate-600 border border-dashed border-gray-300 dark:border-slate-500 rounded-lg p-6 text-center">
                <div className="w-48 h-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    {activationData.status === 'DONE' ? 'QR code not available' : 'QR code pending...'}
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {activationData.status === 'DONE' 
                    ? 'Use manual details below'
                    : 'Will appear when ready'}
                </p>
              </div>
            )}

            {/* Manual Activation */}
            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Manual Activation Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1 font-medium">SM-DP+ Address:</p>
                  <p className="font-mono text-gray-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-2 rounded border dark:border-slate-600 break-all text-xs">
                    {activationData.confirmation.smdpAddress || '[Pending activation]'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-1 font-medium">Activation Code:</p>
                  <p className="font-mono text-gray-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-2 rounded border dark:border-slate-600 break-all text-xs">
                    {activationData.confirmation.activationCode || '[Pending activation]'}
                  </p>
                </div>
                {activationData.confirmation.iccid && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-1 font-medium">ICCID:</p>
                    <p className="font-mono text-gray-900 dark:text-white bg-white dark:bg-slate-700 px-3 py-2 rounded border dark:border-slate-600 break-all text-xs">
                      {activationData.confirmation.iccid}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Step-by-Step Activation Instructions</h3>
              <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex gap-3">
                  <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">1.</span>
                  <span>Open Settings on your device</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">2.</span>
                  <span>Navigate to Cellular (iPhone) or Mobile Data (Android)</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">3.</span>
                  <span>Select "Add eSIM" or "Add Cellular Plan"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">4.</span>
                  <span>Scan the QR code above or enter the activation code manually</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">5.</span>
                  <span>Follow the on-screen prompts to complete activation</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-sky-600 dark:text-sky-400 shrink-0">6.</span>
                  <span>When you arrive in Saudi Arabia, enable data roaming and select this eSIM for mobile data</span>
                </li>
              </ol>
            </div>

            {/* Support & Helpful Links */}
            <div className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Need Help?</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-600 dark:text-gray-300 mb-3">
                  If you encounter any issues during activation, we're here to help:
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@myumrahesim.com"}`}
                    className="inline-block px-4 py-2 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-600 text-white font-medium rounded-lg transition-colors text-center"
                  >
                    Contact Support
                  </a>
                  <Link
                    href="/faq"
                    className="inline-block px-4 py-2 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 font-medium rounded-lg transition-colors text-center"
                  >
                    View FAQ
                  </Link>
                  <Link
                    href="/ultimate-guide-esim-umrah"
                    className="inline-block px-4 py-2 border-2 border-sky-600 dark:border-sky-400 text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/30 font-medium rounded-lg transition-colors text-center"
                  >
                    Activation Guide
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
            <p className="text-yellow-800 dark:text-yellow-200">No activation data available</p>
          </div>
        )}
      </section>
    </div>
  );
}
