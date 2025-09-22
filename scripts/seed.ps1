# Seed script for MovieHub Backend

Write-Host "🌱 Seeding MovieHub database..." -ForegroundColor Cyan

# Check if .env file exists
$envFile = ".\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env file not found. Please run the setup script first." -ForegroundColor Red
    exit 1
}

# Check if node_modules exists
if (-not (Test-Path ".\node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
}

# Run the seed script
Write-Host "🔃 Running database seeder..." -ForegroundColor Cyan
try {
    npx ts-node src/utils/seed.ts
    Write-Host "✅ Database seeded successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error seeding database. Make sure MongoDB is running and the connection string in .env is correct." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Database seeding complete!" -ForegroundColor Green
Write-Host "You can now start the application with 'npm run dev'" -ForegroundColor Cyan
