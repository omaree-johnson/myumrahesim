import { NextRequest, NextResponse } from "next/server";
import { auth } from '@clerk/nextjs/server';
import { supabase, isSupabaseReady } from "@/lib/supabase";
import { getEsimUsage } from "@/lib/esimaccess";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * GET /api/orders/[transactionId]/usage
 * Get usage data for a specific order
 * Requires authentication - user must own the order
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId } = await params;
    
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!isSupabaseReady()) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    // Get user email from Clerk
    const { data: customer } = await supabase
      .from('customers')
      .select('email, id')
      .eq('clerk_user_id', userId)
      .single();

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get purchase record - check both tables
    let purchase = null;
    
    // Try esim_purchases first
    const { data: esimPurchase } = await supabase
      .from('esim_purchases')
      .select('transaction_id, customer_email, esim_provider_response, order_no')
      .eq('transaction_id', transactionId)
      .single();

    if (esimPurchase) {
      // Verify ownership
      if (esimPurchase.customer_email !== customer.email) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }
      purchase = esimPurchase;
    } else {
      // Try legacy purchases table
      const { data: legacyPurchase } = await supabase
        .from('purchases')
        .select('transaction_id, customer_email, esim_provider_response, order_no')
        .eq('transaction_id', transactionId)
        .single();

      if (legacyPurchase) {
        // Verify ownership
        if (legacyPurchase.customer_email !== customer.email) {
          return NextResponse.json(
            { error: "Unauthorized" },
            { status: 403 }
          );
        }
        purchase = legacyPurchase;
      }
    }

    if (!purchase) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    // Extract esimTranNo from provider response
    const esimTranNo = purchase.esim_provider_response?.esimTranNo || 
                       purchase.esim_provider_response?.esim_tran_no ||
                       purchase.esim_provider_response?.obj?.esimTranNo;

    if (!esimTranNo) {
      return NextResponse.json(
        { error: "eSIM transaction number not found. Order may still be processing." },
        { status: 404 }
      );
    }

    // Fetch usage from eSIM Access API
    try {
      const usage = await getEsimUsage(esimTranNo);
      
      if (!usage) {
        return NextResponse.json(
          { error: "Usage data not available" },
          { status: 404 }
        );
      }

      const totalData = usage.totalData || 0; // in bytes
      const dataUsage = usage.dataUsage || 0; // in bytes
      const remaining = totalData - dataUsage;
      
      // Convert bytes to GB
      const totalGB = totalData / (1024 * 1024 * 1024);
      const usedGB = dataUsage / (1024 * 1024 * 1024);
      const remainingGB = remaining / (1024 * 1024 * 1024);
      
      // Calculate percentage
      const usagePercentage = totalData > 0 ? (dataUsage / totalData) * 100 : 0;

      return NextResponse.json({
        success: true,
        usage: {
          used: parseFloat(usedGB.toFixed(2)),
          total: parseFloat(totalGB.toFixed(2)),
          remaining: parseFloat(remainingGB.toFixed(2)),
          unit: 'GB',
          percentage: parseFloat(usagePercentage.toFixed(1)),
          lastUpdateTime: usage.lastUpdateTime,
        },
        esimTranNo,
      });
    } catch (usageError) {
      console.error('[Usage API] Failed to fetch usage:', usageError);
      return NextResponse.json(
        { error: "Failed to fetch usage data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Usage API] Error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

