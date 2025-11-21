/**
 * eSIMCard Reseller API Integration
 * Documentation: resellerApiDocs.json (OpenAPI)
 */

const BASE_URL =
  process.env.ESIMCARD_BASE_URL ||
  "https://portal.esimcard.com/api/developer/reseller";
const API_EMAIL = process.env.ESIMCARD_API_EMAIL;
const API_PASSWORD = process.env.ESIMCARD_API_PASSWORD;
const DEFAULT_COUNTRY_NAME =
  process.env.ESIMCARD_COUNTRY_NAME || "Saudi Arabia";
const DEFAULT_COUNTRY_CODE =
  process.env.ESIMCARD_COUNTRY_CODE || "SA";
const DEFAULT_CURRENCY = process.env.ESIMCARD_DEFAULT_CURRENCY || "USD";

let authCache: { token: string; expiresAt: number } | null = null;
let countriesCache: { data: any[]; fetchedAt: number } | null = null;
const AUTH_TTL = 50 * 60 * 1000; // 50 minutes
const COUNTRY_TTL = 60 * 60 * 1000; // 1 hour

function requireCredentials() {
  if (!API_EMAIL || !API_PASSWORD) {
    throw new Error(
      "ESIMCARD_API_EMAIL and ESIMCARD_API_PASSWORD must be set in environment variables"
    );
  }
}

async function login(): Promise<string> {
  requireCredentials();

  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: API_EMAIL,
      password: API_PASSWORD,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eSIMCard login failed: ${text}`);
  }

  const data = await res.json();
  if (!data?.access_token) {
    throw new Error("eSIMCard login response missing access_token");
  }

  authCache = {
    token: data.access_token,
    expiresAt: Date.now() + AUTH_TTL,
  };

  return data.access_token;
}

async function getToken(): Promise<string> {
  if (authCache && authCache.expiresAt > Date.now()) {
    return authCache.token;
  }
  return login();
}

async function fetchEsimCard(path: string, options: RequestInit = {}) {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  if (res.status === 401) {
    authCache = null;
    const retryToken = await getToken();
    const retryRes = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${retryToken}`,
        ...(options.headers || {}),
      },
    });
    if (!retryRes.ok) {
      const text = await retryRes.text();
      throw new Error(`eSIMCard API error ${retryRes.status}: ${text}`);
    }
    return retryRes.json();
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`eSIMCard API error ${res.status}: ${text}`);
  }

  return res.json();
}

async function getCountries(): Promise<any[]> {
  if (
    countriesCache &&
    Date.now() - countriesCache.fetchedAt < COUNTRY_TTL
  ) {
    return countriesCache.data;
  }

  const response = await fetchEsimCard("/packages/country");
  const data = Array.isArray(response?.data) ? response.data : [];
  countriesCache = { data, fetchedAt: Date.now() };
  return data;
}

async function resolveCountryIdByName(name: string): Promise<number | null> {
  const countries = await getCountries();
  const match = countries.find(
    (c: any) =>
      c?.name?.toLowerCase().trim() === name.toLowerCase().trim()
  );
  return match?.id ?? null;
}

function normalizePrice(price: string | number) {
  const amount =
    typeof price === "string" ? parseFloat(price) : Number(price || 0);
  if (Number.isNaN(amount)) {
    return { fixed: 0, divisor: 100 };
  }
  return { fixed: Math.round(amount * 100), divisor: 100 };
}

function mapPackage(pkg: any, countryCode: string) {
  const { fixed, divisor } = normalizePrice(pkg.price);
  const dataQuantity = pkg.data_unit?.toUpperCase() === "MB"
    ? pkg.data_quantity / 1024
    : pkg.data_quantity;

  return {
    offerId: pkg.id,
    packageCode: pkg.id,
    slug: pkg.id,
    shortNotes: pkg.name,
    notes: pkg.name,
    name: pkg.name,
    country: countryCode.toUpperCase(),
    location: countryCode.toUpperCase(),
    brandName: "eSIMCard",
    durationDays: pkg.package_validity,
    dataGB: dataQuantity,
    dataUnlimited: Boolean(pkg.unlimited),
    price: {
      fixed,
      currency: DEFAULT_CURRENCY,
      currencyDivisor: divisor,
    },
    enabled: true,
  };
}

export async function getEsimProducts(locationCode = DEFAULT_COUNTRY_CODE) {
  const countryName =
    process.env.ESIMCARD_COUNTRY_NAME ||
    (locationCode.toUpperCase() === "SA" ? "Saudi Arabia" : locationCode);
  const countryId = await resolveCountryIdByName(countryName);

  if (!countryId) {
    throw new Error(`Country not found in provider catalog: ${countryName}`);
  }

  const response = await fetchEsimCard(
    `/packages/country/${countryId}?package_type=DATA-ONLY`
  );
  const packages = Array.isArray(response?.data) ? response.data : [];

  return packages.map((pkg: any) => mapPackage(pkg, locationCode));
}

export async function getEsimPackage(packageId: string) {
  const response = await fetchEsimCard(`/package/details/${packageId}`);
  const data = response?.data;
  if (!data) return null;

  return mapPackage(data, DEFAULT_COUNTRY_CODE);
}

function generatePseudoImei(seed: string) {
  const digits = seed.replace(/\D/g, "").padEnd(14, "0").slice(0, 14);
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let num = parseInt(digits[i], 10);
    if (i % 2 === 0) {
      num *= 2;
      if (num > 9) num -= 9;
    }
    sum += num;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return `${digits}${checkDigit}`;
}

async function fetchSimDetails(simId: string) {
  if (!simId) return null;
  const response = await fetchEsimCard(`/my-esims/${simId}`);
  return response?.data || null;
}

function extractActivation(simDetails: any) {
  if (!simDetails) return null;
  const sim = simDetails.sim || simDetails;
  return {
    simId: sim.id,
    iccid: sim.iccid,
    smdpAddress: sim.smdp_address || null,
    activationCode: sim.activation_code || null,
    universalLink: sim.universal_link || null,
    qr: sim.universal_link || null,
    status: sim.status,
  };
}

export async function createEsimPurchase({
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
  const body = {
    imei: generatePseudoImei(transactionId),
    package_type_id: packageCode,
  };

  const response = await fetchEsimCard("/package/purchase", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const data = response?.data || {};
  const simId = data?.sim?.id || data?.sim_id || null;
  let simDetails = null;

  if (simId) {
    try {
      simDetails = await fetchSimDetails(simId);
    } catch (error) {
      console.error("[eSIMCard] Failed to fetch sim details:", error);
    }
  }

  return {
    orderId: data?.order_id ? String(data.order_id) : simId,
    simId,
    simApplied: Boolean(simDetails),
    activation: extractActivation(simDetails),
    raw: response,
    travelerName,
    travelerEmail,
  };
}

export async function queryEsimProfiles(simId?: string) {
  if (!simId) return null;
  const details = await fetchSimDetails(simId);
  return {
    sim: details?.sim || details,
    activation: extractActivation(details),
  };
}

export async function getPurchaseDetails(simId: string) {
  return queryEsimProfiles(simId);
}

export function getActivationCodeFromProfile(profile: any): string | null {
  if (!profile) return null;
  return (
    profile.activationCode ||
    profile.activation_code ||
    profile.universalLink ||
    profile.universal_link ||
    null
  );
}

export async function getEsimUsage(simId: string) {
  if (!simId) return null;
  const response = await fetchEsimCard(`/my-sim/${simId}/usage`);
  return response?.data || null;
}

export async function getBalance() {
  const response = await fetchEsimCard("/balance");
  if (!response) {
    return { balance: 0, currency: DEFAULT_CURRENCY };
  }

  const balanceValue =
    typeof response.balance !== "undefined"
      ? response.balance
      : response?.data?.balance;

  const currencyValue =
    response.currency ||
    response?.data?.currency ||
    DEFAULT_CURRENCY;

  return {
    balance: balanceValue ?? 0,
    currency: currencyValue,
  };
}

export function parseProviderPrice(price: number | string): number {
  if (typeof price === "number") return price;
  const parsed = parseFloat(price);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function convertToProviderPrice(priceInDollars: number): number {
  return Math.round(priceInDollars * 100);
}

