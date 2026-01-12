#!/bin/bash

# WeAreOut Authentication System - Installation Script
# Run this script to install all required dependencies

echo "╔════════════════════════════════════════════════════════════════════════╗"
echo "║      WeAreOut Authentication System - Dependency Installation         ║"
echo "╚════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the mobile directory."
    exit 1
fi

echo "📦 Installing npm dependencies..."
echo ""

# Install production dependencies
npm install \
  axios \
  @react-native-async-storage/async-storage \
  @react-navigation/native \
  @react-navigation/native-stack \
  react-native-screens

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error: npm install failed"
    exit 1
fi

echo ""
echo "✅ npm dependencies installed successfully!"
echo ""

# iOS-specific installation
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "🍎 Detected macOS - Installing iOS pods..."
    echo ""

    cd ios
    pod install
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ Error: pod install failed"
        cd ..
        exit 1
    fi
    cd ..

    echo ""
    echo "✅ iOS pods installed successfully!"
    echo ""
else
    echo "ℹ️  Skipping pod install (not on macOS)"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Installation Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Update API URL in src/services/api.ts:"
echo "   const API_BASE_URL = 'http://localhost:3000/api'"
echo ""
echo "2. Follow the integration guide:"
echo "   cat INTEGRATION_GUIDE.md"
echo ""
echo "3. Run the app:"
echo "   npm run ios    (for iOS)"
echo "   npm run android    (for Android)"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: QUICK_REFERENCE.md"
echo "   - Full Guide: INTEGRATION_GUIDE.md"
echo "   - API Docs: src/README.md"
echo ""
