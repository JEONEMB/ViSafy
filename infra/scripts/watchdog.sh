#!/usr/bin/env bash
# Keeps the public URL answering during the review window.
#
# The submission is disqualified if the public URL is unreachable, so this probes the public
# health endpoint, inspects each production service, and restarts only the ones that are
# actually degraded. Install it as a cron entry; see docs/operations-runbook.md.
#
#   */5 * * * * /home/USER/ssafin/infra/scripts/watchdog.sh >> /home/USER/ssafin/watchdog.log 2>&1
#
# It never rebuilds, never pulls, never removes containers, and never touches volumes.
#
# Services carrying a healthcheck (mysql, ai-service, backend) are judged by health status.
# frontend and caddy declare none, so they are judged by running state only.
#
# Exit codes: 0 healthy or recovered, 1 still degraded, 2 cannot run.

set -uo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root" || exit 2

readonly ENV_FILE=".env.production"
readonly LOG_MAX_BYTES=$((5 * 1024 * 1024))
readonly PROBE_ATTEMPTS=3
readonly PROBE_GAP_SECONDS=10
readonly RECOVERY_WAIT_SECONDS=240

log() { printf '%s %s\n' "$(date -Is)" "$*"; }

fatal() {
  log "FATAL $*"
  exit 2
}

# --- preconditions ---------------------------------------------------------

[[ -f "$ENV_FILE" ]] || fatal "missing $ENV_FILE - run infra/scripts/new-production-env.sh first"

domain="$(grep -E '^VISAFY_DOMAIN=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r' | tr -d '"')"
[[ -n "$domain" ]] || fatal "VISAFY_DOMAIN is not set in $ENV_FILE"

command -v docker >/dev/null 2>&1 || fatal "docker is not installed"

# A dead daemon takes everything down and cron cannot fix it without privileges, so try the
# passwordless path and report plainly when it is not available.
if ! docker info >/dev/null 2>&1; then
  log "DOWN docker daemon is not responding"
  if sudo -n systemctl start docker >/dev/null 2>&1; then
    sleep 15
    docker info >/dev/null 2>&1 || fatal "docker daemon did not come back after start"
    log "RECOVERED docker daemon restarted"
  else
    fatal "docker daemon is down and passwordless sudo is unavailable - run: sudo systemctl start docker"
  fi
fi

docker compose version >/dev/null 2>&1 || fatal "the docker compose plugin is required"

compose=(docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml --env-file "$ENV_FILE")
health_url="https://${domain}/api/health"

# --- single instance -------------------------------------------------------

# Recovery can outlast the five-minute cron interval; overlapping runs would fight each other.
lock_file="${TMPDIR:-/tmp}/ssafin-watchdog.lock"
if command -v flock >/dev/null 2>&1; then
  exec {lock_fd}>"$lock_file" || fatal "cannot open $lock_file"
  if ! flock -n "$lock_fd"; then
    log "SKIP another watchdog run is in progress"
    exit 0
  fi
fi

# --- helpers ---------------------------------------------------------------

probe_public_url() {
  curl --fail --silent --show-error --max-time 20 "$health_url" >/dev/null 2>&1
}

# Prints "<status> <health>" for a service, or "missing none" when no container exists.
service_state() {
  local service="$1" container_id
  container_id="$("${compose[@]}" ps -q "$service" 2>/dev/null | head -1)"
  if [[ -z "$container_id" ]]; then
    printf 'missing none\n'
    return
  fi
  docker inspect \
    --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' \
    "$container_id" 2>/dev/null || printf 'unknown none\n'
}

# Echoes the services that need attention, one per line.
degraded_services() {
  local service state status health
  while read -r service; do
    [[ -n "$service" ]] || continue
    state="$(service_state "$service")"
    status="${state%% *}"
    health="${state##* }"
    if [[ "$status" != "running" ]]; then
      printf '%s\n' "$service"
    elif [[ "$health" == "unhealthy" || "$health" == "starting" ]]; then
      # starting is only reported here when the public URL is already failing.
      printf '%s\n' "$service"
    fi
  done < <("${compose[@]}" config --services 2>/dev/null)
}

# Restarts one service with the smallest action that can fix it.
repair_service() {
  local service="$1" state status
  state="$(service_state "$service")"
  status="${state%% *}"
  if [[ "$status" == "missing" ]]; then
    log "REPAIR $service has no container - starting it"
    "${compose[@]}" up -d --no-deps --no-build "$service" >/dev/null 2>&1
  else
    log "REPAIR $service is '$state' - restarting it"
    "${compose[@]}" restart "$service" >/dev/null 2>&1
  fi
}

report_diagnostics() {
  "${compose[@]}" ps
  "${compose[@]}" logs --tail 60 caddy backend ai-service
  df -h / | tail -1
  free -m | head -2
}

trim_log_if_large() {
  local log_path="${repo_root}/watchdog.log" size
  [[ -f "$log_path" ]] || return 0
  size="$(wc -c <"$log_path" 2>/dev/null || echo 0)"
  if (( size > LOG_MAX_BYTES )); then
    tail -n 2000 "$log_path" >"${log_path}.tmp" && mv "${log_path}.tmp" "$log_path"
  fi
}

# --- probe -----------------------------------------------------------------

public_ok=false
for attempt in $(seq 1 "$PROBE_ATTEMPTS"); do
  if probe_public_url; then
    public_ok=true
    break
  fi
  log "WARN public health probe ${attempt}/${PROBE_ATTEMPTS} failed"
  [[ "$attempt" -lt "$PROBE_ATTEMPTS" ]] && sleep "$PROBE_GAP_SECONDS"
done

mapfile -t degraded < <(degraded_services)

if [[ "$public_ok" == true && ${#degraded[@]} -eq 0 ]]; then
  log "OK $health_url"
  trim_log_if_large
  exit 0
fi

# The URL answers but a service is degraded: repair just that service. The rule engine keeps
# serving while, for example, ai-service comes back.
if [[ "$public_ok" == true ]]; then
  log "DEGRADED public URL is up but these services need attention: ${degraded[*]}"
  for service in "${degraded[@]}"; do
    repair_service "$service"
  done
  log "REPAIRED ${degraded[*]}"
  trim_log_if_large
  exit 0
fi

# --- outage ----------------------------------------------------------------

log "DOWN $health_url did not answer"

if [[ ${#degraded[@]} -eq 0 ]]; then
  # Every container looks fine, so the fault is in the serving path rather than the app.
  log "DOWN all services report healthy - restarting the serving path only"
  targets=(caddy frontend)
else
  targets=("${degraded[@]}")
fi

for service in "${targets[@]}"; do
  repair_service "$service"
done

deadline=$((SECONDS + RECOVERY_WAIT_SECONDS))
while (( SECONDS < deadline )); do
  sleep "$PROBE_GAP_SECONDS"
  if probe_public_url; then
    log "RECOVERED after restarting: ${targets[*]}"
    trim_log_if_large
    exit 0
  fi
done

log "STILL DOWN after restarting: ${targets[*]} - human action required"
report_diagnostics
trim_log_if_large
exit 1
