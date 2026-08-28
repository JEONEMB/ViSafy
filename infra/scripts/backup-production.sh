#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$repo_root"

env_file=".env.production"
backup_root="${1:-${repo_root}/backups}"
if [[ ! -f "$env_file" ]]; then
  echo "Missing $env_file." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$env_file"
set +a

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p -- "$backup_root"
backup_root="$(cd "$backup_root" && pwd -P)"
target="${backup_root}/${timestamp}"
mkdir -m 700 -- "$target"

compose=(docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml --env-file "$env_file")
"${compose[@]}" ps --status running mysql ai-service >/dev/null

echo "Backing up MySQL ..."
"${compose[@]}" exec -T -e MYSQL_PWD="$MYSQL_PASSWORD" mysql \
  mysqldump --single-transaction --routines --triggers --events \
  -u "$MYSQL_USER" "$MYSQL_DATABASE" > "${target}/mysql.sql"

mapfile -t rag_volumes < <(docker volume ls \
  --filter label=com.docker.compose.project=visafy \
  --filter label=com.docker.compose.volume=chroma-data \
  --format '{{.Name}}')
if [[ ${#rag_volumes[@]} -ne 1 ]]; then
  echo "Expected exactly one visafy RAG volume; found ${#rag_volumes[@]}." >&2
  exit 1
fi

echo "Backing up RAG index ..."
docker run --rm \
  -v "${rag_volumes[0]}:/source:ro" \
  -v "${target}:/backup" \
  alpine:3.22 tar -C /source -czf /backup/rag-index.tar.gz .

git rev-parse HEAD > "${target}/git-commit.txt"
(
  cd "$target"
  sha256sum mysql.sql rag-index.tar.gz git-commit.txt > SHA256SUMS
)
chmod 600 "${target}"/*
echo "Production backup created: $target"
