#!/usr/bin/env bash
# Bootstrap the local dev environment for PodeAssinar.ai.
# Requires: Docker/OrbStack running, supabase CLI installed.
#
# What it does:
#   1. supabase start (applies all migrations in supabase/migrations)
#   2. creates the private `documents` storage bucket
#   3. seeds three confirmed test users (client / admin / lawyer)
#   4. promotes the admin + lawyer roles in public.users
#
# Idempotent-ish: safe to re-run; user creation will report "already registered".
set -euo pipefail

API="${SUPABASE_API_URL:-http://127.0.0.1:54321}"
DB_CONN="${SUPABASE_DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
PSQL="${PSQL_BIN:-/opt/homebrew/opt/postgresql@17/bin/psql}"

echo "==> Starting Supabase (applies migrations)…"
supabase start >/dev/null

# Read the local service-role key from the running stack rather than hardcoding
# it. (It's the public "supabase-demo" default, but reading it keeps this script
# key-free and correct if the CLI ever changes the default.)
SERVICE="${SERVICE_ROLE_KEY:-$(supabase status -o env 2>/dev/null | sed -n 's/^SERVICE_ROLE_KEY="\{0,1\}\([^"]*\)"\{0,1\}$/\1/p')}"
if [ -z "$SERVICE" ]; then
  echo "ERROR: could not resolve SERVICE_ROLE_KEY from 'supabase status'. Set SERVICE_ROLE_KEY and re-run." >&2
  exit 1
fi

echo "==> Creating 'documents' storage bucket (private, 10MB, pdf/images)…"
curl -s -X POST "$API/storage/v1/bucket" \
  -H "Authorization: Bearer $SERVICE" -H "Content-Type: application/json" \
  -d '{"id":"documents","name":"documents","public":false,"file_size_limit":10485760,"allowed_mime_types":["application/pdf","image/png","image/jpeg","image/jpg","image/webp"]}' \
  >/dev/null || true

create_user () {
  local email="$1" pass="$2" name="$3"
  curl -s -X POST "$API/auth/v1/admin/users" \
    -H "Authorization: Bearer $SERVICE" -H "apikey: $SERVICE" -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$pass\",\"email_confirm\":true,\"user_metadata\":{\"name\":\"$name\"}}" >/dev/null || true
}

echo "==> Seeding test users…"
create_user "client@pode.test" "Test1234!" "Cliente Teste"
create_user "admin@pode.test"  "Test1234!" "Admin Teste"
create_user "lawyer@pode.test" "Test1234!" "Advogado Teste"

echo "==> Promoting admin + lawyer roles…"
PGPASSWORD=postgres "$PSQL" "$DB_CONN" -q \
  -c "UPDATE users SET role='ADMIN'  WHERE email='admin@pode.test';" \
  -c "UPDATE users SET role='LAWYER' WHERE email='lawyer@pode.test';"

echo ""
echo "Done. Test accounts (password: Test1234!):"
echo "  client@pode.test  (CLIENT)"
echo "  admin@pode.test   (ADMIN)"
echo "  lawyer@pode.test  (LAWYER)"
echo ""
echo "Studio: http://127.0.0.1:54323   Mailpit: http://127.0.0.1:54324"
