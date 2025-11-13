#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

echo "🔧 Setting up Cartridge Controller workspace..."
echo ""

# Verify pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is not installed or not in PATH"
    echo ""
    echo "Please install pnpm first:"
    echo "  npm install -g pnpm"
    echo "  or"
    echo "  corepack enable pnpm"
    echo ""
    exit 1
fi

# Verify correct pnpm version
PNPM_VERSION=$(pnpm --version)
echo "✓ Found pnpm version $PNPM_VERSION"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
if ! pnpm install; then
    echo ""
    echo "❌ Error: Failed to install dependencies"
    echo ""
    echo "This might be due to:"
    echo "  - Network connectivity issues"
    echo "  - Corrupted pnpm store"
    echo "  - Missing system dependencies"
    echo ""
    echo "Try running: pnpm store prune"
    exit 1
fi

echo ""
echo "🔨 Building dependencies..."
if ! pnpm build:deps; then
    echo ""
    echo "❌ Error: Failed to build dependencies"
    echo ""
    echo "This might indicate:"
    echo "  - Build configuration issues"
    echo "  - Missing build tools"
    echo ""
    exit 1
fi

echo ""
echo "✅ Workspace setup complete!"
echo ""
echo "You can now:"
echo "  - Run 'pnpm dev' to start all development servers"
echo "  - Run 'pnpm test' to run tests"
echo "  - Run 'pnpm lint' to check code quality"
echo ""
