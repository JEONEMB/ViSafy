#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

env_file=".env.production"
if [[ ! -f "$env_file" ]]; then
  echo "Missing $env_file. Run infra/scripts/new-production-env.sh first." >&2
  exit 1
fi
if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  echo "Docker Engine with the Compose plugin is required." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$env_file"
set +a

python3 ai-service/scripts/validate_production_config.py
compose=(docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml --env-file "$env_file")
"${compose[@]}" config --quiet
"${compose[@]}" up -d --build --remove-orphans

echo "Waiting for https://${VISAFY_DOMAIN}/api/health ..."
for _ in $(seq 1 60); do
  if curl --fail --silent --show-error "https://${VISAFY_DOMAIN}/api/health" >/dev/null; then
    "${compose[@]}" ps
    echo "SSAFIN production deployment is healthy."
    exit 0
  fi
  sleep 5
done

"${compose[@]}" ps
"${compose[@]}" logs --tail 120 caddy backend ai-service
echo "Deployment did not become healthy within 5 minutes." >&2
exit 1
