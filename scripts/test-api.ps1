# Quick API smoke test (Docker Compose: gateway on localhost:3000)
$Base = if ($env:GATEWAY_URL) { $env:GATEWAY_URL } else { "http://localhost:3000" }

Write-Host "Gateway: $Base"
Invoke-RestMethod "$Base/health" | ConvertTo-Json

Write-Host "`nProducts:"
$products = Invoke-RestMethod "$Base/api/products"
$products | ConvertTo-Json -Depth 5

Write-Host "`nUsers:"
Invoke-RestMethod "$Base/api/users" | ConvertTo-Json -Depth 5

$userId = 1
$product = $products.data[0]
$productId = $product._id

Write-Host "`nAdd to cart (user $userId, product $productId):"
$body = @{
  userId   = "$userId"
  productId = $productId
  name     = $product.name
  price    = $product.price
  quantity = 1
} | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri "$Base/api/cart" -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5

Write-Host "`nCreate order:"
$orderBody = @{
  userId = $userId
  items  = @(@{
    productId = $productId
    name      = $product.name
    price     = $product.price
    quantity  = 1
  })
} | ConvertTo-Json -Depth 5
Invoke-RestMethod -Method Post -Uri "$Base/api/orders" -Body $orderBody -ContentType "application/json" | ConvertTo-Json -Depth 5

Write-Host "`nOrders for user $userId:"
Invoke-RestMethod "$Base/api/orders/user/$userId" | ConvertTo-Json -Depth 5
