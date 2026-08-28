#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 DOMAIN" >&2
  exit 1
fi

domain="$1"
base_url="https://${domain}"

check() {
  label="$1"
  url="$2"
  curl --fail --silent --show-error --location --max-time 20 "$url" >/dev/null
  echo "PASS  $label  $url"
}

expect_status() {
  label="$1"
  url="$2"
  expected="$3"
  actual="$(curl --silent --show-error --output /dev/null --write-out '%{http_code}' --max-time 20 "$url")"
  if [[ "$actual" != "$expected" ]]; then
    echo "FAIL  ${label}: expected HTTP ${expected}, received ${actual}" >&2
    exit 1
  fi
  echo "PASS  $label  HTTP $actual"
}

check "Frontend" "${base_url}/"
check "Backend health" "${base_url}/api/health"
check "AI health proxy" "${base_url}/api/health/ai"
check "Products API" "${base_url}/api/products"

expect_status "Anonymous admin access blocked" "${base_url}/api/admin/auth/check" "401"
expect_status "Internal AI path hidden" "${base_url}/internal/rag/retrieve" "404"
expect_status "OpenAPI hidden" "${base_url}/v3/api-docs" "404"
expect_status "Swagger UI hidden" "${base_url}/swagger-ui/index.html" "404"

ai_health="$(curl --fail --silent --show-error --max-time 20 "${base_url}/api/health/ai")"
grep -Eq '"llmProvider"[[:space:]]*:[[:space:]]*"openai"' <<<"$ai_health"
echo "PASS  AI service reports the OpenAI provider"

headers="$(curl --fail --silent --show-error --head --max-time 20 "${base_url}/")"
grep -qi '^strict-transport-security:' <<<"$headers"
grep -qi '^content-security-policy:' <<<"$headers"
grep -qi '^x-content-type-options:[[:space:]]*nosniff' <<<"$headers"
grep -qi '^x-frame-options:[[:space:]]*DENY' <<<"$headers"
echo "PASS  HTTPS security headers"
echo "Public smoke verification completed. Run the browser E2E checklist before submission."
