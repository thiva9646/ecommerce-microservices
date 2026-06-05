#!/usr/bin/env bash
# Quick API smoke test (requires gateway on localhost:3000)
set -e

BASE="${GATEWAY_URL:-http://localhost:3000}"

echo "Gateway: $BASE"
curl -s "$BASE/health" | jq . 2>/dev/null || curl -s "$BASE/health"
echo ""

echo "Products:"
PRODUCTS=$(curl -s "$BASE/api/products")
echo "$PRODUCTS" | jq . 2>/dev/null || echo "$PRODUCTS"

echo ""
echo "Users:"
curl -s "$BASE/api/users" | jq . 2>/dev/null || curl -s "$BASE/api/users"
echo ""

# Parse first product id (needs jq)
if command -v jq &>/dev/null; then
  PRODUCT_ID=$(echo "$PRODUCTS" | jq -r '.data[0]._id')
  PRODUCT_NAME=$(echo "$PRODUCTS" | jq -r '.data[0].name')
  PRODUCT_PRICE=$(echo "$PRODUCTS" | jq -r '.data[0].price')
  USER_ID=1

  echo "Add to cart:"
  curl -s -X POST "$BASE/api/cart" \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$USER_ID\",\"productId\":\"$PRODUCT_ID\",\"name\":\"$PRODUCT_NAME\",\"price\":$PRODUCT_PRICE,\"quantity\":1}" | jq .
  echo ""

  echo "Create order:"
  curl -s -X POST "$BASE/api/orders" \
    -H "Content-Type: application/json" \
    -d "{\"userId\":$USER_ID,\"items\":[{\"productId\":\"$PRODUCT_ID\",\"name\":\"$PRODUCT_NAME\",\"price\":$PRODUCT_PRICE,\"quantity\":1}]}" | jq .
  echo ""

  echo "Orders for user $USER_ID:"
  curl -s "$BASE/api/orders/user/$USER_ID" | jq .
fi
