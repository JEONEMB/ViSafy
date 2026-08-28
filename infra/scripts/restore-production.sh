#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 2 || "$2" != "--confirm-data-replacement" ]]; then
  echo "Usage: $0 BACKUP_DIRECTORY --confirm-data-replacement" >&2
  exit 1
fi

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
backup_root="${repo_root}/backups"
requested="$1"
if [[ ! -d "$requested" ]]; then
  echo "Backup directory does not exist: $requested" >&2
  exit 1
fi
backup_dir="$(cd "$requested" && pwd -P)"
mkdir -p "$backup_root"
backup_root="$(cd "$backup_root" && pwd -P)"
case "$backup_dir" in
  "$backup_root"/*) ;;
  *) echo "Restore is limited to a verified directory below $backup_root" >&2; exit 1 ;;
esac
for file in mysql.sql rag-index.tar.gz git-commit.txt SHA256SUMS; do
  [[ -f "${backup_dir}/${file}" ]] || { echo "Missing backup file: $file" >&2; exit 1; }
done
(
  cd "$backup_dir"
  sha256sum --check SHA256SUMS
)

cd "$repo_root"
env_file=".env.production"
[[ -f "$env_file" ]] || { echo "Missing $env_file" >&2; exit 1; }
set -a
# shellcheck disable=SC1090
source "$env_file"
set +a
compose=(docker compose -f infra/docker-compose.yml -f infra/docker-compose.prod.yml --env-file "$env_file")

echo "Creating a safety backup before replacement ..."
"${repo_root}/infra/scripts/backup-production.sh" "${backup_root}/before-restore"

mapfile -t rag_volumes < <(docker volume ls \
  --filter label=com.docker.compose.project=visafy \
  --filter label=com.docker.compose.volume=chroma-data \
  --format '{{.Name}}')
if [[ ${#rag_volumes[@]} -ne 1 ]]; then
  echo "Expected exactly one visafy RAG volume; found ${#rag_volumes[@]}." >&2
  exit 1
fi

echo "Restoring MySQL ..."
"${compose[@]}" exec -T -e MYSQL_PWD="$MYSQL_PASSWORD" mysql \
  mysql -u "$MYSQL_USER" "$MYSQL_DATABASE" < "${backup_dir}/mysql.sql"

echo "Restoring RAG index ..."
"${compose[@]}" stop ai-service
docker run --rm \
  -v "${rag_volumes[0]}:/target" \
  -v "${backup_dir}:/backup:ro" \
  alpine:3.22 sh -eu -c \
  'find /target -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +; tar -C /target -xzf /backup/rag-index.tar.gz'
"${compose[@]}" up -d ai-service backend frontend caddy
"${compose[@]}" ps
echo "Restore completed from $backup_dir"
