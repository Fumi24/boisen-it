#!/bin/bash

# Interactive Pipeline Website - Quick Setup Script
# This script automates the initial setup process

set -e

echo "🚀 Interactive Pipeline Website - Setup Script"
echo "=============================================="
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed"
    echo "Please install Node.js and npm first: https://nodejs.org/"
    exit 1
fi

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "📦 Installing Wrangler CLI..."
    npm install -g wrangler
fi

echo "✅ Prerequisites check complete"
echo ""

# Install dependencies
echo "📦 Installing project dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Login to Cloudflare
echo "🔐 Logging into Cloudflare..."
echo "A browser window will open for authentication..."
npx wrangler login
echo "✅ Cloudflare login complete"
echo ""

# Create KV namespace
echo "🗄️  Creating KV namespace..."
KV_OUTPUT=$(npx wrangler kv:namespace create PIPELINE_KV)
KV_ID=$(echo "$KV_OUTPUT" | grep -oP 'id = "\K[^"]+')

if [ -z "$KV_ID" ]; then
    echo "⚠️  Could not extract KV namespace ID automatically"
    echo "Please run: npx wrangler kv:namespace create PIPELINE_KV"
    echo "And update wrangler.toml manually"
else
    echo "✅ KV namespace created with ID: $KV_ID"
    echo "📝 Please update this ID in wrangler.toml"
fi
echo ""

# Create D1 database
echo "💾 Creating D1 database..."
DB_OUTPUT=$(npx wrangler d1 create pipeline_db)
DB_ID=$(echo "$DB_OUTPUT" | grep -oP 'database_id = "\K[^"]+')

if [ -z "$DB_ID" ]; then
    echo "⚠️  Could not extract database ID automatically"
    echo "Please run: npx wrangler d1 create pipeline_db"
    echo "And update wrangler.toml manually"
else
    echo "✅ D1 database created with ID: $DB_ID"
    echo "📝 Please update this ID in wrangler.toml"
fi
echo ""

# Initialize database schema
echo "🔧 Initializing database schema..."
npx wrangler d1 execute pipeline_db --file=worker/schema.sql
echo "✅ Database schema initialized"
echo ""

echo "=============================================="
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update wrangler.toml with your KV namespace ID and D1 database ID"
echo "2. Run 'npm run worker:dev' in one terminal"
echo "3. Run 'npm run dev' in another terminal"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For more details, see SETUP.md"
echo "🚀 Happy coding!"
