#!/bin/bash

# FRS User Profiles - Production Packaging Script
# Creates a clean, deployment-ready zip file

PLUGIN_SLUG="frs-wp-users"
PLUGIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TEMP_DIR="/tmp/${PLUGIN_SLUG}-production"
PACKAGE_DIR="/tmp/${PLUGIN_SLUG}-packages"

echo "🚀 Packaging FRS User Profiles for Production..."
echo ""

# Clean up previous temp directories
rm -rf "$TEMP_DIR"
rm -rf "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

# Copy plugin to temp directory
echo "📦 Copying plugin files..."
rsync -av \
  --exclude-from="$PLUGIN_DIR/.distignore" \
  "$PLUGIN_DIR/" \
  "$TEMP_DIR/"

# Remove vendor and reinstall production only
echo "📚 Installing production dependencies..."
cd "$TEMP_DIR"
if [ -f "composer.json" ]; then
  composer install --no-dev --optimize-autoloader --quiet
fi

# Remove source maps from production
echo "🗑️  Removing source maps..."
find "$TEMP_DIR/assets" -name "*.map" -type f -delete

# Create zip file
echo "📦 Creating production zip..."
cd /tmp
zip -r "${PACKAGE_DIR}/${PLUGIN_SLUG}.zip" "${PLUGIN_SLUG}-production" -q

# Get file size
FILESIZE=$(du -h "${PACKAGE_DIR}/${PLUGIN_SLUG}.zip" | cut -f1)

echo ""
echo "✅ Production package created successfully!"
echo "📁 Location: ${PACKAGE_DIR}/${PLUGIN_SLUG}.zip"
echo "📊 Size: $FILESIZE"
echo ""

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo "🎉 Done! Ready for deployment."
