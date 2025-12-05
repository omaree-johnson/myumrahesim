import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { getWalletBalance } from "@/lib/zendit";
import { supabaseAdmin as supabase, isSupabaseReady } from "@/lib/supabase";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/admin/reconcile-zendit
 * Admin endpoint to reconcile Zendit wallet balances and list failed top-ups
 * 
 * Requires admin authentication (check Clerk roles or use admin API key)
 */
export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const primaryEmail = user.emailAddresses?.find(
      (email) => email.id === user.primaryEmailAddressId
    )?.emailAddress?.toLowerCase();

    const configuredAdmins = (process.env.ADMIN_EMAIL || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    const hasAdminFlag =
      user.publicMetadata?.isAdmin === true ||
      user.publicMetadata?.role === "admin";
    const isConfiguredAdmin = primaryEmail
      ? configuredAdmins.includes(primaryEmail)
      : false;

    if (!hasAdminFlag && !isConfiguredAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { action } = await req.json();

    if (action === 'check_balance') {
      // NOTE: Wallet balance endpoint doesn't exist (returns 404)
      // This action will fail unless ENABLE_ZENDIT_WALLET_TOPUP=true
      // and Zendit adds wallet API support
      
      const enableWalletTopUp = process.env.ENABLE_ZENDIT_WALLET_TOPUP === "true";
      
      if (!enableWalletTopUp) {
        return NextResponse.json({
          success: false,
          error: "Wallet API not available. Zendit wallet endpoints return 404.",
          note: "Check wallet balance manually via Zendit dashboard",
          enableFlag: "Set ENABLE_ZENDIT_WALLET_TOPUP=true if Zendit adds wallet API"
        });
      }
      
      try {
        // Get current Zendit wallet balance
        const walletBalance = await getWalletBalance();
        
        return NextResponse.json({
          success: true,
          balance: walletBalance
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          error: "Failed to fetch wallet balance",
          details: error instanceof Error ? error.message : 'Unknown error',
          note: "Wallet API endpoints may not exist (404)"
        }, { status: 500 });
      }
    }

    if (action === 'list_failed_topups') {
      // List purchases with failed top-ups
      if (!isSupabaseReady()) {
        return NextResponse.json(
          { error: "Database not configured" },
          { status: 500 }
        );
      }

      const { data: failedPurchases, error } = await supabase
        .from('esim_purchases')
        .select('*')
        .eq('zendit_status', 'topup_failed')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[Admin] Database error:', error);
        return NextResponse.json(
          { error: "Database error" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        failedTopUps: failedPurchases || [],
        count: failedPurchases?.length || 0
      });
    }

    if (action === 'list_failed_purchases') {
      // List purchases with failed eSIM purchases
      if (!isSupabaseReady()) {
        return NextResponse.json(
          { error: "Database not configured" },
          { status: 500 }
        );
      }

      const { data: failedPurchases, error } = await supabase
        .from('esim_purchases')
        .select('*')
        .eq('zendit_status', 'purchase_failed')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('[Admin] Database error:', error);
        return NextResponse.json(
          { error: "Database error" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        failedPurchases: failedPurchases || [],
        count: failedPurchases?.length || 0
      });
    }

    if (action === 'reconcile') {
      // Full reconciliation: check balance, list failures, calculate totals
      if (!isSupabaseReady()) {
        return NextResponse.json(
          { error: "Database not configured" },
          { status: 500 }
        );
      }

      // Get wallet balance
      const walletBalance = await getWalletBalance();

      // Get statistics from database
      const { data: allPurchases, error: dbError } = await supabase
        .from('esim_purchases')
        .select('price, zendit_cost, currency, zendit_status, stripe_payment_status')
        .order('created_at', { ascending: false });

      if (dbError) {
        console.error('[Admin] Database error:', dbError);
        return NextResponse.json(
          { error: "Database error" },
          { status: 500 }
        );
      }

      // Calculate statistics
      const stats = {
        totalPurchases: allPurchases?.length || 0,
        totalRevenue: 0,
        totalZenditCost: 0,
        totalProfit: 0,
        successfulPurchases: 0,
        failedTopUps: 0,
        failedPurchases: 0,
        pendingPurchases: 0,
      };

      allPurchases?.forEach((purchase: any) => {
        stats.totalRevenue += purchase.price || 0;
        stats.totalZenditCost += purchase.zendit_cost || 0;
        
        if (purchase.zendit_status === 'DONE' || purchase.zendit_status === 'done') {
          stats.successfulPurchases++;
        } else if (purchase.zendit_status === 'topup_failed') {
          stats.failedTopUps++;
        } else if (purchase.zendit_status === 'purchase_failed') {
          stats.failedPurchases++;
        } else {
          stats.pendingPurchases++;
        }
      });

      stats.totalProfit = stats.totalRevenue - stats.totalZenditCost;

      return NextResponse.json({
        success: true,
        walletBalance,
        statistics: stats,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: "Invalid action. Use: check_balance, list_failed_topups, list_failed_purchases, or reconcile" },
      { status: 400 }
    );

  } catch (error) {
    console.error("[Admin] Error in reconcile endpoint:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

