@echo off
REM Interactive Pipeline Website - Quick Setup Script (Windows)
REM This script automates the initial setup process

echo.
echo 🚀 Interactive Pipeline Website - Setup Script
echo ==============================================
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Error: npm is not installed
    echo Please install Node.js and npm first: https://nodejs.org/
    exit /b 1
)

REM Check if wrangler is installed
where wrangler >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing Wrangler CLI...
    call npm install -g wrangler
)

echo ✅ Prerequisites check complete
echo.

REM Install dependencies
echo 📦 Installing project dependencies...
call npm install
echo ✅ Dependencies installed
echo.

REM Login to Cloudflare
echo 🔐 Logging into Cloudflare...
echo A browser window will open for authentication...
call npx wrangler login
echo ✅ Cloudflare login complete
echo.

REM Create KV namespace
echo 🗄️  Creating KV namespace...
call npx wrangler kv:namespace create PIPELINE_KV
echo.
echo ⚠️  Please copy the ID from above and update it in wrangler.toml
echo.
pause

REM Create D1 database
echo 💾 Creating D1 database...
call npx wrangler d1 create pipeline_db
echo.
echo ⚠️  Please copy the database_id from above and update it in wrangler.toml
echo.
pause

REM Initialize database schema
echo 🔧 Initializing database schema...
call npx wrangler d1 execute pipeline_db --file=worker/schema.sql
echo ✅ Database schema initialized
echo.

echo ==============================================
echo ✅ Setup complete!
echo.
echo 📝 Next steps:
echo 1. Update wrangler.toml with your KV namespace ID and D1 database ID
echo 2. Run 'npm run worker:dev' in one terminal
echo 3. Run 'npm run dev' in another terminal
echo 4. Open http://localhost:3000 in your browser
echo.
echo 📚 For more details, see SETUP.md
echo 🚀 Happy coding!
echo.
pause
