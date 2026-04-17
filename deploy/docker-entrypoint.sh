#!/bin/sh
set -e

# Fix permissions sur le volume uploads (monté en root par Docker)
mkdir -p /app/public/images/uploads
chown -R makine:makine /app/public/images/uploads

# Migrations DB + démarrage en tant que makine
exec su-exec makine sh -c "node node_modules/prisma/build/index.js db push --accept-data-loss && node server.js"
