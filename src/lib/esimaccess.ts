/**
 * eSIM Access API Integration
 * Documentation: esimaccess.md
 */

const BASE_URL =
  process.env.ESIMACCESS_BASE_URL || "https://api.esimaccess.com/api/v1/open";
const ACCESS_CODE = process.env.ESIMACCESS_ACCESS_CODE;
const DEFAULT_COUNTRY_CODE = process.env.ESIMACCESS_COUNTRY_CODE || "SA";
const DEFAULT_CURRENCY = process.env.ESIMACCESS_DEFAULT_CURRENCY || "USD";

// Profit margin multiplier (e.g., 1.20 = 20% markup, 1.30 = 30% markup)
// Set via ESIMACCESS_PROFIT_MARGIN environment variable (default: 1.20 = 20%)
const PROFIT_MARGIN = parseFloat(process.env.ESIMACCESS_PROFIT_MARGIN || "1.20");

function requireCredentials() {
  if (!ACCESS_CODE) {
    throw new Error(
      "ESIMACCESS_ACCESS_CODE must be set in environment variables"
    );
  }
}

async function fetchEsimAccess(path: string, options: RequestInit = {}) {
  requireCredentials();

  const url = `${BASE_URL}${path}`;
  console.log(`[eSIM Access] Fetching: ${url}`);

  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "RT-AccessCode": ACCESS_CODE!,
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`[eSIM Access] HTTP ${res.status} error:`, text);
    throw new Error(`eSIM Access API error ${res.status}: ${text}`);
  }

  let data;
  try {
    data = await res.json();
  } catch (parseError) {
    const text = await res.text();
    console.error(`[eSIM Access] Failed to parse JSON response:`, text);
    throw new Error(`eSIM Access API returned invalid JSON: ${text.substring(0, 200)}`);
  }

  console.log(`[eSIM Access] Response structure:`, {
    hasSuccess: 'success' in data,
    hasErrorCode: 'errorCode' in data,
    hasObj: 'obj' in data,
    keys: Object.keys(data),
    success: data.success,
    errorCode: data.errorCode,
    responsePreview: JSON.stringify(data).substring(0, 500),
  });
  
  // eSIM Access returns { success, errorCode, errorMsg, obj }
  // Check if response indicates an error
  if (data.success === false || (data.errorCode && data.errorCode !== "0" && data.errorCode !== 0)) {
    const errorCode = String(data.errorCode || 'UNKNOWN');
    const errorMsg = data.errorMsg || data.errorCode || "Unknown error";
    
    console.error(`[eSIM Access] API error:`, {
      success: data.success,
      errorCode: errorCode,
      errorMsg: data.errorMsg,
      path: url,
      fullResponse: JSON.stringify(data, null, 2),
    });
    
    // Create error with error code attached
    const apiError = new Error(`eSIM Access API error ${errorCode}: ${errorMsg}`);
    (apiError as any).errorCode = errorCode;
    (apiError as any).errorMsg = data.errorMsg;
    (apiError as any).apiResponse = data;
    throw apiError;
  }

  // If response doesn't have success/errorCode structure, it might be a direct response
  // Check if it looks like an error response
  if (data.error && !data.success) {
    console.error(`[eSIM Access] Error in response:`, data);
    throw new Error(`eSIM Access API error: ${data.error.message || data.error || 'Unknown error'}`);
  }

  // Return the data object or the full response if obj doesn't exist
  return data.obj || data;
}

/**
 * Get available eSIM products/plans from eSIM Access
 * Filters by country code (SA for Saudi Arabia)
 */
export async function getEsimProducts(locationCode = DEFAULT_COUNTRY_CODE) {
  try {
    // Query packages with country/location filter at API level
    // Use both 'country' and 'locationCode' to ensure server-side filtering
    const countryCode = locationCode.toUpperCase();
    const response = await fetchEsimAccess("/package/list", {
      method: "POST",
      body: JSON.stringify({
        country: countryCode,
        locationCode: countryCode, // Try both parameter names
      }),
    });
    
    console.log(`[eSIM Access] Requested packages for country: ${countryCode}`);

    console.log(`[eSIM Access] Package list response:`, {
      isArray: Array.isArray(response),
      hasPackageList: response?.packageList !== undefined,
      responseKeys: response ? Object.keys(response) : [],
      responseType: typeof response,
      requestedCountry: countryCode,
    });

    const packages = Array.isArray(response?.packageList)
      ? response.packageList
      : Array.isArray(response)
      ? response
      : [];

    console.log(`[eSIM Access] Received ${packages.length} packages from API (requested ${countryCode} only)`);

    // Since we're filtering at API level with country/locationCode parameters,
    // the API should only return Saudi Arabia packages.
    // However, we still do client-side validation to ensure no multi-country packages slip through
    return packages
      .filter((pkg: any) => {
        // Filter for enabled packages with valid prices
        const hasPrice =
          pkg.price !== undefined &&
          pkg.price !== null &&
          typeof pkg.price === "number" &&
          pkg.price > 0;
        if (!hasPrice || pkg.enabled === false) return false;

        // Additional safety check: Verify this is actually a Saudi Arabia package
        // (API should have filtered, but double-check to be safe)
        const pkgCountry = (
          pkg.country || 
          pkg.countryCode || 
          pkg.country_code ||
          pkg.locationCode ||
          pkg.location_code ||
          ""
        ).toString().trim().toUpperCase();
        
        const pkgLocation = (
          pkg.location || 
          pkg.locationCode || 
          pkg.location_code ||
          pkg.locationList?.[0]?.code ||
          ""
        ).toString().trim().toUpperCase();
        
        // Reject if country is explicitly not SA
        if (pkgCountry && pkgCountry !== countryCode) {
          console.warn(`[eSIM Access] Rejecting package ${pkg.packageCode || pkg.slug}: country="${pkgCountry}" (expected ${countryCode})`);
          return false;
        }
        
        // Reject multi-country packages (location list with multiple countries)
        if (pkg.locationList && Array.isArray(pkg.locationList)) {
          const locationCodes = pkg.locationList.map((loc: any) => 
            (loc.code || loc).toString().trim().toUpperCase()
          );
          if (locationCodes.length !== 1 || locationCodes[0] !== countryCode) {
            console.warn(`[eSIM Access] Rejecting multi-country package ${pkg.packageCode || pkg.slug}: locations=${locationCodes.join(',')}`);
            return false;
          }
        }
        
        // Reject if location is comma-separated (multi-country)
        if (pkgLocation && pkgLocation.includes(",")) {
          console.warn(`[eSIM Access] Rejecting multi-country package ${pkg.packageCode || pkg.slug}: location="${pkgLocation}"`);
          return false;
        }
        
        // Reject if location is explicitly not SA
        if (pkgLocation && pkgLocation !== countryCode) {
          console.warn(`[eSIM Access] Rejecting package ${pkg.packageCode || pkg.slug}: location="${pkgLocation}" (expected ${countryCode})`);
          return false;
        }
        
        // If no country/location info, trust the API filter (we requested SA packages)
        // This is acceptable since we filtered at API level
        return true;
      })
      .map((pkg: any) => {
        // eSIM Access price is in format: price * 10,000
        // So $19.99 would be 199900
        const basePrice = pkg.price / 10000;
        
        // Apply profit margin to the base price
        // Store original cost for reference
        const costPrice = basePrice;
        const actualPrice = basePrice * PROFIT_MARGIN;

        // Extract country/location for logging
        const pkgCountry = (
          pkg.country || 
          pkg.countryCode || 
          pkg.country_code ||
          pkg.locationCode ||
          pkg.location_code ||
          ""
        ).toString().trim().toUpperCase();
        
        const pkgLocation = (
          pkg.location || 
          pkg.locationCode || 
          pkg.location_code ||
          pkg.locationList?.[0]?.code ||
          ""
        ).toString().trim().toUpperCase();

        // Convert data from bytes to GB if needed
        // From logs: eSIM Access API returns `volume` field in bytes
        let dataGB = 0;
        
        // First check volume field (eSIM Access uses this - in bytes)
        if (typeof pkg.volume === "number" && pkg.volume > 0) {
          // Convert from bytes to GB and round to 1 decimal place for values < 1GB, whole number for >= 1GB
          const rawGB = pkg.volume / (1024 * 1024 * 1024);
          dataGB = rawGB < 1 ? Math.round(rawGB * 10) / 10 : Math.round(rawGB);
        }
        // Check if dataGB is already provided
        else if (typeof pkg.dataGB === "number" && pkg.dataGB > 0) {
          // Round to 1 decimal place for values < 1GB, whole number for >= 1GB
          dataGB = pkg.dataGB < 1 ? Math.round(pkg.dataGB * 10) / 10 : Math.round(pkg.dataGB);
        }
        // Check data field (might be in bytes)
        else if (typeof pkg.data === "number" && pkg.data > 0) {
          // If data is in bytes, convert to GB and round
          const rawGB = pkg.data / (1024 * 1024 * 1024);
          dataGB = rawGB < 1 ? Math.round(rawGB * 10) / 10 : Math.round(rawGB);
        }
        // Check dataBytes field
        else if (typeof pkg.dataBytes === "number" && pkg.dataBytes > 0) {
          const rawGB = pkg.dataBytes / (1024 * 1024 * 1024);
          dataGB = rawGB < 1 ? Math.round(rawGB * 10) / 10 : Math.round(rawGB);
        }
        // Check dataSize field
        else if (typeof pkg.dataSize === "number" && pkg.dataSize > 0) {
          // Assume it's already in GB or needs conversion based on size
          if (pkg.dataSize > 1000) {
            // Likely in MB, convert to GB
            dataGB = pkg.dataSize / 1024;
          } else {
            // Likely already in GB
            dataGB = pkg.dataSize;
          }
        }
        // Check if there's a data field that's a string (e.g., "10GB")
        else if (typeof pkg.data === "string") {
          const match = pkg.data.match(/(\d+(?:\.\d+)?)\s*GB/i);
          if (match) {
            dataGB = parseFloat(match[1]);
          }
        }

        // Log package structure for debugging (only for SA packages)
        if (pkgCountry === "SA" || pkgLocation === "SA") {
          const allKeys = Object.keys(pkg);
          const dataFields = allKeys.filter(key => 
            key.toLowerCase().includes('data') || 
            key.toLowerCase().includes('size') || 
            key.toLowerCase().includes('volume') ||
            key.toLowerCase().includes('gb') ||
            key.toLowerCase().includes('mb')
          );
          
          console.log(`[eSIM Access] Package ${pkg.packageCode || pkg.slug} (SA):`, {
            duration: pkg.duration,
            durationDays: pkg.durationDays,
            validity: pkg.validity,
            price: pkg.price,
            dataFields: dataFields.map(key => ({ [key]: pkg[key] })),
            allDataRelatedFields: dataFields.reduce((acc, key) => {
              acc[key] = pkg[key];
              return acc;
            }, {} as any),
            allKeys: allKeys,
          });
        }

        // Parse duration - check multiple possible fields
        // From logs, we see the API returns `duration` field
        let durationDays = 0;
        if (typeof pkg.duration === "number" && pkg.duration > 0) {
          durationDays = Math.floor(pkg.duration);
        } else if (typeof pkg.durationDays === "number" && pkg.durationDays > 0) {
          durationDays = Math.floor(pkg.durationDays);
        } else if (typeof pkg.validity === "number" && pkg.validity > 0) {
          durationDays = Math.floor(pkg.validity);
        } else if (typeof pkg.validityDays === "number" && pkg.validityDays > 0) {
          durationDays = Math.floor(pkg.validityDays);
        } else if (typeof pkg.validity === "string") {
          // Try to parse string like "30 days" or "30"
          const match = pkg.validity.match(/(\d+)/);
          if (match) durationDays = parseInt(match[1], 10);
        }

        return {
          id: pkg.packageCode || pkg.slug || pkg.id,
          offerId: pkg.packageCode || pkg.slug || pkg.id,
          packageCode: pkg.packageCode || pkg.slug || pkg.id,
          slug: pkg.slug || pkg.packageCode || pkg.id,
          shortNotes: pkg.shortNotes || pkg.name || pkg.packageName,
          notes: pkg.notes || pkg.name || pkg.packageName,
          name: pkg.name || pkg.packageName || pkg.shortNotes,
          country: locationCode.toUpperCase(),
          location: locationCode.toUpperCase(),
          brandName: pkg.brandName || "eSIM Access",
          durationDays: durationDays,
          dataGB: dataGB || 0,
          dataUnlimited: Boolean(pkg.dataUnlimited),
          price: {
            fixed: Math.round(actualPrice * 100), // Convert to cents (with profit margin)
            currency: pkg.currency || DEFAULT_CURRENCY,
            currencyDivisor: 100,
          },
          // Store original cost price for reference (in cents)
          costPrice: {
            fixed: Math.round(costPrice * 100), // Original cost in cents
            currency: pkg.currency || DEFAULT_CURRENCY,
            currencyDivisor: 100,
          },
          // Profit margin applied (for reference)
          profitMargin: PROFIT_MARGIN,
          enabled: pkg.enabled !== false,
        };
      });
  } catch (error) {
    console.error("[eSIM Access] Failed to fetch products:", error);
    throw error;
  }
}

/**
 * Get a single package by packageCode or slug
 */
export async function getEsimPackage(packageCode: string) {
  try {
    const response = await fetchEsimAccess("/package/list", {
      method: "POST",
      body: JSON.stringify({
        packageCode,
      }),
    });

    const packages = Array.isArray(response?.packageList)
      ? response.packageList
      : Array.isArray(response)
      ? response
      : [];

    const pkg = packages.find(
      (p: any) =>
        p.packageCode === packageCode ||
        p.slug === packageCode ||
        p.id === packageCode
    );

    if (!pkg) return null;

    const basePrice = pkg.price / 10000;
    // Apply profit margin
    const costPrice = basePrice;
    const actualPrice = basePrice * PROFIT_MARGIN;
    let dataGB = pkg.dataGB;
    if (pkg.data && typeof pkg.data === "number") {
      dataGB = pkg.data / (1024 * 1024 * 1024);
    }

    return {
      id: pkg.packageCode || pkg.slug || pkg.id,
      offerId: pkg.packageCode || pkg.slug || pkg.id,
      packageCode: pkg.packageCode || pkg.slug || pkg.id,
      slug: pkg.slug || pkg.packageCode || pkg.id,
      shortNotes: pkg.shortNotes || pkg.name || pkg.packageName,
      notes: pkg.notes || pkg.name || pkg.packageName,
      name: pkg.name || pkg.packageName || pkg.shortNotes,
      country: pkg.country || DEFAULT_COUNTRY_CODE,
      location: pkg.location || DEFAULT_COUNTRY_CODE,
      brandName: pkg.brandName || "eSIM Access",
      durationDays: pkg.durationDays || pkg.validity || 0,
      dataGB: dataGB || 0,
      dataUnlimited: Boolean(pkg.dataUnlimited),
      price: {
        fixed: Math.round(actualPrice * 100), // Convert to cents (with profit margin)
        currency: pkg.currency || DEFAULT_CURRENCY,
        currencyDivisor: 100,
      },
      // Store original cost price for reference (in cents)
      costPrice: {
        fixed: Math.round(costPrice * 100), // Original cost in cents
        currency: pkg.currency || DEFAULT_CURRENCY,
        currencyDivisor: 100,
      },
      // Profit margin applied (for reference)
      profitMargin: PROFIT_MARGIN,
      enabled: pkg.enabled !== false,
    };
  } catch (error) {
    console.error("[eSIM Access] Failed to fetch package:", error);
    return null;
  }
}

/**
 * Create an eSIM order/purchase
 */
export async function createEsimOrder({
  packageCode,
  transactionId,
  travelerName,
  travelerEmail,
}: {
  packageCode: string;
  transactionId: string;
  travelerName?: string;
  travelerEmail?: string;
}) {
  try {
    // Order Profiles endpoint - batch ordering
    const requestBody = {
      packageCode,
      transactionId,
      ...(travelerName && { travelerName }),
      ...(travelerEmail && { travelerEmail }),
    };
    
    console.log('[eSIM Access] Creating order with parameters:', {
      packageCode,
      transactionId,
      hasTravelerName: !!travelerName,
      hasTravelerEmail: !!travelerEmail,
      requestBody,
    });
    
    const response = await fetchEsimAccess("/esim/order/profiles", {
      method: "POST",
      body: JSON.stringify(requestBody),
    });
    
    console.log('[eSIM Access] Order creation response:', {
      hasOrderNo: !!(response.orderNo || response.order_no),
      hasEsimTranNo: !!(response.esimTranNo || response.esim_tran_no),
      hasIccid: !!(response.iccid || response.ICCID),
      responseKeys: Object.keys(response),
    });

    // Response structure: { orderNo, esimTranNo, iccid, ... }
    const orderNo = response.orderNo || response.order_no;
    const esimTranNo = response.esimTranNo || response.esim_tran_no;
    const iccid = response.iccid || response.ICCID;

    return {
      orderId: orderNo || esimTranNo || transactionId,
      orderNo,
      esimTranNo,
      iccid,
      transactionId,
      raw: response,
      travelerName,
      travelerEmail,
    };
  } catch (error) {
    console.error("[eSIM Access] Failed to create order:", error);
    
    // Extract error code and message from error for better debugging
    let errorCode: string | null = null;
    let errorMessage = error instanceof Error ? error.message : String(error);
    
    // Try to extract error code from error message (eSIM Access format: "errorCode: 200007" or "errorCode: '200007'")
    const errorCodeMatch = errorMessage.match(/errorCode[:\s]+['"]?(\d+)['"]?/i) || 
                          errorMessage.match(/(\d{6})/); // Match 6-digit error codes
    
    if (errorCodeMatch) {
      errorCode = errorCodeMatch[1];
    }
    
    // Also check if error has errorCode property
    if (error && typeof error === 'object' && 'errorCode' in error) {
      errorCode = String((error as any).errorCode);
    }
    
    // Create enhanced error with error code
    const enhancedError = new Error(errorMessage);
    (enhancedError as any).errorCode = errorCode;
    (enhancedError as any).originalError = error;
    
    throw enhancedError;
  }
}

/**
 * Query eSIM profiles/status
 */
export async function queryEsimProfiles(orderNo?: string, esimTranNo?: string) {
  if (!orderNo && !esimTranNo) return null;

  try {
    const response = await fetchEsimAccess("/esim/query", {
      method: "POST",
      body: JSON.stringify({
        orderNo: orderNo || undefined,
        esimTranNo: esimTranNo || undefined,
      }),
    });

    // Response contains profile details including activation code, QR code, etc.
    const profiles = Array.isArray(response?.profileList)
      ? response.profileList
      : Array.isArray(response)
      ? response
      : [response].filter(Boolean);

    if (profiles.length === 0) return null;

    const profile = profiles[0];
    return {
      orderNo: profile.orderNo || profile.order_no || orderNo,
      esimTranNo: profile.esimTranNo || profile.esim_tran_no || esimTranNo,
      iccid: profile.iccid || profile.ICCID,
      activationCode: profile.activationCode || profile.activation_code,
      qrCode: profile.qrCode || profile.qr_code || profile.qr,
      smdpAddress: profile.smdpAddress || profile.smdp_address,
      status: profile.status || profile.orderStatus,
      raw: profile,
    };
  } catch (error) {
    console.error("[eSIM Access] Failed to query profiles:", error);
    return null;
  }
}

/**
 * Get purchase details (alias for queryEsimProfiles)
 */
export async function getPurchaseDetails(
  orderNo?: string,
  esimTranNo?: string
) {
  return queryEsimProfiles(orderNo, esimTranNo);
}

/**
 * Get activation code from profile
 */
export function getActivationCodeFromProfile(profile: any): string | null {
  if (!profile) return null;
  return (
    profile.activationCode ||
    profile.activation_code ||
    profile.qrCode ||
    profile.qr_code ||
    profile.qr ||
    null
  );
}

/**
 * Get eSIM usage data
 */
export async function getEsimUsage(esimTranNo: string) {
  if (!esimTranNo) return null;

  try {
    const response = await fetchEsimAccess("/esim/usage/query", {
      method: "POST",
      body: JSON.stringify({
        esimTranNoList: [esimTranNo],
      }),
    });

    const usageList = Array.isArray(response?.esimUsageList)
      ? response.esimUsageList
      : [];

    const usage = usageList.find(
      (u: any) => u.esimTranNo === esimTranNo || u.esim_tran_no === esimTranNo
    );

    if (!usage) return null;

    return {
      esimTranNo: usage.esimTranNo || usage.esim_tran_no,
      dataUsage: usage.dataUsage || usage.data_usage || 0, // in bytes
      totalData: usage.totalData || usage.total_data || 0, // in bytes
      lastUpdateTime: usage.lastUpdateTime || usage.last_update_time,
    };
  } catch (error) {
    console.error("[eSIM Access] Failed to get usage:", error);
    return null;
  }
}

/**
 * Get account balance
 */
export async function getBalance() {
  try {
    const response = await fetchEsimAccess("/balance/query", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const balance =
      response.balance !== undefined
        ? response.balance
        : response?.data?.balance || 0;

    const currency =
      response.currency || response?.data?.currency || DEFAULT_CURRENCY;

    return {
      balance: typeof balance === "number" ? balance : parseFloat(balance) || 0,
      currency,
    };
  } catch (error) {
    console.error("[eSIM Access] Failed to get balance:", error);
    return { balance: 0, currency: DEFAULT_CURRENCY };
  }
}

/**
 * Parse provider price (eSIM Access uses price * 10,000)
 */
export function parseProviderPrice(price: number | string): number {
  if (typeof price === "number") {
    return price / 10000; // Convert from eSIM Access format
  }
  const parsed = parseFloat(price);
  return Number.isNaN(parsed) ? 0 : parsed / 10000;
}

/**
 * Convert dollar amount to provider price format
 */
export function convertToProviderPrice(priceInDollars: number): number {
  return Math.round(priceInDollars * 10000); // eSIM Access format
}

