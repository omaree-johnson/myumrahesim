import { NextRequest } from 'next/server';
import { POST } from '@/app/api/admin/precalculate-ramadan-periods/route';

jest.mock('@/lib/authorization', () => ({
  requireAdmin: jest.fn(),
}));

jest.mock('@/lib/ramadan-promo', () => ({
  precalculateRamadanPeriods: jest.fn(),
}));

const { requireAdmin } = jest.requireMock('@/lib/authorization') as {
  requireAdmin: jest.Mock;
};
const { precalculateRamadanPeriods } = jest.requireMock('@/lib/ramadan-promo') as {
  precalculateRamadanPeriods: jest.Mock;
};

describe('POST /api/admin/precalculate-ramadan-periods', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 401 when unauthenticated', async () => {
    requireAdmin.mockRejectedValueOnce(new Error('UNAUTHORIZED'));

    const req = new NextRequest('http://localhost:3000/api/admin/precalculate-ramadan-periods', {
      method: 'POST',
      body: JSON.stringify({ years: 2 }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({
      success: false,
      error: 'Authentication required',
    });
    expect(precalculateRamadanPeriods).not.toHaveBeenCalled();
  });

  it('returns 403 when not authorized as admin', async () => {
    requireAdmin.mockRejectedValueOnce(new Error('FORBIDDEN'));

    const req = new NextRequest('http://localhost:3000/api/admin/precalculate-ramadan-periods', {
      method: 'POST',
      body: JSON.stringify({ years: 2 }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({
      success: false,
      error: 'Admin access required',
    });
    expect(precalculateRamadanPeriods).not.toHaveBeenCalled();
  });

  it('returns 200 and unchanged payload when authorized', async () => {
    requireAdmin.mockResolvedValueOnce({ userId: 'user_1', email: 'admin@example.com' });
    precalculateRamadanPeriods.mockResolvedValueOnce({ success: 3, failed: 0 });

    const req = new NextRequest('http://localhost:3000/api/admin/precalculate-ramadan-periods', {
      method: 'POST',
      body: JSON.stringify({ years: 3 }),
      headers: { 'content-type': 'application/json' },
    });

    const response = await POST(req);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(precalculateRamadanPeriods).toHaveBeenCalledWith(3, undefined);
    expect(body).toEqual({
      success: true,
      calculated: 3,
      failed: 0,
      total: 3,
    });
  });
});
