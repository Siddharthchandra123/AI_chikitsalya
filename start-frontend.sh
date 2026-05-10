#!/bin/bash

# Frontend startup script for production

set -e

cd "$(dirname "$0")/frontend"

# Install or update dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    pnpm install
fi

# Build the application
echo "Building application for production..."
pnpm build

# Start the production server
echo "Starting Medical AI Frontend..."
pnpm start
