#!/bin/bash

# Start Expo and show QR code
echo "🚀 Starting Expo development server..."
echo "📱 QR code will appear below..."
echo ""

# Kill any existing Expo processes
pkill -f "expo start" 2>/dev/null
sleep 1

# Start Expo with QR code display
cd "$(dirname "$0")"
npx expo start


