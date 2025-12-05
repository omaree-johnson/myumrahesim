import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
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

  // Get purchases for this customer from BOTH tables
  // esim_purchases is used by Stripe webhook, purchases is legacy table
  // This ensures we show all orders made with this email, even before they signed in
  
  // Query esim_purchases table (primary table used by Stripe webhook)
  let esimQuery = supabase
    .from('esim_purchases')
    .select(`
      *,
      activation_details (
        smdp_address,
        activation_code,
        iccid
      )
    `);

  // Query by email (esim_purchases uses customer_email)
  if (userEmail) {
    esimQuery = esimQuery.eq('customer_email', userEmail);
  }

  const { data: esimPurchases, error: esimError } = await esimQuery.order('created_at', { ascending: false });

  // Query purchases table (legacy table for backward compatibility)
  let legacyQuery = supabase
    .from('purchases')
    .select(`
      *,
      activation_details (
        smdp_address,
        activation_code,
        iccid
      )
    `);

  // If customer exists, search by both email and user_id, otherwise just email
  if (customer?.id) {
    legacyQuery = legacyQuery.or(`customer_email.eq.${userEmail},user_id.eq.${customer.id}`);
  } else {
    legacyQuery = legacyQuery.eq('customer_email', userEmail);
  }

  const { data: legacyPurchases, error: legacyError } = await legacyQuery.order('created_at', { ascending: false });

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
      const rawStatus = p.esim_provider_status || p.zendit_status || 'PENDING';
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
        activation_details: p.activation_details,
        // Include raw data for compatibility
        esim_provider_status: p.esim_provider_status,
        esim_provider_response: p.esim_provider_response,
        confirmation: p.confirmation,
      });
    });
  }

  // Process legacy purchases
  if (legacyPurchases) {
    legacyPurchases.forEach((p: any) => {
      // Avoid duplicates (check if transaction_id already exists)
      if (!allPurchases.find(existing => existing.transaction_id === p.transaction_id)) {
        const rawStatus = p.status || p.esim_provider_status || 'PENDING';
        allPurchases.push({
          ...p,
          status: normalizeStatus(rawStatus),
        });
      }
    });
  }

  // Sort by created_at descending (most recent first)
  allPurchases.sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return dateB - dateA;
  });

  const purchases = allPurchases;
  const error = esimError || legacyError;

  // Update any purchases with this email to link to this user
  if (customer && purchases && purchases.length > 0) {
    // Update esim_purchases table
    const unlinkedEsimPurchases = purchases.filter((p: any) => {
      const esimPurchase = esimPurchases?.find((ep: any) => ep.transaction_id === p.transaction_id);
      return esimPurchase && !esimPurchase.user_id;
    });
    
    if (unlinkedEsimPurchases.length > 0) {
      await supabase
        .from('esim_purchases')
        .update({ user_id: customer.id })
        .eq('customer_email', userEmail)
        .is('user_id', null);
    }

    // Update legacy purchases table
    const unlinkedLegacyPurchases = purchases.filter((p: any) => {
      const legacyPurchase = legacyPurchases?.find((lp: any) => lp.transaction_id === p.transaction_id);
      return legacyPurchase && !legacyPurchase.user_id;
    });
    
    if (unlinkedLegacyPurchases.length > 0) {
      await supabase
        .from('purchases')
        .update({ user_id: customer.id })
        .eq('customer_email', userEmail)
        .is('user_id', null);
    }
  }

  if (error) {
    console.error('[Orders Page] Error:', error);
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
