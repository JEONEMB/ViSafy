#!/usr/bin/env bash
# Keeps the public URL answering during the review window.
#
# The submission is disqualified if the URL is unreachable, so this checks the public health
# endpoint and, when it fails, restarts the application containers before a human notices.
# Install it on the server as a cron entry; see docs/operations-runbook.md.
#
#   */5 * * * * /home/USER/ssafin/infra/scripts/watchdog.sh >> /home/USER/ssafin/watchdog.log 2>&1
#
# It never rebuilds, never pulls, and never touches data volumes.
set -uo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root" || exit 1

env_file=".env.production"
[[ -f "$env_file" ]] || { echo "$(date -Is) FATAL missing $env_file"; exit 1; }

# shellcheck disable=SC1090
domain="$(grep -E '^VISAFY_DOMAIN=' "$env_file" | cut -d= -f2-)"
[[ -n "$domain" ]] || { echo "$(date -Is) FATAL VISAFY_DOMAIN not set"; exit 1; }

compose=(docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml --env-file "$env_file")
health_url="https://${domain}/api/health"

log() { echo "$(date -Is) $*"; }

healthy() {
  curl --fail --silent --show-error --max-time 20 "$health_url" >/dev/null 2>&1
}

# A single slow response is not an outage. Only act when it stays down.
for attempt in 1 2 3; do
  if healthy; then
    log "OK $health_url"
    exit 0
  fi
  log "WARN attempt ${attempt}/3 failed"
  sleep 10
done

log "DOWN restarting application containers"
"${compose[@]}" ps
"${compose[@]}" restart backend ai-service frontend caddy

for _ in $(seq 1 24); do
  sleep 10
  if healthy; then
    log "RECOVERED after restart"
    exit 0
  fi
done

log "STILL DOWN after restart - human action required"
"${compose[@]}" ps
"${compose[@]}" logs --tail 80 caddy backend ai-service
df -h / | tail -1
free -m | head -2
exit 1
