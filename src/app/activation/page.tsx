"use client";

import { useSearchParams } from "next/navigation";
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <a href="/" className="text-sky-600 hover:text-sky-700 font-medium flex items-center gap-2">
          <span>←</span> Back to Home
        </a>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          eSIM Activation Details
        </h1>
        <p className="text-gray-600 mb-6">
          Your eSIM purchase is being processed. Activation details will appear here.
        </p>

        {transactionId && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
            <p className="text-sm font-mono text-gray-900 break-all">{transactionId}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">Error</p>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Fetching activation details...</p>
          </div>
        ) : activationData ? (
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                activationData.status === 'DONE' ? 'bg-green-100 text-green-800' :
                activationData.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                activationData.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {activationData.status}
              </span>
              {(activationData.status === 'PENDING' || activationData.status === 'PROCESSING') && (
                <span className="text-xs text-gray-500">(Auto-refreshing...)</span>
              )}
            </div>

            {/* QR Code */}
            {activationData.confirmation.qrCode ? (
              <div className="bg-linear-to-br from-gray-50 to-gray-100 border-2 border-gray-300 rounded-xl p-8 text-center">
                <div className="w-64 h-64 bg-white border-2 border-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  <Image
                    src={activationData.confirmation.qrCode}
                    alt="eSIM QR Code"
                    width={256}
                    height={256}
                    className="w-full h-full object-contain"
                  />
                </div>
                <p className="text-sm text-gray-600">
                  Scan this QR code with your device to activate your eSIM
                </p>
              </div>
            ) : (
              <div className="bg-linear-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <div className="w-48 h-48 bg-white border-2 border-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                  <p className="text-gray-400 text-sm">
                    {activationData.status === 'DONE' ? 'QR code not available' : 'QR code pending...'}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {activationData.status === 'DONE' 
                    ? 'Use manual activation details below'
                    : 'QR code will appear here once activation is complete'}
                </p>
              </div>
            )}

            {/* Manual Activation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Manual Activation</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600 mb-1">SM-DP+ Address:</p>
                  <p className="font-mono text-gray-900 bg-white px-3 py-2 rounded border break-all">
                    {activationData.confirmation.smdpAddress || '[Pending activation]'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Activation Code:</p>
                  <p className="font-mono text-gray-900 bg-white px-3 py-2 rounded border break-all">
                    {activationData.confirmation.activationCode || '[Pending activation]'}
                  </p>
                </div>
                {activationData.confirmation.iccid && (
                  <div>
                    <p className="text-gray-600 mb-1">ICCID:</p>
                    <p className="font-mono text-gray-900 bg-white px-3 py-2 rounded border break-all">
                      {activationData.confirmation.iccid}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Activation Instructions</h3>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex gap-3">
                  <span className="font-bold text-sky-600 shrink-0">1.</span>
                  <span>Open Settings on your device</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-sky-600 shrink-0">2.</span>
                  <span>Navigate to Cellular or Mobile Data</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-sky-600 shrink-0">3.</span>
                  <span>Select "Add eSIM" or "Add Cellular Plan"</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-sky-600 shrink-0">4.</span>
                  <span>Scan the QR code or enter the activation code manually</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-sky-600 shrink-0">5.</span>
                  <span>Follow on-screen prompts to complete activation</span>
                </li>
              </ol>
            </div>

            {/* Support */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Need help activating your eSIM?
              </p>
              <a
                href="#support"
                className="inline-block px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
              >
                Contact Support
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">No activation data available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ActivationPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-sky-200 border-t-sky-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Loading activation details...</p>
          </div>
        </div>
      </div>
    }>
      <ActivationContent />
    </Suspense>
  );
}
