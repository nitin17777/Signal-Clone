#!/usr/bin/env bash
# render-build.sh — executed by Render as the "Build Command"
# Installs Python deps, runs DB migrations, and seeds demo data.
set -e

echo "=== Installing Python dependencies ==="
pip install -r requirements.txt

echo "=== Running Alembic migrations ==="
alembic upgrade head

echo "=== Seeding demo data ==="
python -m app.seed.seed_data

echo "=== Build complete ==="
