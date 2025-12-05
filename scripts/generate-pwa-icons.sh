#!/bin/bash

# PWA Icon Generator Script
# Generates all required PWA icons from a source image

echo "🎨 PWA Icon Generator for Umrah Esim"
echo "====================================="
echo ""

# Check if source image exists
SOURCE_IMAGE="public/icons/source-logo.png"

if [ ! -f "$SOURCE_IMAGE" ]; then
    echo "❌ Source image not found: $SOURCE_IMAGE"
    echo ""
    echo "Please add your logo as 'public/icons/source-logo.png'"
    echo "Recommended size: 1024x1024px or larger, square format"
    echo ""
    exit 1
fi

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick not found"
    echo ""
    echo "Please install ImageMagick:"
    echo "  macOS: brew install imagemagick"
    echo "  Linux: sudo apt-get install imagemagick"
    echo ""
    echo "Or use the online tool: https://www.pwabuilder.com/imageGenerator"
    exit 1
fi

# Use 'magick' command if available (ImageMagick 7), otherwise use 'convert' (ImageMagick 6)
if command -v magick &> /dev/null; then
    CONVERT_CMD="magick convert"
else
    CONVERT_CMD="convert"
fi

echo "✅ Source image found: $SOURCE_IMAGE"
echo "✅ ImageMagick installed"
echo ""
echo "Generating icons..."
echo ""

# Generate standard icons
SIZES=(72 96 128 144 152 192 384 512)

for size in "${SIZES[@]}"; do
    OUTPUT="public/icons/icon-${size}.png"
    $CONVERT_CMD "$SOURCE_IMAGE" -resize ${size}x${size} "$OUTPUT"
    
    if [ $? -eq 0 ]; then
        echo "✅ Generated icon-${size}.png"
    else
        echo "❌ Failed to generate icon-${size}.png"
    fi
done

echo ""
echo "Generating maskable icons..."
echo ""

# Generate maskable icons (with safe zone padding)
# Maskable icons need 20% padding around the edges

# 512px maskable (resize to 410px, then add 51px padding on each side)
$CONVERT_CMD "$SOURCE_IMAGE" -resize 410x410 -gravity center \
    -background "#0ea5e9" -extent 512x512 \
    "public/icons/icon-maskable-512.png"

if [ $? -eq 0 ]; then
    echo "✅ Generated icon-maskable-512.png"
else
    echo "❌ Failed to generate icon-maskable-512.png"
fi

# 192px maskable (resize to 154px, then add 19px padding on each side)
$CONVERT_CMD "$SOURCE_IMAGE" -resize 154x154 -gravity center \
    -background "#0ea5e9" -extent 192x192 \
    "public/icons/icon-maskable-192.png"

if [ $? -eq 0 ]; then
    echo "✅ Generated icon-maskable-192.png"
else
    echo "❌ Failed to generate icon-maskable-192.png"
fi

echo ""
echo "====================================="
echo "✨ Icon generation complete!"
echo ""
echo "Generated files:"
ls -lh public/icons/*.png | awk '{print "  " $9 " - " $5}'
echo ""
echo "Next steps:"
echo "  1. Review the generated icons"
echo "  2. Test maskable icons at https://maskable.app/"
echo "  3. Run 'pnpm build' to include icons in your PWA"
echo "  4. Test on mobile devices"
echo ""
