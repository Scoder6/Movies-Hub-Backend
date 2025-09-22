# Setup script for MovieHub Backend

Write-Host "🎬 Setting up MovieHub Backend..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check if MongoDB is installed
try {
    $mongoVersion = mongod --version
    Write-Host "✅ MongoDB is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ MongoDB is not installed or not in PATH. Please install MongoDB from https://www.mongodb.com/try/download/community" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
$envFile = ".\.env"
$envExampleFile = ".\.env.example"

if (-not (Test-Path $envFile)) {
    Write-Host "ℹ️  Creating .env file from .env.example..." -ForegroundColor Yellow
    Copy-Item -Path $envExampleFile -Destination $envFile
    Write-Host "✅ Created .env file" -ForegroundColor Green
} else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Start MongoDB service
Write-Host "🚀 Starting MongoDB service..." -ForegroundColor Cyan
Start-Service -Name "MongoDB" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit the .env file with your configuration"
Write-Host "2. Run 'npm run dev' to start the development server"
Write-Host "3. Run 'npm run seed' to seed the database with sample data"
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Magenta
