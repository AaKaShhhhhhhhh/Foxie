@echo off
REM Quick Start Setup for Foxie Desktop (Windows)

echo 🦊 Foxie Desktop - Quick Start Setup
echo ======================================
echo.

REM Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js 16+ first.
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js found: %NODE_VERSION%
echo.

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

echo ✓ Dependencies installed
echo.

REM Create .env.local from .env.example if it doesn't exist
if not exist .env.local (
    echo 📝 Creating .env.local...
    copy .env.example .env.local
    echo ✓ .env.local created (update with your Charlie API key)
) else (
    echo ✓ .env.local already exists
)

echo.
echo 🚀 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env.local and add your Charlie API key
echo 2. Run: npm run dev
echo 3. Open http://localhost:5173 in your browser
echo.
echo For more info, see README.md
