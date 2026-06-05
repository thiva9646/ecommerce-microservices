# Build all Docker images on Windows (PowerShell)
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "Building microservice images..."
docker build -t api-gateway:latest "$Root\api-gateway"
docker build -t product-service:latest "$Root\product-service"
docker build -t cart-service:latest "$Root\cart-service"
docker build -t user-service:latest "$Root\user-service"
docker build -t order-service:latest "$Root\order-service"
Write-Host "Done."
