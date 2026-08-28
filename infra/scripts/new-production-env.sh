#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 1 || $# -gt 2 ]]; then
  echo "Usage: $0 DOMAIN [OPENAI_MODEL]" >&2
  exit 1
fi

domain="$1"
model="${2:-gpt-5.6-terra}"
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
target="${repo_root}/.env.production"

if [[ -e "$target" ]]; then
  echo "Refusing to overwrite $target" >&2
  exit 1
fi
if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl is required to generate production secrets." >&2
  exit 1
fi

read -r -s -p "OpenAI Project API Key: " openai_api_key
echo
if [[ -z "$openai_api_key" ]]; then
  echo "OpenAI API Key must not be empty." >&2
  exit 1
fi

new_secret() {
  openssl rand -hex 32
}

umask 077
mysql_password="$(new_secret)"
admin_username="admin_$(openssl rand -hex 8)"
cat > "$target" <<EOF
VISAFY_DOMAIN=$domain
NEXT_PUBLIC_DEFAULT_LANGUAGE=ko
MYSQL_DATABASE=visafy
MYSQL_USER=visafy
MYSQL_PASSWORD=$mysql_password
MYSQL_ROOT_PASSWORD=$(new_secret)
DB_PASSWORD=$mysql_password
ADMIN_USERNAME=$admin_username
ADMIN_PASSWORD=$(new_secret)
ADMIN_JWT_SECRET=$(new_secret)
RAG_INTERNAL_TOKEN=$(new_secret)
LLM_PROVIDER=openai
OPENAI_API_KEY=$openai_api_key
OPENAI_MODEL=$model
OPENAI_REASONING_EFFORT=medium
EMBEDDING_PROVIDER=fastembed
EMBEDDING_MODEL=intfloat/multilingual-e5-small
EMBEDDING_DIMENSIONS=384
EOF

echo "Created $target with mode 600. This file is ignored by Git."
