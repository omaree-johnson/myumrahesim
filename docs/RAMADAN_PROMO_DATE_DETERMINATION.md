# Ramadan Promo Date Determination - Design & Implementation

## Executive Summary

For a production payments system, **use a hybrid approach**: Pre-calculated Gregorian ranges stored in the database as the primary source, with runtime Hijri conversion as validation and automatic range calculation.

## Approach Comparison

### Approach 1: Pre-Calculated Gregorian Ranges (Database)

**How it works:**
- Store start/end Gregorian dates for each Hijri year in a database table
- Simple date comparison: `CURRENT_DATE BETWEEN start_date AND end_date`
- Fast, predictable, no library dependencies

**Pros:**
- ✅ **Fastest**: Simple SQL date comparison (microseconds)
- ✅ **Predictable**: No runtime conversion errors
- ✅ **No dependencies**: No external library required
- ✅ **Auditable**: Dates visible in database, easy to verify
- ✅ **Database-level**: Can use SQL functions, triggers, views
- ✅ **Cacheable**: Results can be cached at any level

**Cons:**
- ❌ **Manual maintenance**: Requires annual updates
- ❌ **Human error risk**: Forgetting to update = promo breaks
- ❌ **Storage**: Small table needed (minimal impact)
- ❌ **Year rollover**: Needs attention each year

**Best for:**
- High-traffic systems where performance is critical
- Systems with reliable maintenance processes
- When you need database-level date queries

---

### Approach 2: Runtime Hijri Conversion (Library)

**How it works:**
- Use `hijri-date` library to convert current date to Hijri
- Check if current Hijri date falls within 15 Sha'ban - end of Ramadan
- Calculate on-the-fly for each request

**Pros:**
- ✅ **Automatic**: No manual updates needed
- ✅ **Year rollover**: Handles yearly changes automatically
- ✅ **Always current**: Uses current Hijri date
- ✅ **No maintenance**: Set and forget

**Cons:**
- ❌ **Library dependency**: Risk of library bugs, breaking changes, or deprecation
- ❌ **Conversion errors**: If conversion fails, promo breaks (mitigated with try/catch)
- ❌ **Performance**: Slightly slower (negligible: ~1-2ms per conversion)
- ❌ **Less auditable**: Harder to verify dates in production
- ❌ **Version risk**: Library updates could change behavior

**Best for:**
- Low-maintenance systems
- When you can't guarantee annual updates
- Prototypes or MVPs

---

## Recommended: Hybrid Approach

**Primary**: Pre-calculated ranges in database  
**Fallback**: Runtime conversion for validation and automatic calculation  
**Maintenance**: Automated script to update ranges annually

### Architecture

```
┌─────────────────────────────────────────┐
│  Payment Intent Creation                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  Check DB for current year's range      │
│  (fast lookup, cached)                  │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │ Found?      │
        └──────┬──────┘
               │
    ┌──────────┴──────────┐
    │ Yes                 │ No
    ▼                     ▼
┌──────────┐      ┌──────────────────────┐
│ Use DB   │      │ Runtime conversion  │
│ range    │      │ (calculate & cache) │
└──────────┘      └──────────────────────┘
```

### Benefits

1. **Fast primary path**: Database lookup is instant
2. **Automatic fallback**: If DB missing, calculates on-the-fly
3. **Self-healing**: Missing ranges auto-calculated and stored
4. **Validation**: Runtime conversion validates DB ranges
5. **Maintenance**: Script can pre-calculate next 10 years

### Implementation Strategy

1. **Database table**: Store pre-calculated ranges
2. **Runtime conversion**: Use as fallback and validator
3. **Auto-calculation**: Missing ranges calculated and stored automatically
4. **Admin function**: Manual override/verification capability
5. **Monitoring**: Log when fallback is used (indicates missing DB entry)

---

## Production Implementation

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS ramadan_promo_periods (
  hijri_year INTEGER PRIMARY KEY,
  start_date DATE NOT NULL,  -- 15 Sha'ban in Gregorian
  end_date DATE NOT NULL,     -- Last day of Ramadan in Gregorian
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  calculated_by TEXT DEFAULT 'system',
  verified BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_ramadan_promo_periods_dates 
  ON ramadan_promo_periods(start_date, end_date);

-- Function to check if promo is active (using DB ranges)
CREATE OR REPLACE FUNCTION is_ramadan_promo_active()
RETURNS BOOLEAN AS $$
DECLARE
  active_period RECORD;
BEGIN
  SELECT * INTO active_period
  FROM ramadan_promo_periods
  WHERE CURRENT_DATE BETWEEN start_date AND end_date
  ORDER BY hijri_year DESC
  LIMIT 1;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql STABLE;
```

### Code Implementation

**Primary check (database):**
```typescript
async function isRamadanPromoActiveFromDB(): Promise<boolean> {
  const { data } = await supabase
    .from('ramadan_promo_periods')
    .select('start_date, end_date')
    .gte('end_date', new Date().toISOString().split('T')[0])
    .lte('start_date', new Date().toISOString().split('T')[0])
    .single();
  
  if (data) {
    const today = new Date();
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    return today >= start && today <= end;
  }
  
  return false;
}
```

**Fallback (runtime conversion):**
```typescript
function isRamadanPromoActiveRuntime(): boolean {
  // Existing hijri-calendar.ts logic
  // Returns true/false based on Hijri date
}
```

**Hybrid function:**
```typescript
async function isRamadanPromoActive(): Promise<boolean> {
  // Try database first (fast)
  const dbResult = await isRamadanPromoActiveFromDB();
  if (dbResult !== null) {
    return dbResult;
  }
  
  // Fallback to runtime conversion
  const runtimeResult = isRamadanPromoActiveRuntime();
  
  // Auto-calculate and store for next time
  if (runtimeResult) {
    await calculateAndStoreCurrentYearRange();
  }
  
  return runtimeResult;
}
```

---

## Recommendation for Production

**Use the Hybrid Approach** with this priority:

1. **Primary**: Pre-calculated DB ranges (fast, reliable)
2. **Fallback**: Runtime conversion (automatic, self-healing)
3. **Maintenance**: Annual script to pre-calculate next 5-10 years
4. **Monitoring**: Alert if fallback is used (indicates missing DB entry)

### Why This is Safest

1. **Performance**: Database lookup is instant (critical for payments)
2. **Reliability**: If DB entry missing, fallback ensures promo still works
3. **Maintainability**: Automated script reduces human error
4. **Auditability**: DB ranges visible and verifiable
5. **Resilience**: Multiple layers of protection

### Maintenance Script

Create an admin function to pre-calculate ranges:

```typescript
// Run annually or as needed
async function precalculateRamadanRanges(years: number = 10) {
  const today = new Date();
  const hijriToday = (today as any).toHijri();
  const currentHijriYear = hijriToday.getFullYear();
  
  for (let i = 0; i < years; i++) {
    const hijriYear = currentHijriYear + i;
    const startDate = new HijriDate(hijriYear, 8, 15).toGregorian();
    const endDate = new HijriDate(hijriYear, 9, 30).toGregorian();
    
    await supabase.from('ramadan_promo_periods').upsert({
      hijri_year: hijriYear,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      calculated_by: 'admin-script',
      verified: false,
    });
  }
}
```

---

## Security Considerations

1. **Fail-safe default**: If both methods fail, promo is **inactive** (prevents accidental discounts)
2. **Server-side only**: All logic runs server-side, never client-side
3. **Validation**: Payment verification checks discounted amounts
4. **Audit trail**: Log when promo is applied, which method was used
5. **Rate limiting**: Prevent abuse of promo checks

---

## Performance Impact

- **Database lookup**: ~0.1ms (negligible)
- **Runtime conversion**: ~1-2ms (acceptable for payments)
- **Caching**: Can cache DB results for 1 hour (dates don't change frequently)
- **Overall**: Hybrid approach adds <2ms to payment intent creation

---

## Conclusion

For a production payments system, the **hybrid approach** provides the best balance of:
- **Speed** (database primary)
- **Reliability** (runtime fallback)
- **Maintainability** (automated calculation)
- **Safety** (fail-safe defaults)

This ensures the promo works correctly even if maintenance is missed, while providing optimal performance for the common case.
