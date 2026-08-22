# Script d'installation Redis pour Windows
Write-Host "🔧 Installation de Redis pour Art Studio 242" -ForegroundColor Green

# Vérifier si Redis est déjà installé
$redisPath = Get-Command redis-server -ErrorAction SilentlyContinue

if ($redisPath) {
    Write-Host "✅ Redis est déjà installé à: $($redisPath.Source)" -ForegroundColor Green
    
    # Tester la connexion
    try {
        $testConnection = redis-cli ping
        if ($testConnection -eq "PONG") {
            Write-Host "✅ Redis fonctionne correctement" -ForegroundColor Green
            exit 0
        }
    } catch {
        Write-Host "⚠️ Redis est installé mais ne fonctionne pas" -ForegroundColor Yellow
    }
}

Write-Host "📦 Installation de Redis via Chocolatey..." -ForegroundColor Blue

# Vérifier si Chocolatey est installé
$chocoPath = Get-Command choco -ErrorAction SilentlyContinue

if (-not $chocoPath) {
    Write-Host "📦 Installation de Chocolatey..." -ForegroundColor Blue
    
    # Installer Chocolatey
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # Recharger PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
}

# Installer Redis
Write-Host "📦 Installation de Redis..." -ForegroundColor Blue
choco install redis-64 -y

# Démarrer Redis comme service
Write-Host "🚀 Démarrage du service Redis..." -ForegroundColor Blue
redis-server --service-install
redis-server --service-start

# Tester l'installation
Start-Sleep -Seconds 3

try {
    $testConnection = redis-cli ping
    if ($testConnection -eq "PONG") {
        Write-Host "✅ Redis installé et démarré avec succès!" -ForegroundColor Green
        Write-Host "💡 Vous pouvez maintenant démarrer votre application Art Studio 242" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erreur: Redis ne répond pas correctement" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test de connexion Redis" -ForegroundColor Red
    Write-Host "💡 Essayez de redémarrer votre terminal en tant qu'administrateur" -ForegroundColor Yellow
}

Write-Host "`n📋 Informations Redis:" -ForegroundColor Cyan
Write-Host "   Host: localhost" -ForegroundColor White
Write-Host "   Port: 6379" -ForegroundColor White
Write-Host "   Database: 0" -ForegroundColor White