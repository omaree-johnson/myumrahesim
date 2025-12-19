# Structured Data Testing Guide

This guide explains how to test and validate the structured data (JSON-LD) implemented on the My Umrah eSIM website.

---

## Overview

Structured data helps search engines understand your content and can enable rich results in search. This site implements multiple schema.org types:

- **Organization** - Company information
- **Website** - Site-wide information
- **Service** - eSIM service offering
- **Product** - Individual eSIM plans
- **FAQPage** - FAQ content
- **Article** - Blog posts
- **HowTo** - Activation instructions
- **BreadcrumbList** - Navigation breadcrumbs
- **Review** - Customer reviews

---

## Testing Tools

### 1. Google Rich Results Test

**URL:** https://search.google.com/test/rich-results

**How to Use:**
1. Navigate to the Rich Results Test tool
2. Enter a page URL (e.g., `https://myumrahesim.com/plans`)
3. Click "Test URL"
4. Review the results:
   - ✅ Green checkmarks = Valid structured data detected
   - ⚠️ Warnings = Valid but could be improved
   - ❌ Errors = Invalid structured data (must fix)

**What to Test:**
- Homepage (`/`) - Organization, Website, Service, Review schemas
- Plans page (`/plans`) - Product schemas
- FAQ page (`/faq`) - FAQPage schema
- Activation page (`/activation`) - HowTo schema
- Blog posts (`/blog/*`) - Article schemas

**Expected Results:**
- All pages should show valid structured data
- No critical errors
- Warnings are acceptable if they don't affect functionality

---

### 2. Schema.org Validator

**URL:** https://validator.schema.org/

**How to Use:**
1. Navigate to the Schema.org Validator
2. Enter a page URL or paste JSON-LD code
3. Click "Run Test"
4. Review validation results

**What to Check:**
- All required properties are present
- Data types are correct (strings, numbers, URLs, etc.)
- No deprecated properties
- Relationships between entities are valid

---

### 3. Google Search Console

**URL:** https://search.google.com/search-console

**How to Use:**
1. Ensure your site is verified in Search Console
2. Navigate to "Enhancements" → "Structured Data"
3. Review detected structured data types
4. Check for errors or warnings

**What to Monitor:**
- Number of pages with structured data
- Types of structured data detected
- Any errors or warnings
- Rich result eligibility

---

## Testing Checklist

### Homepage (`/`)

- [ ] Organization schema detected
- [ ] Website schema detected
- [ ] Service schema detected
- [ ] Review schemas detected (if reviews are displayed)
- [ ] All required properties present
- [ ] URLs are absolute (not relative)
- [ ] Images are accessible

**Test URL:** `https://myumrahesim.com/`

---

### Plans Page (`/plans`)

- [ ] Product schemas detected (one per plan)
- [ ] Product names are accurate
- [ ] Prices are correctly formatted
- [ ] Availability status is correct
- [ ] Images are present and accessible

**Test URL:** `https://myumrahesim.com/plans`

---

### FAQ Page (`/faq`)

- [ ] FAQPage schema detected
- [ ] QuestionAnswer schemas present (one per FAQ)
- [ ] Questions are properly formatted
- [ ] Answers are complete
- [ ] No duplicate questions

**Test URL:** `https://myumrahesim.com/faq`

---

### Activation Page (`/activation`)

- [ ] HowTo schema detected
- [ ] All steps are present
- [ ] Step order is correct
- [ ] Instructions are clear
- [ ] Estimated duration is reasonable

**Test URL:** `https://myumrahesim.com/activation`

---

### Blog Posts (`/blog/*`)

- [ ] Article schema detected
- [ ] Author information present
- [ ] Publication date is correct
- [ ] Images are present
- [ ] Article body is included (if using Article schema)

**Test URLs:**
- `https://myumrahesim.com/blog/best-esim-saudi-arabia`
- `https://myumrahesim.com/blog/how-to-install-esim-saudi-arabia`
- `https://myumrahesim.com/blog/esim-vs-physical-sim-umrah`

---

## Common Issues & Fixes

### Issue: "Missing required property"

**Fix:** Check that all required properties for the schema type are present. Refer to schema.org documentation for required fields.

**Example:** Product schema requires `name`, `offers`, and `image`.

---

### Issue: "Invalid URL format"

**Fix:** Ensure all URLs are absolute (include `https://` and full domain). Use `seoConfig.baseUrl` or `getCanonicalUrl()` helper.

**Example:**
```typescript
// ❌ Bad
url: "/plans"

// ✅ Good
url: getCanonicalUrl("/plans")
```

---

### Issue: "Image not accessible"

**Fix:** Verify image URLs are correct and images are publicly accessible. Check that images exist in the `public` directory.

**Example:**
```typescript
// ✅ Good
images: [{
  url: seoConfig.defaultOgImage, // '/kaaba-herop.jpg'
  width: 1200,
  height: 630,
}]
```

---

### Issue: "Invalid date format"

**Fix:** Use ISO 8601 format for dates: `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm:ssZ`.

**Example:**
```typescript
// ✅ Good
datePublished: "2025-12-17"
datePublished: "2025-12-17T10:00:00Z"
```

---

### Issue: "Missing @context or @type"

**Fix:** Ensure JSON-LD includes `@context` and `@type` properties. The `StructuredData` component handles this automatically.

**Example:**
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "..."
}
```

---

## Automated Testing

### Using Playwright (E2E Tests)

You can add structured data validation to your E2E tests:

```typescript
test('homepage has valid structured data', async ({ page }) => {
  await page.goto('/');
  
  // Extract JSON-LD scripts
  const jsonLdScripts = await page.$$eval(
    'script[type="application/ld+json"]',
    (scripts) => scripts.map(s => JSON.parse(s.textContent || '{}'))
  );
  
  // Verify Organization schema exists
  const orgSchema = jsonLdScripts.find(
    (schema) => schema['@type'] === 'Organization'
  );
  expect(orgSchema).toBeDefined();
  expect(orgSchema.name).toBeTruthy();
});
```

---

## Monitoring

### After Deployment

1. **Wait 24-48 hours** for Google to crawl updated pages
2. **Check Search Console** for structured data reports
3. **Monitor Rich Results** eligibility in Search Console
4. **Test periodically** using Rich Results Test tool

### Key Metrics

- **Pages with structured data:** Should match number of pages with structured data
- **Rich result eligibility:** Check which pages are eligible for rich results
- **Errors/Warnings:** Should be zero or minimal

---

## Resources

- **Schema.org Documentation:** https://schema.org/
- **Google Rich Results Test:** https://search.google.com/test/rich-results
- **Schema.org Validator:** https://validator.schema.org/
- **Google Search Console:** https://search.google.com/search-console
- **Structured Data Testing Tool:** https://search.google.com/test/rich-results

---

## Quick Test Script

Run this in your browser console on any page to extract structured data:

```javascript
// Extract all JSON-LD structured data
const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
const structuredData = scripts.map(s => JSON.parse(s.textContent));
console.log('Structured Data Found:', structuredData);
console.table(structuredData.map(d => ({ type: d['@type'], context: d['@context'] })));
```

---

## Notes

- Structured data is rendered server-side for SEO
- All schemas use the `StructuredData` component for consistency
- Canonical URLs use `getCanonicalUrl()` helper from `seoConfig`
- Images use `seoConfig.defaultOgImage` for consistency
- Test both development and production URLs (structured data should match)

---

**Last Updated:** December 17, 2025
