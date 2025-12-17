import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if Supabase is configured
const isSupabaseConfigured = supabaseUrl && supabaseUrl.startsWith('http') && supabaseAnonKey;

// Create client with anon key (for client-side and RLS-protected operations)
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-key'
);

// Create service role client (for server-side operations that bypass RLS)
// Use this for webhooks and admin operations
export const supabaseAdmin = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured && supabaseServiceRoleKey 
    ? supabaseServiceRoleKey 
    : supabaseAnonKey // Fallback to anon key if service role not configured
);

// Helper to check if Supabase is properly configured
export const isSupabaseReady = () => isSupabaseConfigured;

// Helper to check if server-side (service role) access is configured
export const isSupabaseAdminReady = () =>
  Boolean(isSupabaseConfigured && supabaseServiceRoleKey);

// Database types
export interface Purchase {
  id: string;
  transaction_id: string;
  offer_id: string;
  customer_email: string;
  customer_name: string;
  status: 'PENDING' | 'PROCESSING' | 'DONE' | 'FAILED' | 'GOT_RESOURCE' | 'IN_USE';
  price_amount: number;
  price_currency: string;
  esim_provider_response?: any;
  esim_provider_status?: string;
  esim_provider_cost?: number;
  order_no?: string | null;
  user_id?: string;
  confirmation?: any;
  created_at: string;
  updated_at: string;
  // Legacy field for backward compatibility
  zendit_response?: any;
}

export interface ActivationDetails {
  id: string;
  transaction_id: string;
  qr_code_url?: string;
  smdp_address?: string;
  activation_code?: string;
  iccid?: string;
  confirmation_data?: any;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  email: string;
  clerk_user_id?: string;
  created_at: string;
  updated_at: string;
}
