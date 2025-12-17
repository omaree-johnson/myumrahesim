# Google Ads Conversion Tracking Verification Guide

This guide explains how to verify that Google Ads conversion tracking is working correctly in your application.

## Quick Verification Methods

### 1. Browser Developer Tools (Easiest Method)

**Steps:**
1. Open your website in Chrome or Firefox
2. Open Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Network** tab
4. Filter by typing: `gtag` or `google-analytics`
5. Navigate to your success page with a test transaction: `/success?transactionId=TEST123`
6. Look for these network requests:

**Expected Requests:**
- `https://www.googletagmanager.com/gtag/js?id=AW-872734372` (should load on every page)
- `https://www.google-analytics.com/g/collect?...` (conversion event)

**What to Check:**
- The conversion request should include:
  - `en=conversion`
  - `send_to=AW-872734372%2Ff4FuCKmbiM0bEKS9k6AD` (URL encoded)
  - `transaction_id=TEST123` (or your actual transaction ID)

### 2. Browser Console Check

**Steps:**
1. Open Developer Tools → **Console** tab
2. Navigate to your success page with a transaction ID
3. You should see a log message:
   ```
   [Google Ads] Conversion event fired: { transaction_id: "TEST123" }
   ```

**To manually test in console:**
```javascript
// Check if gtag is loaded
console.log(typeof window.gtag); // Should output: "function"

// Manually fire a test conversion (for testing only)
window.gtag('event', 'conversion', {
  'send_to': 'AW-872734372/f4FuCKmbiM0bEKS9k6AD',
  'transaction_id': 'TEST_' + Date.now()
});
```

### 3. Google Tag Assistant (Recommended)

**Installation:**
1. Install [Google Tag Assistant Chrome Extension](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by-g/kejbdjndbnbjgmefkgdddjlbokphdefk)
2. Or use the newer [Tag Assistant Legacy](https://tagassistant.google.com/)

**Steps:**
1. Click the Tag Assistant icon in your browser
2. Click "Enable" to start recording
3. Navigate to your website
4. Complete a test purchase flow (or go directly to `/success?transactionId=TEST123`)
5. Click the Tag Assistant icon again
6. Review the tags detected:
   - ✅ Should see: **Google Ads (AW-872734372)**
   - ✅ Should see: **Conversion Event** with your conversion label

**What to Look For:**
- Green tags = Working correctly
- Yellow tags = Warnings (may still work)
- Red tags = Errors (needs fixing)

### 4. Google Ads Interface

**Check Conversion Status:**
1. Log into [Google Ads](https://ads.google.com)
2. Go to **Tools & Settings** (wrench icon) → **Measurement** → **Conversions**
3. Find your conversion action (should show conversion ID: `AW-872734372`)
4. Check the status:
   - Should show: **"Recording conversions"**
   - If it says "No recent conversions", wait 24-48 hours for data

**View Recent Conversions:**
1. In the Conversions page, click on your conversion action
2. Scroll down to see recent conversions
3. Note: Conversions may take 3-24 hours to appear in the interface

**Test Conversion Feature:**
1. In Google Ads, go to your conversion action
2. Look for a "Test conversions" or "Send test conversion" option
3. Enter a test transaction ID
4. This will help verify the connection is working

### 5. Real-Time Testing with Google Analytics DebugView

**If you have Google Analytics 4:**
1. Install [Google Analytics Debugger Chrome Extension](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna)
2. Enable it
3. Open GA4 DebugView
4. Navigate to your success page
5. You should see the conversion event appear in real-time

### 6. Network Request Details

**Detailed Request Inspection:**
1. Open DevTools → Network tab
2. Filter: `collect`
3. Click on a request to `google-analytics.com/g/collect`
4. Go to **Payload** or **Request** tab
5. Look for these parameters:

```
en=conversion
ep.send_to=AW-872734372/f4FuCKmbiM0bEKS9k6AD
ep.transaction_id=YOUR_TRANSACTION_ID
```

## Testing Checklist

- [ ] Google tag loads on homepage (check Network tab)
- [ ] Google tag loads on all pages
- [ ] Console shows `[Google Ads] Conversion event fired` on success page
- [ ] Network tab shows conversion request to `google-analytics.com/g/collect`
- [ ] Conversion request includes correct `send_to` parameter
- [ ] Conversion request includes `transaction_id` parameter
- [ ] Google Tag Assistant detects the tag (green status)
- [ ] Google Ads interface shows "Recording conversions" status

## Common Issues & Solutions

### Issue: No conversion events in Network tab
**Solution:**
- Check that `transactionId` is present in URL: `/success?transactionId=XXX`
- Verify the page has finished loading (check `loading` state)
- Check browser console for JavaScript errors

### Issue: Tag Assistant shows red/error
**Solution:**
- Verify the conversion ID is correct: `AW-872734372`
- Verify the conversion label is correct: `f4FuCKmbiM0bEKS9k6AD`
- Check that gtag.js script loaded successfully

### Issue: Conversions not showing in Google Ads
**Solution:**
- Wait 24-48 hours (there's a delay)
- Verify the conversion action is set to "Recording conversions"
- Check that you're using the correct conversion ID
- Ensure the conversion action is not paused

### Issue: Duplicate conversions
**Solution:**
- The `transaction_id` parameter should prevent duplicates
- Verify each transaction has a unique ID
- Check that `googleAdsConversionFired.current` is working (should only fire once)

## Manual Test URL

To test conversion tracking without making a real purchase:

```
https://yourdomain.com/success?transactionId=TEST_VERIFICATION_123
```

This will trigger the conversion event (though Google Ads may filter out test conversions).

## Production Verification

After deployment:
1. Make a real test purchase (or use a small amount)
2. Complete the purchase flow
3. Check Network tab on success page
4. Verify conversion event fires
5. Wait 24-48 hours and check Google Ads for the conversion

## Additional Resources

- [Google Ads Conversion Tracking Help](https://support.google.com/google-ads/answer/1722054)
- [Google Tag Assistant Help](https://support.google.com/tagassistant/answer/7559105)
- [Troubleshoot Conversion Tracking](https://support.google.com/google-ads/answer/6095821)

## Implementation Details

**Conversion ID:** `AW-872734372`
**Conversion Label:** `f4FuCKmbiM0bEKS9k6AD`
**Event Type:** Purchase conversion
**Transaction ID:** Dynamically set from `transactionId` query parameter or state

The conversion event fires on `/success` page when:
- `transactionId` is available
- Payment succeeded (not failed)
- Loading is complete
- No errors occurred
- Event hasn't fired before (prevents duplicates)





