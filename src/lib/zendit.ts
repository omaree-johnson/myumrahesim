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

/**
 * Get usage data for an eSIM by ICCID
 * Per Zendit API docs: GET /esim/{iccId}/plans
 * Returns: { list: [...plans], total: number }
 */
export async function getEsimUsage(iccid: string) {
  try {
    return await fetchZendit(`/esim/${iccid}/plans`);
  } catch (error) {
    console.error("[Zendit] Failed to fetch usage for ICCID:", iccid, error);
    throw error;
  }
}

/**
 * Get eSIM offer details by offerId
 * Per Zendit API docs: GET /esim/offers/{offerId}
 * Returns offer details including cost information
 */
export async function getEsimOffer(offerId: string) {
  try {
    return await fetchZendit(`/esim/offers/${offerId}`);
  } catch (error) {
    console.error("[Zendit] Failed to fetch offer:", offerId, error);
    throw error;
  }
}

/**
 * Get Zendit wallet balance
 * 
 * ⚠️ WARNING: This endpoint does not exist in Zendit API (returns 404)
 * Wallet API endpoints are not available as of current Zendit API version
 * 
 * This function is kept for future use if Zendit adds wallet API support.
 * Set ENABLE_ZENDIT_WALLET_TOPUP=true to enable wallet operations.
 * 
 * Returns: { balance: number, currency: string } or similar
 */
export async function getWalletBalance() {
  try {
    // NOTE: This endpoint returns 404 - wallet API not available
    // Common patterns: /wallet/balance, /wallets/balance, /account/wallet
    return await fetchZendit("/wallet/balance");
  } catch (error) {
    console.error("[Zendit] Failed to fetch wallet balance:", error);
    throw error;
  }
}

/**
 * Top up Zendit wallet using card details
 * 
 * ⚠️ WARNING: This endpoint does not exist in Zendit API (returns 404)
 * Wallet API endpoints are not available as of current Zendit API version
 * 
 * This function is kept for future use if Zendit adds wallet API support.
 * Set ENABLE_ZENDIT_WALLET_TOPUP=true to enable wallet operations.
 * 
 * @param amountCents - Amount in smallest currency unit (cents)
 * @param currency - Currency code (e.g., "USD")
 * @param cardDetails - Card details for top-up
 * @param reference - Optional reference ID for the top-up
 */
export async function topUpWallet({
  amountCents,
  currency,
  cardDetails,
  reference
}: {
  amountCents: number;
  currency: string;
  cardDetails: {
    number: string;
    exp_month: number;
    exp_year: number;
    cvc: string;
  };
  reference?: string;
}) {
  try {
    const body: any = {
      amount: amountCents,
      currency: currency.toUpperCase(),
      card: {
        number: cardDetails.number,
        exp_month: cardDetails.exp_month,
        exp_year: cardDetails.exp_year,
        cvc: cardDetails.cvc
      }
    };

    if (reference) {
      body.reference = reference;
    }

    // NOTE: This endpoint returns 404 - wallet API not available
    // Common patterns: /wallet/topup, /wallets/topup, /wallet/top-up
    return await fetchZendit("/wallet/topup", {
      method: "POST",
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.error("[Zendit] Failed to top up wallet:", error);
    throw error;
  }
}
