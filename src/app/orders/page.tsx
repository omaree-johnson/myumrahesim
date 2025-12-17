import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabaseAdmin as supabase, isSupabaseAdminReady } from '@/lib/supabase';
import type { Metadata } from 'next';
import OrdersTable from '@/components/orders-table';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and manage your eSIM orders. Download activation codes and check order status.",
  robots: {
    index: false,
    follow: true,
  },
};

export default async function OrdersPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect('/sign-in');
  }

  if (!isSupabaseAdminReady()) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Orders database is not configured. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  const userEmail = user.emailAddresses[0]?.emailAddress;

  if (!userEmail) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">No email found for your account</p>
        </div>
      </div>
    );
  }

  // Get or create customer record
  const { data: customer } = await supabase
    .from('customers')
    .upsert({
      email: userEmail,
      clerk_user_id: userId,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'clerk_user_id'
    })
    .select('id')
    .single();

  // Get purchases for this customer from esim_purchases (Stripe + eSIM Access)
  // (Zendit/legacy purchases table intentionally not used anymore)
  let esimQuery = supabase
    .from('esim_purchases')
    .select('*');

  // Query by email (esim_purchases uses customer_email)
  if (userEmail) {
    esimQuery = esimQuery.eq('customer_email', userEmail);
  }

  const { data: esimPurchases, error: esimError } = await esimQuery.order('created_at', { ascending: false });

  // Get activation details separately (manual join since FK relationship doesn't exist)
  // activation_details uses transaction_id to link to both purchases and esim_purchases
  let activationDetailsMap: Record<string, any> = {};
  if (esimPurchases && esimPurchases.length > 0) {
    const transactionIds = esimPurchases.map(p => p.transaction_id).filter(Boolean);
    if (transactionIds.length > 0) {
      const { data: activationDetails } = await supabase
        .from('activation_details')
        .select('transaction_id, smdp_address, activation_code, iccid, qr_code, universal_link, confirmation_data')
        .in('transaction_id', transactionIds);
      
      if (activationDetails) {
        activationDetails.forEach(ad => {
          activationDetailsMap[ad.transaction_id] = ad;
        });
      }
    }
  }

  // Combine and normalize purchases from both tables
  const allPurchases: any[] = [];
  
  // Helper function to normalize status
  const normalizeStatus = (status: string | undefined | null): string => {
    if (!status) return 'PENDING';
    
    const statusUpper = status.toUpperCase();
    
    // Map eSIM Access statuses to display statuses
    if (statusUpper === 'GOT_RESOURCE' || statusUpper === 'IN_USE') return 'DONE';
    if (statusUpper === 'PROCESSING' || statusUpper === 'PENDING') return 'PROCESSING';
    if (statusUpper === 'FAILED' || statusUpper === 'CANCELLED' || statusUpper === 'REVOKED') return 'FAILED';
    if (statusUpper === 'DONE' || statusUpper === 'COMPLETED') return 'DONE';
    
    return statusUpper;
  };

  // Process esim_purchases (convert to common format)
  if (esimPurchases) {
    esimPurchases.forEach((p: any) => {
      const rawStatus = p.esim_provider_status || 'PENDING';
      const activationDetails = activationDetailsMap[p.transaction_id] || null;
      allPurchases.push({
        id: p.id,
        transaction_id: p.transaction_id,
        offer_id: p.offer_id,
        customer_email: p.customer_email,
        customer_name: p.customer_name,
        status: normalizeStatus(rawStatus),
        price_amount: p.price ? (p.price / 100) : 0, // Convert from cents
        price_currency: p.currency || 'USD',
        created_at: p.created_at,
        updated_at: p.updated_at,
        activation_details: activationDetails ? [activationDetails] : null, // Format as array to match expected structure
        // Include raw data for compatibility and usage queries
        esim_provider_status: p.esim_provider_status,
        esim_provider_response: p.esim_provider_response, // Contains esimTranNo for usage queries
        confirmation: p.confirmation,
      });
    });
  }

  // Sort by created_at descending (most recent first)
  allPurchases.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  const purchases = allPurchases;
  const error = esimError;

  // CRITICAL: Link all purchases with this email to this user account
  // This ensures that when a user signs up with the same email they used to purchase,
  // all their previous purchases are automatically linked to their account
  if (customer && userEmail) {
    // Update esim_purchases table - link all purchases with this email
    const { error: esimLinkError } = await supabase
      .from('esim_purchases')
      .update({ 
        user_id: customer.id,
        updated_at: new Date().toISOString()
      })
      .eq('customer_email', userEmail)
      .or(`user_id.is.null,user_id.eq.${customer.id}`); // Update null or existing user_id
    
    if (esimLinkError) {
      console.warn('[Orders Page] Error linking esim_purchases:', esimLinkError);
    } else {
      console.log('[Orders Page] ✅ Linked esim_purchases to user account');
    }
  }

  // Only log errors if they have meaningful content
  if (error && (error.message || error.code || Object.keys(error).length > 0)) {
    console.error('[Orders Page] Error fetching purchases:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      fullError: error
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Orders</h1>
        <p className="text-gray-600 dark:text-gray-400">View and manage your eSIM purchases</p>
      </div>

      {!purchases || purchases.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 dark:text-gray-300 mb-4">You haven't made any purchases yet</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600 text-white font-medium rounded-lg transition-colors"
          >
            Browse eSIM Plans
          </a>
        </div>
      ) : (
        <OrdersTable purchases={purchases} />
      )}
    </div>
  );
}
