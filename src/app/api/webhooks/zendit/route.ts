import { NextRequest, NextResponse } from 'next/server';

// Handle webhook verification (HEAD request - used by Zendit to verify endpoint)
export async function HEAD() {
  return new Response(null, { status: 410 });
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 410,
    headers: {
      'Allow': 'GET, POST, HEAD, OPTIONS',
      'Content-Length': '0',
    }
  });
}

// Handle webhook verification (GET request)
export async function GET() {
  return NextResponse.json(
    { status: 'gone', message: 'Zendit is no longer used. This webhook is deprecated.' },
    { status: 410 },
  );
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { status: 'gone', message: 'Zendit is no longer used. This webhook is deprecated.' },
    { status: 410 },
  );
}
