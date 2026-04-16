#!/bin/bash
# CI environment setup script for E2E tests

set -e

echo "Setting up CI environment for E2E tests..."

# Install system dependencies for Playwright on Linux
if [ "$RUNNER_OS" = "Linux" ]; then
  echo "Installing Linux dependencies..."
  sudo apt-get update -qq
  sudo apt-get install -y \
    libgtk-3-0 \
    libnotify-dev \
    libgconf-2-4 \
    libnss3 \
    libxss1 \
    libasound2 \
    libxtst6 \
    xauth \
    xvfb \
    fonts-liberation \
    libappindicator3-1 \
    xdg-utils
fi

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm ci

# Install Playwright browsers
echo "Installing Playwright browsers..."
npx playwright install --with-deps chromium

# Create necessary directories
echo "Creating test directories..."
mkdir -p test-results/screenshots
mkdir -p test-results/videos
mkdir -p test-results/traces
mkdir -p playwright-report

echo "CI environment setup complete!"
