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

  // Get purchases for this customer - match by email OR user_id
  // This ensures we show all orders made with this email, even before they signed in
  let query = supabase
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
    query = query.or(`customer_email.eq.${userEmail},user_id.eq.${customer.id}`);
  } else {
    query = query.eq('customer_email', userEmail);
  }

  const { data: purchases, error } = await query.order('created_at', { ascending: false });

  // Update any purchases with this email to link to this user
  if (customer && purchases && purchases.length > 0) {
    const unlinkedPurchases = purchases.filter((p: any) => !p.user_id);
    if (unlinkedPurchases.length > 0) {
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
