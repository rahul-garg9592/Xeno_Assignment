#!/bin/bash

echo "🔧 Google OAuth Credentials Setup Helper"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found!"
    exit 1
fi

echo "📋 Current Google OAuth settings:"
grep -E "GOOGLE_CLIENT" backend/.env
echo ""

echo "🔍 To fix Google OAuth, you need to:"
echo "1. Go to https://console.cloud.google.com/"
echo "2. Create a new project or select existing one"
echo "3. Enable Google Identity API"
echo "4. Create OAuth 2.0 credentials"
echo "5. Add these redirect URIs:"
echo "   - http://localhost:8080/auth/google/callback"
echo "   - http://localhost:3000/auth/callback"
echo "6. Copy your Client ID and Client Secret"
echo ""

read -p "📝 Enter your Google Client ID: " CLIENT_ID
read -p "🔐 Enter your Google Client Secret: " CLIENT_SECRET

if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Error: Both Client ID and Client Secret are required!"
    exit 1
fi

# Update the .env file
echo "🔄 Updating backend/.env file..."

# Use sed to replace the placeholder values
sed -i.bak "s/GOOGLE_CLIENT_ID=.*/GOOGLE_CLIENT_ID=$CLIENT_ID/" backend/.env
sed -i.bak "s/GOOGLE_CLIENT_SECRET=.*/GOOGLE_CLIENT_SECRET=$CLIENT_SECRET/" backend/.env

echo "✅ Updated credentials successfully!"
echo ""
echo "📋 New Google OAuth settings:"
grep -E "GOOGLE_CLIENT" backend/.env
echo ""
echo "🚀 Next steps:"
echo "1. Restart your backend server: cd backend && npm run dev"
echo "2. Test Google OAuth at http://localhost:3000"
echo ""
echo "💡 If you haven't set up Google Cloud Console yet, follow the guide above!"

