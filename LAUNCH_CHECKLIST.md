# eSIM PWA - Launch Checklist

Use this checklist to ensure your eSIM store is ready for launch.

## ✅ Pre-Launch Checklist

### 1. Environment Setup
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add valid `ZENDIT_API_KEY` to `.env.local`
- [ ] Set `NEXT_PUBLIC_BRAND_NAME`
- [ ] Set `NEXT_PUBLIC_BASE_URL` (for production)
- [ ] Configure optional branding variables

### 2. Zendit API Configuration
- [ ] Verify Zendit API base URL in `src/lib/zendit.ts`
- [ ] Confirm `/products` endpoint path
- [ ] Confirm `/orders` endpoint path
- [ ] Test API authentication
- [ ] Verify request payload structure
- [ ] Verify response structure
- [ ] Update parsing logic in pages if needed

### 3. Brand Assets
- [ ] Add `icon-192.png` to `public/icons/`
- [ ] Add `icon-512.png` to `public/icons/`
- [ ] Update `public/manifest.json` with brand name
- [ ] Update theme color in manifest
- [ ] Add favicon if desired
- [ ] Add custom logo (optional)

### 4. Testing - Development
- [ ] Run `npm run dev`
- [ ] Visit home page (http://localhost:3000)
- [ ] Verify products load (or see error message)
- [ ] Test checkout flow
- [ ] Test form validation
- [ ] Check responsive design on mobile
- [ ] Test in different browsers

### 5. Testing - Production Build
- [ ] Run `npm run build` successfully
- [ ] Run `npm run start`
- [ ] Test full user flow
- [ ] Verify PWA manifest loads
- [ ] Test "Add to Home Screen" on mobile
- [ ] Check service worker registration

### 6. API Integration Verification
- [ ] Test product listing API
- [ ] Test order creation API
- [ ] Verify error handling
- [ ] Check API response times
- [ ] Test with invalid API key (should fail gracefully)
- [ ] Verify email validation

### 7. Security Review
- [ ] `.env.local` is in `.gitignore`
- [ ] API keys never exposed to client
- [ ] All API calls go through server routes
- [ ] Form inputs are validated
- [ ] Email format is validated
- [ ] Consider adding rate limiting

### 8. UI/UX Review
- [ ] Test on mobile devices
- [ ] Test on tablets
- [ ] Test on desktop
- [ ] Check color contrast
- [ ] Verify loading states
- [ ] Verify error messages are user-friendly
- [ ] Check success page displays correctly

### 9. Deployment Preparation
- [ ] Choose hosting platform (Vercel recommended)
- [ ] Prepare environment variables for production
- [ ] Set up custom domain (optional)
- [ ] Configure DNS if using custom domain
- [ ] Plan for SSL certificate (usually automatic)

### 10. Production Deployment
- [ ] Push code to Git repository
- [ ] Connect to hosting platform
- [ ] Set production environment variables
- [ ] Deploy to production
- [ ] Verify production URL works
- [ ] Test full checkout flow on production
- [ ] Monitor for errors

### 11. Post-Launch
- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Set up analytics (Google Analytics, Plausible, etc.)
- [ ] Monitor API usage and costs
- [ ] Collect user feedback
- [ ] Plan for maintenance and updates

## 🔍 Common Issues

### Products Not Loading
- Check Zendit API key is valid
- Verify API endpoints are correct
- Check browser console for errors
- Verify network requests in DevTools

### PWA Not Installing
- PWA only works over HTTPS or localhost
- Check manifest.json is accessible
- Verify icons exist and are correct size
- Run production build (`npm run build && npm run start`)

### Build Errors
- Run `npm install` to ensure dependencies are installed
- Check for TypeScript errors: `npm run build`
- Verify all environment variables are set

### Styling Issues
- Clear browser cache
- Check Tailwind CSS is configured correctly
- Verify `globals.css` is imported in `layout.tsx`

## 📝 Notes

- Always test in production mode before deploying
- Keep your Zendit API key secure
- Monitor API usage to avoid unexpected costs
- Consider implementing caching for better performance
- Add analytics to track conversions

## 🚀 Ready to Launch?

Once all items are checked:
1. Run final production build
2. Deploy to your hosting platform
3. Test the live site
4. Monitor for any issues
5. Celebrate! 🎉

---

For support, see README.md and IMPLEMENTATION.md
