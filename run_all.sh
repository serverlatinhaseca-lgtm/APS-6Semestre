#!/bin/bash
# =============================================================================
# VerdeID - Script ÚNICO para rodar TUDO (Site + Backend + Reconhecimento Facial)
# Execute com: sudo bash run_all.sh
# =============================================================================
set -e

REPO_DIR="/mnt/c/Users/yerar/APS-6Semestre"
cd "$REPO_DIR"

echo "========================================"
echo "  VerdeID - Iniciando TUDO em um comando"
echo "========================================"

# -------------------------------------------------------
# 1. Verificar/Instalar Docker
# -------------------------------------------------------
echo "[1/6] Verificando Docker..."
if ! command -v docker &> /dev/null; then
  echo "Docker não encontrado. Instalando..."
  apt-get update -y
  apt-get install -y ca-certificates curl gnupg
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
    $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
    tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

systemctl enable docker 2>/dev/null || true
systemctl start docker 2>/dev/null || service docker start 2>/dev/null || true

# -------------------------------------------------------
# 2. Instalar Python pip
# -------------------------------------------------------
echo "[2/6] Verificando Python pip..."
if ! command -v pip3 &> /dev/null; then
  apt-get install -y python3-pip python3-venv
fi

# -------------------------------------------------------
# 3. Subir PostgreSQL via Docker
# -------------------------------------------------------
echo "[3/6] Subindo PostgreSQL via Docker Compose..."
cp .env.example .env
cat > .env << 'EOF'
POSTGRES_PASSWORD=verdeid123
POSTGRES_DB=aps_reconhecimento_facial
POSTGRES_USER=aps_user
POSTGRES_HOST=127.0.0.1
POSTGRES_PORT=5432
EOF

docker compose up -d

echo "Aguardando PostgreSQL ficar saudável..."
for i in $(seq 1 30); do
  if docker exec aps-postgres pg_isready -U aps_user -d aps_reconhecimento_facial 2>/dev/null; then
    echo "PostgreSQL esta pronto!"
    break
  fi
  echo "Tentativa $i/30..."
  sleep 2
done

# Inicializar schema do banco
if [ -f sql/inicializacao.sql ]; then
  echo "Inicializando schema do banco..."
  docker exec -i aps-postgres psql -U aps_user -d aps_reconhecimento_facial < sql/inicializacao.sql
  echo "Schema inicializado."
fi

# -------------------------------------------------------
# 4. Instalar dependências Python
# -------------------------------------------------------
echo "[4/6] Instalando dependências Python..."
pip3 install --break-system-packages --ignore-installed typing_extensions idna 2>/dev/null || true
pip3 install --break-system-packages --ignore-installed -r requirements.txt

# -------------------------------------------------------
# 5. Iniciar API FastAPI (backend)
# -------------------------------------------------------
echo "[5/6] Iniciando API FastAPI na porta 8000..."
export PYTHONPATH="$REPO_DIR:$PYTHONPATH"
export POSTGRES_PASSWORD=verdeid123
export POSTGRES_DB=aps_reconhecimento_facial
export POSTGRES_USER=aps_user
export POSTGRES_HOST=127.0.0.1
export POSTGRES_PORT=5432

# Matar processos existentes na porta 8000
pkill -f "uvicorn src.api:app" 2>/dev/null || true
pkill -f "http.server 8000" 2>/dev/null || true
pkill -f "http.server 8001" 2>/dev/null || true

nohup uvicorn src.api:app --host 127.0.0.1 --port 8000 > /tmp/verdeid_api.log 2>&1 &
echo "API iniciada em segundo plano (PID: $!)"

# -------------------------------------------------------
# 6. Iniciar servidor frontend
# -------------------------------------------------------
echo "[6/6] Iniciando servidor frontend na porta 8001..."
nohup python3 -m http.server 8001 --directory "$REPO_DIR" > /tmp/verdeid_frontend.log 2>&1 &
echo "Frontend iniciado em segundo plano (PID: $!)"

# -------------------------------------------------------
# Resumo final
# -------------------------------------------------------
echo ""
echo "========================================"
echo "  TUDO RODANDO!"
echo "========================================"
echo ""
echo "✅ Docker + PostgreSQL: rodando"
echo "✅ API FastAPI: http://127.0.0.1:8000"
echo "✅ Documentação API: http://127.0.0.1:8000/docs"
echo "✅ Site (frontend): http://localhost:8001/index.html"
echo ""
echo "========================================"
echo "  COMO USAR"
echo "========================================"
echo ""
echo "1. Abra o navegador em:"
echo "   http://localhost:8001/index.html"
echo ""
echo "2. Contas demo (senha demo123):"
echo "   cidadao@verdeid.demo  (nivel 1)"
echo "   pesquisador@verdeid.demo  (nivel 2)"
echo "   gestor@verdeid.demo  (nivel 3)"
echo ""
echo "3. Fluxo:"
echo "   index.html → login.html → cadastro.html → painel.html → artigo.html"
echo ""
echo "4. Para parar tudo:"
echo "   sudo bash stop_all.sh"
echo ""
echo "========================================"