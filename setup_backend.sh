#!/bin/bash
# Script de setup do backend VerdeID (Reconhecimento Facial)
# Execute: chmod +x setup_backend.sh && ./setup_backend.sh

set -e

echo "========================================"
echo "  VerdeID - Setup do Backend"
echo "========================================"

# 1. Verificar Docker
if ! command -v docker &> /dev/null; then
  echo "ERRO: Docker não encontrado. Instale o Docker primeiro."
  echo "  https://docs.docker.com/engine/install/"
  exit 1
fi

if ! command -v docker compose &> /dev/null && ! docker compose version &> /dev/null; then
  echo "ERRO: Docker Compose não encontrado."
  exit 1
fi

# 2. Verificar .env
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "Criando .env a partir do .env.example..."
    cp .env.example .env
    echo "ATENCAO: Edite o arquivo .env com sua senha do PostgreSQL antes de continuar."
    read -p "Pressione Enter apos editar o .env..."
  else
    echo "ERRO: Arquivo .env nao encontrado. Crie um com POSTGRES_PASSWORD."
    exit 1
  fi
fi

# 3. Subir PostgreSQL
echo "Subindo PostgreSQL via Docker Compose..."
docker compose up -d

echo "Aguardando PostgreSQL ficar saudável..."
for i in {1..30}; do
  if docker exec aps-postgres pg_isready -U aps_user -d aps_reconhecimento_facial 2>/dev/null; then
    echo "PostgreSQL esta pronto!"
    break
  fi
  echo "Tentativa $i/30..."
  sleep 2
done

# 4. Instalar dependências Python
echo "Instalando dependências Python..."
pip install -r requirements.txt

# 5. Rodar a API
echo ""
echo "========================================"
echo "  Setup concluido!"
echo "========================================"
echo ""
echo "Para rodar a API:"
echo "  uvicorn src.api:app"
echo ""
echo "Para rodar com camera (reconhecimento facial real):"
echo "  python src/main.py"
echo ""
echo "Acesse: http://127.0.0.1:8000"
echo "Docs da API: http://127.0.0.1:8000/docs"