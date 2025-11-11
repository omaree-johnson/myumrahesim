# Clerk Setup Instructions

## 1. Create Clerk Application

1. Go to https://clerk.com
2. Create a new application
3. Choose your authentication providers (Email, Google, etc.)
4. Note your API keys

## 2. Add Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## 3. Configure Clerk Dashboard

### Webhook Setup
1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`
4. Copy signing secret to `CLERK_WEBHOOK_SECRET` in `.env.local`

### Session Settings
1. Go to Sessions in dashboard
2. Enable "Multi-session handling" if needed
3. Set session lifetime as desired

## 4. Authentication Flow

### Sign In/Sign Up
- Visit `/sign-in` or `/sign-up` for authentication
- Or use the modal mode with `<SignInButton mode="modal">`

### Protected Routes
Routes starting with:
- `/dashboard` - Protected
- `/account` - Protected
- `/orders` - Protected

### Get User in Server Components
```typescript
import { auth, currentUser } from '@clerk/nextjs/server';

export default async function Page() {
  const { userId } = await auth();
  const user = await currentUser();
  
  return <div>Hello {user?.firstName}</div>;
}
```

### Get User in Client Components
```typescript
'use client';
import { useUser } from '@clerk/nextjs';

export default function Component() {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded) return <div>Loading...</div>;
  
  return <div>Hello {user?.firstName}</div>;
}
```

### API Route Protection
```typescript
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Your logic here
}
```

## 5. User Metadata

Store additional data on user object:

```typescript
import { clerkClient } from '@clerk/nextjs/server';

await clerkClient().users.updateUserMetadata(userId, {
  publicMetadata: {
    totalPurchases: 5,
    lastPurchaseDate: new Date().toISOString()
  }
});
```

## Integration with Supabase

When a user signs in, sync to Supabase:

```typescript
// In webhook handler or after sign in
const { data: customer } = await supabase
  .from('customers')
  .upsert({
    email: user.emailAddresses[0].emailAddress,
    clerk_user_id: user.id
  })
  .select()
  .single();
```

## Testing Authentication

1. Start dev server: `pnpm dev`
2. Visit `http://localhost:3000`
3. Click "Sign In" in header
4. Create test account
5. Should see UserButton in header after sign in
6. Try accessing `/orders` - should work when signed in
