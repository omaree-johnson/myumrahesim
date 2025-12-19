# SEO Audit & Optimization Report
**Date:** December 17, 2025  
**Project:** My Umrah eSIM  
**Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS

---

## Executive Summary

This audit evaluates the SEO health of the My Umrah eSIM website and provides a prioritized action plan to improve rankings for target keywords:
- "umrah esim"
- "hajj esim"
- "saudi arabia esim"
- "mecca esim" / "medina esim"
- "best esim for umrah"

**Overall SEO Score: 7.5/10**

**Strengths:**
- ✅ Good metadata structure with Next.js metadata API
- ✅ Structured data (JSON-LD) implemented
- ✅ Sitemap and robots.txt configured
- ✅ Mobile-responsive design
- ✅ Fast page load times (static generation)

**Areas for Improvement:**
- ⚠️ H1 structure needs refinement on some pages
- ⚠️ Missing blog posts for key topics (Nusuk app guide)
- ⚠️ Internal linking could be more strategic
- ⚠️ Some pages lack breadcrumb navigation
- ⚠️ Product schema not applied to individual plans
- ⚠️ Activation page needs better SEO structure

---

## Page-by-Page Audit

### 1. Homepage (`/`)
**Status:** ✅ Good, minor improvements needed

**Current State:**
- ✅ Title: "Best eSIM for Umrah & Hajj | Instant Activation"
- ✅ Meta description includes pricing
- ✅ OpenGraph and Twitter cards configured
- ✅ Canonical URL set
- ✅ Multiple structured data types (Organization, Article, QAPage)
- ✅ H1 present: "Stay Connected to Your Loved Ones During Umrah – From the Moment You Land in Makkah"

**Issues:**
- ⚠️ H1 is very long (could be more keyword-focused)
- ⚠️ Missing internal links to key pages in hero section
- ⚠️ No breadcrumb (not needed for homepage, but good to note)

**Recommendations:**
1. Consider shorter, more keyword-focused H1: "Best eSIM for Umrah & Hajj | Instant Activation in Saudi Arabia"
2. Add prominent internal links to `/plans`, `/faq`, and top blog posts
3. Add "Related Articles" section linking to guides

**Priority:** Medium

---

### 2. Plans Page (`/plans`)
**Status:** ✅ Good, enhancements needed

**Current State:**
- ✅ Title: "eSIM Plans for Umrah & Hajj | Saudi Arabia"
- ✅ Meta description includes pricing
- ✅ OpenGraph configured
- ✅ Canonical URL set
- ✅ Static generation with revalidation

**Issues:**
- ⚠️ No H1 visible in server component (likely in client component)
- ⚠️ Missing Product schema for individual plans
- ⚠️ No breadcrumb navigation
- ⚠️ Limited internal linking to activation guide

**Recommendations:**
1. Add explicit H1: "eSIM Plans for Umrah & Hajj in Saudi Arabia"
2. Add Product schema for each plan card
3. Add breadcrumb: Home → Plans
4. Add links to activation guide and FAQ

**Priority:** High

---

### 3. FAQ Page (`/faq`)
**Status:** ✅ Good

**Current State:**
- ✅ Title: "FAQ - eSIM for Umrah & Hajj | Answers"
- ✅ Meta description optimized
- ✅ FAQPage schema likely implemented (check client component)
- ✅ Canonical URL set

**Issues:**
- ⚠️ Need to verify H1 structure in client component
- ⚠️ Missing breadcrumb
- ⚠️ Could add more internal links to relevant guides

**Recommendations:**
1. Ensure H1: "Frequently Asked Questions About eSIM for Umrah & Hajj"
2. Add breadcrumb: Home → FAQ
3. Link to activation guide and troubleshooting posts

**Priority:** Medium

---

### 4. Activation Page (`/activation`)
**Status:** ⚠️ Needs improvement

**Current State:**
- ⚠️ No metadata export (client component only)
- ⚠️ H1: "eSIM Activation Details" (too generic)
- ⚠️ No structured data
- ⚠️ No canonical URL
- ⚠️ Page is client-side only (not SEO-friendly)

**Issues:**
- ❌ Missing metadata (title, description, keywords)
- ❌ Generic H1 not optimized for keywords
- ❌ No HowTo schema for activation steps
- ❌ No breadcrumb
- ❌ Client-side rendering only (content not in initial HTML)

**Recommendations:**
1. Add metadata export with proper title/description
2. Improve H1: "How to Activate Your eSIM for Umrah in Saudi Arabia"
3. Add HowTo structured data for activation steps
4. Add breadcrumb: Home → Orders → Activation
5. Consider server-side rendering for initial content

**Priority:** High

---

### 5. Blog Posts

#### Existing Posts:
- ✅ `/ultimate-guide-esim-umrah` - Good structure
- ✅ `/ultimate-guide-esim-hajj` - Exists
- ✅ `/ultimate-guide-esim-saudi-arabia` - Exists
- ✅ Multiple other blog posts

#### Missing Posts:
- ❌ `/blog/hajj-umrah-esim-guide` - Combined guide (create)
- ❌ `/blog/nusuk-app-esim-guide` - Nusuk app + eSIM (create)

**Recommendations:**
1. Create combined Hajj/Umrah guide
2. Create Nusuk app guide
3. Ensure all posts have:
   - Article schema
   - Breadcrumbs
   - Internal links to `/plans` and `/activation`
   - Related articles section

**Priority:** High

---

### 6. Learn More / About Us (`/learn-more`)
**Status:** ⚠️ Needs review

**Issues:**
- ⚠️ Need to verify metadata and H1 structure
- ⚠️ Should link to key pages

**Priority:** Low

---

## Technical SEO Issues

### 1. Semantic HTML
**Status:** ✅ Mostly good, minor improvements

- ✅ Using semantic tags in most places
- ⚠️ Some sections could use `<section>` tags more consistently
- ⚠️ Ensure all pages have `<main>` tag (checking)

**Priority:** Low

---

### 2. Internal Linking
**Status:** ⚠️ Needs improvement

**Current State:**
- ✅ Footer has good links
- ✅ Navbar has main pages
- ⚠️ Homepage could link to more content
- ⚠️ Blog posts need more contextual links
- ⚠️ Plans page should link to activation guide

**Recommendations:**
1. Add "Related Guides" section to homepage
2. Add contextual links in blog post content
3. Cross-link between related blog posts
4. Add "Learn More" links from plans to guides

**Priority:** Medium

---

### 3. Structured Data (JSON-LD)
**Status:** ✅ Good foundation, enhancements needed

**Current:**
- ✅ Organization schema
- ✅ Website schema
- ✅ Article schema (on homepage)
- ✅ QAPage schema (on homepage)
- ✅ FAQPage schema (likely on FAQ page)
- ✅ HowTo schema (in layout)

**Missing:**
- ❌ Product schema for individual plans
- ❌ BreadcrumbList schema on all pages (only some)
- ❌ Article schema on all blog posts

**Priority:** High

---

### 4. Performance
**Status:** ✅ Good

- ✅ Using Next.js Image component
- ✅ Static generation where possible
- ✅ Caching implemented
- ✅ Font optimization (next/font)

**Priority:** Low (already optimized)

---

## Prioritized Action Plan

### Phase 1: Critical (Do First)
1. ✅ Add metadata to activation page
2. ✅ Add Product schema to plans page
3. ✅ Create Nusuk app guide blog post
4. ✅ Create combined Hajj/Umrah guide
5. ✅ Add breadcrumbs to all key pages

### Phase 2: High Priority
6. ✅ Improve H1 structure on key pages
7. ✅ Enhance internal linking strategy
8. ✅ Add Article schema to all blog posts
9. ✅ Add breadcrumb structured data everywhere

### Phase 3: Medium Priority
10. ✅ Refine homepage H1 (shorter, more keyword-focused)
11. ✅ Add "Related Articles" sections
12. ✅ Improve activation page SEO structure

### Phase 4: Low Priority (Nice to Have)
13. Review and optimize learn-more page
14. Add more semantic HTML tags
15. A/B test different H1 variations

---

## Keyword Targeting Strategy

### Primary Keywords (Target #1)
- "umrah esim" - Homepage, Ultimate Guide
- "hajj esim" - Ultimate Guide, Blog Post
- "saudi arabia esim" - Plans Page, Ultimate Guide

### Secondary Keywords (Target top 3)
- "best esim for umrah" - Homepage, Comparison
- "mecca esim" / "medina esim" - Plans Page, Coverage sections
- "instant esim saudi arabia" - Homepage, Activation page

### Long-tail Keywords (Target top 5)
- "how to get esim for umrah" - Activation guide, FAQ
- "nusuk app esim" - New blog post
- "esim activation saudi arabia" - Activation page
- "best esim plans for umrah" - Plans page
- "esim coverage makkah madinah" - Coverage sections

---

## Content Gaps

### Missing Content:
1. **Nusuk App Guide** - High priority for pilgrims
2. **Combined Hajj/Umrah Guide** - Consolidate information
3. **Coverage Map/Details** - Specific coverage in Makkah/Madinah
4. **Device Compatibility Deep Dive** - More detailed guide

### Content Enhancement Opportunities:
1. Add "Why Choose Us" section with trust signals
2. Add customer testimonials with Review schema
3. Add comparison table with competitors
4. Add video content (activation tutorial)

---

## Next Steps

1. **Immediate (This Week):**
   - Implement all Phase 1 items
   - Create missing blog posts
   - Add Product schema

2. **Short-term (This Month):**
   - Complete Phase 2 items
   - Monitor rankings for target keywords
   - Set up Google Search Console

3. **Long-term (Ongoing):**
   - Content creation (new blog posts monthly)
   - Link building strategy
   - Monitor and optimize based on data

---

## Success Metrics

Track these metrics to measure SEO success:
- Organic traffic growth (target: +50% in 3 months)
- Keyword rankings for target terms
- Click-through rate from search results
- Bounce rate (target: <60%)
- Time on page (target: >2 minutes)
- Conversion rate from organic traffic

---

## Notes

- All changes should maintain existing functionality
- Test thoroughly before deploying
- Monitor Core Web Vitals after changes
- Keep content original (no competitor copying)
