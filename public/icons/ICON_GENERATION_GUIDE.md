# PWA Icon Generator

This folder should contain your PWA icons in various sizes for different devices and platforms.

## Required Icon Sizes

Generate these sizes from your logo/brand image:

### Android & Desktop PWA
- `icon-72.png` - 72x72px
- `icon-96.png` - 96x96px
- `icon-128.png` - 128x128px
- `icon-144.png` - 144x144px
- `icon-152.png` - 152x152px
- `icon-192.png` - 192x192px
- `icon-384.png` - 384x384px
- `icon-512.png` - 512x512px

### Maskable Icons (Android Adaptive Icons)
- `icon-maskable-192.png` - 192x192px (with safe zone)
- `icon-maskable-512.png` - 512x512px (with safe zone)

## Quick Generation Methods

### Option 1: Online Tools (Easiest)

1. **PWA Builder Image Generator**
   - Go to: https://www.pwabuilder.com/imageGenerator
   - Upload your logo (at least 512x512px, square)
   - Download all generated sizes
   - Move files to this folder

2. **RealFaviconGenerator**
   - Go to: https://realfavicongenerator.net/
   - Upload your logo
   - Select "Generate icons for iOS, Android, and Progressive Web Apps"
   - Download and extract to this folder

### Option 2: Using ImageMagick (Command Line)

If you have ImageMagick installed, run this from the project root:

```bash
cd public/icons

# Place your source logo as 'source-logo.png' (1024x1024 or larger)

# Generate standard icons
for size in 72 96 128 144 152 192 384 512; do
  magick convert source-logo.png -resize ${size}x${size} icon-${size}.png
done

# Generate maskable icons (with padding for safe zone)
magick convert source-logo.png -resize 512x512 -gravity center -extent 512x512 -background white icon-maskable-512.png
magick convert source-logo.png -resize 192x192 -gravity center -extent 192x192 -background white icon-maskable-192.png
```

### Option 3: Using Node.js Script

Create a file `generate-icons.js` in the project root:

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const sourceLogo = './public/icons/source-logo.png'; // Your source logo

async function generateIcons() {
  for (const size of sizes) {
    await sharp(sourceLogo)
      .resize(size, size)
      .toFile(`./public/icons/icon-${size}.png`);
    console.log(`Generated icon-${size}.png`);
  }

  // Generate maskable icons with safe zone (80% of canvas)
  await sharp(sourceLogo)
    .resize(410, 410) // 80% of 512
    .extend({
      top: 51,
      bottom: 51,
      left: 51,
      right: 51,
      background: { r: 14, g: 165, b: 233, alpha: 1 } // Sky blue
    })
    .toFile('./public/icons/icon-maskable-512.png');

  await sharp(sourceLogo)
    .resize(154, 154) // 80% of 192
    .extend({
      top: 19,
      bottom: 19,
      left: 19,
      right: 19,
      background: { r: 14, g: 165, b: 233, alpha: 1 }
    })
    .toFile('./public/icons/icon-maskable-192.png');

  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);
```

Then run:
```bash
npm install sharp
node generate-icons.js
```

## Design Guidelines

### Standard Icons
- Use a square logo (1:1 aspect ratio)
- Minimum source size: 1024x1024px
- Transparent or colored background
- Center your logo/icon

### Maskable Icons
- Important content should be in the center 80% of the canvas
- Outer 20% may be cropped on some devices
- Use solid background color (matching your brand)
- Test at https://maskable.app/

## Testing Your Icons

1. **In Browser DevTools:**
   - Open DevTools → Application → Manifest
   - Check all icons are loaded correctly

2. **Lighthouse PWA Audit:**
   - Open DevTools → Lighthouse
   - Run PWA audit
   - Check icon-related issues

3. **Maskable Icon Tester:**
   - Visit https://maskable.app/
   - Upload your maskable icons
   - Preview how they look on different devices

## Temporary Placeholder

If you don't have icons yet, you can use a colored square as a placeholder:

```bash
# Create a simple blue square placeholder
magick convert -size 512x512 xc:#0ea5e9 -gravity center -pointsize 200 -fill white -annotate +0+0 "U" icon-512.png
magick convert icon-512.png -resize 192x192 icon-192.png
```

Replace these with your actual brand icons as soon as possible!

## Checklist

- [ ] Created all required standard icons (72-512px)
- [ ] Created maskable icons (192px, 512px)
- [ ] Tested icons in browser DevTools
- [ ] Ran Lighthouse PWA audit
- [ ] Verified maskable icons at maskable.app
- [ ] Icons match brand colors and design
- [ ] Tested on actual mobile device
