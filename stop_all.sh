#!/bin/bash
# =============================================================================
# VerdeID - Parar TUDO
# Execute com: sudo bash stop_all.sh
# =============================================================================

echo "========================================"
echo "  VerdeID - Parando TUDO"
echo "========================================"

# Parar API
pkill -f "uvicorn src.api:app" 2>/dev/null && echo "✅ API parada" || echo "ℹ️  API não estava rodando"

# Parar frontend
pkill -f "http.server 8000" 2>/dev/null && echo "✅ Frontend 8000 parado" || true
pkill -f "http.server 8001" 2>/dev/null && echo "✅ Frontend 8001 parado" || true

# Parar Docker Compose
if command -v docker compose &> /dev/null; then
  docker compose down 2>/dev/null && echo "✅ PostgreSQL parado" || echo "ℹ️  PostgreSQL não estava rodando"
fi

echo ""
echo "========================================"
echo "  TUDO PARADO"
echo "========================================"