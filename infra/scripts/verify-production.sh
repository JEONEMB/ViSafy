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

check "Frontend" "${base_url}/"
check "Backend health" "${base_url}/api/health"
check "AI health proxy" "${base_url}/api/health/ai"
check "Products API" "${base_url}/api/products"

headers="$(curl --fail --silent --show-error --head --max-time 20 "${base_url}/")"
grep -qi '^strict-transport-security:' <<<"$headers"
grep -qi '^content-security-policy:' <<<"$headers"
echo "PASS  HTTPS security headers"
echo "Public smoke verification completed. Run the browser E2E checklist before submission."
