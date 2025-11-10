import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Metadata } from 'next';

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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600">No email found for your account</p>
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
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Orders</h1>

      {!purchases || purchases.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't made any purchases yet</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-medium rounded-lg transition-colors"
          >
            Browse eSIM Plans
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase: any) => (
            <div
              key={purchase.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    eSIM Plan - {purchase.offer_id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {new Date(purchase.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">
                    {purchase.price_currency} {purchase.price_amount.toFixed(2)}
                  </p>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                    purchase.status === 'DONE' ? 'bg-green-100 text-green-800' :
                    purchase.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-800' :
                    purchase.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {purchase.status}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Transaction ID:</span>{' '}
                  <span className="font-mono text-xs">{purchase.transaction_id}</span>
                </p>
                
                {purchase.activation_details && purchase.activation_details.iccid && (
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">ICCID:</span>{' '}
                    <span className="font-mono text-xs">{purchase.activation_details.iccid}</span>
                  </p>
                )}
              </div>

              <div className="mt-4">
                <a
                  href={`/activation?transactionId=${purchase.transaction_id}`}
                  className="inline-block px-4 py-2 text-sm font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-lg transition-colors"
                >
                  {purchase.status === 'DONE' ? 'View Activation Details' : 'Check Status'} →
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
