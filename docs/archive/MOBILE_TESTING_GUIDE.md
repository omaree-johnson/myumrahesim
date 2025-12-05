# Mobile Testing Quick Reference

## Test on Real Devices

### iOS Testing (Safari)
1. Open Safari on iPhone/iPad
2. Navigate to your site
3. Test touch interactions (tap, swipe, pinch-zoom)
4. Install PWA: Share → Add to Home Screen
5. Test installed app in standalone mode
6. Verify safe area padding on notched devices

### Android Testing (Chrome)
1. Open Chrome on Android device
2. Navigate to your site
3. Test native install prompt
4. Install PWA: Menu → Add to Home Screen
5. Test shortcuts from home screen
6. Verify adaptive icon displays correctly

## Chrome DevTools Mobile Testing

### Enable Device Toolbar
1. Open Chrome DevTools (F12 or Cmd+Opt+I)
2. Click device icon or press Cmd+Shift+M (Mac) / Ctrl+Shift+M (Windows)
3. Select device preset or custom dimensions

### Recommended Test Devices
- iPhone 14 Pro Max (430 × 932)
- iPhone SE (375 × 667)
- Samsung Galaxy S21 (360 × 800)
- iPad Pro (1024 × 1366)

### Test Scenarios

#### Navigation
- [ ] Hamburger menu opens smoothly
- [ ] All links are easily tappable
- [ ] Menu closes when clicking outside
- [ ] Swipe gestures work (if applicable)

#### Forms
- [ ] Inputs don't zoom on focus (16px minimum)
- [ ] Keyboard appears with correct type (email, tel, etc.)
- [ ] Submit buttons remain visible above keyboard
- [ ] Form validation appears clearly

#### Touch Targets
- [ ] All buttons are minimum 44×44px
- [ ] Links have sufficient padding
- [ ] Active states provide visual feedback
- [ ] No accidental taps on close elements

#### Layout
- [ ] Content fits within viewport
- [ ] No horizontal scrolling
- [ ] Images scale properly
- [ ] Text is readable without zooming

#### PWA Features
- [ ] Install prompt appears appropriately
- [ ] App installs successfully
- [ ] Icons appear correctly on home screen
- [ ] Offline page displays when disconnected
- [ ] Theme color matches app branding

## Lighthouse PWA Audit

### Run Lighthouse
1. Open Chrome DevTools
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Generate report"

### Target Scores
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+
- PWA: All checks passing

### Key PWA Checks
- ✅ Installable
- ✅ Fast and reliable
- ✅ Works offline
- ✅ Provides a custom offline page
- ✅ Has a valid manifest
- ✅ Has appropriate icons
- ✅ Uses HTTPS

## Common Issues & Fixes

### Issue: Inputs zoom on focus (iOS)
**Fix**: Ensure font-size is at least 16px
```css
input, textarea, select {
  font-size: 16px;
}
```

### Issue: Viewport too wide on mobile
**Fix**: Check viewport meta tag
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### Issue: Safe areas not working
**Fix**: Use env() with fallback
```css
padding: env(safe-area-inset-top, 20px);
```

### Issue: Touch targets too small
**Fix**: Increase minimum size
```css
button, a {
  min-height: 44px;
  min-width: 44px;
}
```

### Issue: PWA not installable
**Check**:
- HTTPS enabled (required)
- manifest.json is valid
- Service worker registered
- start_url is accessible
- Icons are correct sizes

## Quick Test Commands

### Test Responsive Breakpoints
```
Mobile: 375px - 767px
Tablet: 768px - 1023px
Desktop: 1024px+
```

### Test Touch Events in DevTools
```javascript
// Simulate touch
document.addEventListener('touchstart', (e) => {
  console.log('Touch detected', e.touches);
});
```

### Check PWA Manifest
```
Open: chrome://inspect/#service-workers
Check: Application → Manifest (in DevTools)
```

### Test Offline Mode
```
1. DevTools → Network tab
2. Change "Online" to "Offline"
3. Refresh page
4. Verify offline page displays
```

## Performance Testing

### Core Web Vitals
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Mobile-Specific Metrics
- **Time to Interactive**: < 3.8s on 4G
- **Speed Index**: < 3.4s on 4G
- **First Contentful Paint**: < 1.8s

## Accessibility Testing

### Screen Reader Test (VoiceOver iOS)
1. Settings → Accessibility → VoiceOver → On
2. Triple-click home button to toggle
3. Swipe to navigate elements
4. Double-tap to activate

### Keyboard Navigation
- Tab through all interactive elements
- Ensure focus indicators are visible
- Verify logical tab order
- Test Escape key on modals

## Browser-Specific Tests

### Safari (iOS)
- [ ] Add to Home Screen works
- [ ] Status bar appears correctly
- [ ] Safe areas respect notch
- [ ] Swipe gestures don't conflict
- [ ] 100vh displays correctly

### Chrome (Android)
- [ ] Install banner appears
- [ ] Maskable icons display
- [ ] Shortcuts work from home screen
- [ ] Theme color in task switcher
- [ ] Splash screen appears

### Samsung Internet
- [ ] PWA installs
- [ ] Dark mode works
- [ ] Biometric auth (if used)
- [ ] Edge panels compatible

## Emulator Testing

### iOS Simulator (Mac only)
```bash
# Install Xcode from App Store
# Open Simulator
open -a Simulator

# Navigate to your localhost
# Safari on simulator
```

### Android Emulator
```bash
# Install Android Studio
# Open AVD Manager
# Create virtual device
# Launch emulator
# Open Chrome
```

## Real Device Testing Services

### Free Options
- BrowserStack Free Trial
- LambdaTest Free Plan
- Sauce Labs Trial

### Chrome Remote Debugging
1. Connect Android device via USB
2. Enable USB debugging on device
3. Chrome → `chrome://inspect`
4. Click "inspect" on your device

## Checklist Summary

### Before Launch
- [ ] Test on iOS Safari (iPhone & iPad)
- [ ] Test on Android Chrome
- [ ] Test PWA installation on both platforms
- [ ] Run Lighthouse PWA audit (score 90+)
- [ ] Verify all touch targets are 44px+
- [ ] Test forms with mobile keyboard
- [ ] Check safe areas on notched devices
- [ ] Test offline functionality
- [ ] Verify icons display correctly
- [ ] Test pull-to-refresh (if implemented)
- [ ] Check landscape orientation
- [ ] Test dark mode
- [ ] Verify accessibility with screen reader
- [ ] Test on slow 3G connection
- [ ] Check Core Web Vitals

### Post-Launch Monitoring
- Monitor PWA install rate
- Track offline usage
- Monitor Core Web Vitals
- Check error rates by device
- Review user feedback
- A/B test mobile features
