.PHONY: help install dev build lint format clean test

# Default target
help:
	@echo "Seven Markdown - Available Commands:"
	@echo ""
	@echo "  make install     - Install all dependencies"
	@echo "  make dev         - Start development server"
	@echo "  make build       - Build for production"
	@echo "  make lint        - Run ESLint"
	@echo "  make format      - Format code with Prettier"
	@echo "  make type-check  - Run TypeScript type checking"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make clean-all   - Clean all dependencies and builds"
	@echo "  make test        - Run tests"
	@echo "  make release     - Build release version"
	@echo ""

# Install dependencies
install:
	@echo "📦 Installing Node.js dependencies..."
	npm install
	@echo "✅ Installation complete!"

# Development
dev:
	@echo "🚀 Starting development server..."
	npm run tauri:dev

# Build
build:
	@echo "🏗️  Building application..."
	npm run build
	@echo "✅ Build complete!"

# Linting
lint:
	@echo "🔍 Running ESLint..."
	npm run lint
	@echo "✅ Linting complete!"

lint-fix:
	@echo "🔧 Fixing ESLint issues..."
	npm run lint:fix
	@echo "✅ Fixed!"

# Formatting
format:
	@echo "✨ Formatting code..."
	npm run format
	@echo "✅ Formatting complete!"

format-check:
	@echo "🔍 Checking code format..."
	npm run format:check

# Type checking
type-check:
	@echo "🔍 Running TypeScript type check..."
	npm run type-check
	@echo "✅ Type check complete!"

# Cleaning
clean:
	@echo "🧹 Cleaning build artifacts..."
	npm run clean
	@echo "✅ Clean complete!"

clean-all:
	@echo "🧹 Cleaning everything..."
	npm run clean:all
	@echo "✅ Deep clean complete!"

# Testing
test:
	@echo "🧪 Running tests..."
	npm test
	@echo "✅ Tests complete!"

# Release
release:
	@echo "🚀 Building release version..."
	npm run tauri:build
	@echo "✅ Release build complete!"

# Install Rust (for first-time setup)
install-rust:
	@echo "🦀 Checking Rust installation..."
	@which rustc > /dev/null || (echo "Installing Rust..." && curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh)
	@echo "✅ Rust is ready!"

# First-time setup
setup: install install-rust
	@echo "🎉 Setup complete! Run 'make dev' to start developing."
