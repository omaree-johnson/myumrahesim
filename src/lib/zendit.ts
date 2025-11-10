/**
 * Zendit API Integration
 * Server-side only module for interacting with Zendit eSIM API
 */

// Zendit API v1 base URL
const ZENDIT_BASE = "https://api.zendit.io/v1";
const ZENDIT_API_KEY = process.env.ZENDIT_API_KEY;

if (!ZENDIT_API_KEY) {
  console.warn("⚠️ ZENDIT_API_KEY not set in environment variables");
}

/**
 * Generic fetch wrapper for Zendit API calls
 */
export async function fetchZendit(path: string, opts: RequestInit = {}) {
  if (!ZENDIT_API_KEY) {
    throw new Error("ZENDIT_API_KEY not configured");
  }

  const url = `${ZENDIT_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${ZENDIT_API_KEY}`,
    ...(opts.headers || {}),
  };

  console.log(`[Zendit] Calling: ${url}`);
  
  const res = await fetch(url, { ...opts, headers });
  
  if (!res.ok) {
    const text = await res.text();
    console.error(`[Zendit] Error ${res.status}:`, text);
    throw new Error(`Zendit API error: ${res.status} ${text}`);
  }
  
  return res.json();
}

/**
 * Get available eSIM products/plans from Zendit
 * Per Zendit API docs: GET /esim/offers returns { list: [], limit, offset, total }
 * Fetches ALL offers by paginating through results
 */
export async function getEsimProducts(country?: string) {
  try {
    const allOffers: any[] = [];
    let offset = 0;
    const limit = 1024; // Maximum allowed by Zendit API
    let total = 0;
    
    // Fetch first page to get total count
    const params = new URLSearchParams({
      _limit: limit.toString(),
      _offset: offset.toString(),
    });
    
    if (country) {
      params.append("country", country);
    }
    
    const firstResponse = await fetchZendit(`/esim/offers?${params.toString()}`);
    total = firstResponse.total || 0;
    
    if (firstResponse.list && Array.isArray(firstResponse.list)) {
      allOffers.push(...firstResponse.list);
    }
    
    console.log('[Zendit] Fetching all offers:', {
      total,
      firstBatch: allOffers.length,
      remainingPages: Math.ceil((total - allOffers.length) / limit)
    });
    
    // Fetch remaining pages
    while (allOffers.length < total) {
      offset += limit;
      params.set("_offset", offset.toString());
      
      const response = await fetchZendit(`/esim/offers?${params.toString()}`);
      
      if (response.list && Array.isArray(response.list)) {
        allOffers.push(...response.list);
        console.log('[Zendit] Fetched page:', {
          offset,
          batchSize: response.list.length,
          totalSoFar: allOffers.length,
          remaining: total - allOffers.length
        });
      } else {
        break; // No more data
      }
    }
    
    console.log('[Zendit] Final result:', {
      total: total,
      fetched: allOffers.length,
      params: country ? `country=${country}` : 'all countries'
    });
    
    return allOffers;
  } catch (error) {
    console.error("[Zendit] Failed to fetch products:", error);
    throw error;
  }
}

/**
 * Purchase an eSIM from Zendit
 * Per Zendit API docs: POST /esim/purchases
 * @param offerId - The Zendit offer ID (e.g., "ESIM-GLOBAL-30D-5GB")
 * @param transactionId - Unique transaction ID from your system
 * @param iccid - Optional: ICCID to apply plan to existing eSIM (omit for new eSIM)
 */
export async function createEsimPurchase({ 
  offerId, 
  transactionId,
  iccid
}: { 
  offerId: string; 
  transactionId: string;
  iccid?: string;
}) {
  // Zendit API: POST /esim/purchases
  // Returns: { status: string, transactionId: string }
  return fetchZendit("/esim/purchases", {
    method: "POST",
    body: JSON.stringify({
      offerId,
      transactionId,
      ...(iccid && { iccid }), // Only include iccid if provided
    }),
  });
}

/**
 * Get purchase/transaction details by transaction ID
 * Per Zendit API docs: GET /esim/purchases/{transactionId}
 */
export async function getPurchaseDetails(transactionId: string) {
  return fetchZendit(`/esim/purchases/${transactionId}`);
}

/**
 * Get QR code for an eSIM purchase
 * Per Zendit API docs: GET /esim/purchases/{transactionId}/qrcode
 * Returns PNG image
 */
export async function getEsimQRCode(transactionId: string) {
  const url = `${process.env.ZENDIT_API_KEY ? "https://api.zendit.io/v1" : ""}/esim/purchases/${transactionId}/qrcode`;
  const headers = {
    "Authorization": `Bearer ${process.env.ZENDIT_API_KEY}`,
  };
  
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Failed to get QR code: ${res.status}`);
  }
  
  return res.blob(); // Returns image/png
}
