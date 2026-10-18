# VerdeID — APS 6º Semestre

Projeto acadêmico de identificação biométrica com controle de acesso por nível a informações ambientais. Protótipo navegável com landing pública, plataforma autenticada e backend de reconhecimento facial.

---

## 📋 O que é

O VerdeID é um sistema de controle de acesso por nível de autorização:

- **Landing pública** — apresentação do projeto, níveis de acesso, caso monitorado (agrotóxicos proibidos)
- **Plataforma autenticada** — login, cadastro, painel com acervo filtrado por nível, artigos com controle de acesso
- **Reconhecimento facial** — backend real com FastAPI + PostgreSQL + DeepFace (feito por outra parte do time, **não modificar**)

---

## 🚀 Como rodar o site (frontend)

O frontend é estático, sem build. Simplesmente sirva os arquivos com Python:

```bash
# Na raiz do repositório
python3 -m http.server 8000
```

Abrir: **http://localhost:8000/index.html**

**Não abra via `file://`** — o site usa `localStorage`/`sessionStorage` e não funciona corretamente sem servidor HTTP.

---

## 🔑 Contas demo

Todas usam a senha **`demo123`**:

| E-mail | Nível | Perfil |
|--------|-------|--------|
| cidadao@verdeid.demo | 1 | Cidadão / Público |
| pesquisador@verdeid.demo | 2 | Pesquisador / Diretor de divisão |
| gestor@verdeid.demo | 3 | Gestor / Ministro |

---

## 📝 Cadastro de novo usuário

Acesse `cadastro.html` e preencha:

- Nome completo
- CPF (11 dígitos)
- E-mail
- Senha (mínimo 6 caracteres)
- **Nível de acesso** (1, 2 ou 3 — escolhido via select)
- **Foto** — ative a webcam e clique em "Capturar foto" (opcional para demo)

Clique em **"Criar conta e entrar"**. O front tenta enviar para a API (`POST /usuarios`); se a API não estiver rodando, o cadastro fica salvo no `localStorage` do navegador (modo demo). Você é redirecionado para o painel automaticamente.

---

## 🎮 Como testar o fluxo completo

```
index.html (landing)
  → login.html (entre com conta demo ou cadastre-se)
  → cadastro.html (ou vá direto para o painel)
  → painel.html (acervo filtrado pelo seu nível)
  → artigo.html?id=... (artigo com controle de acesso — nega se nível insuficiente)
```

No painel você pode:
- Buscar artigos por texto
- Filtrar por nível (1, 2 ou 3)
- Fazer verificação facial simulada (apenas visual, nada é gravado)

---

## 🖥️ Como rodar o backend (reconhecimento facial real)

O reconhecimento facial está no `src/` e **não foi modificado** (feito por outra parte do time). Para rodar, você precisa de **Docker e permissão para instalar pacotes Python**.

### Pré-requisitos
- Docker + Docker Compose
- Python 3 + pip
- Permissão para instalar pacotes (`pip install`)

### Passos

```bash
# 1. Na raiz do repositório, crie o arquivo .env
cp .env.example .env
# Edite o .env e coloque sua senha do PostgreSQL em POSTGRES_PASSWORD

# 2. Sube o PostgreSQL
docker compose up -d

# 3. Instale dependências Python
pip install -r requirements.txt

# 4. Rode a API
uvicorn src.api:app

# 5. Ou rode com câmera (reconhecimento facial real)
python src/main.py
```

Ou use o script automatizado:

```bash
chmod +x setup_backend.sh
./setup_backend.sh
```

Ou o script único para tudo:

```bash
chmod +x run_all.sh
sudo bash run_all.sh
```

Acesse a API em: **http://127.0.0.1:8000**
Documentação interativa: **http://127.0.0.1:8000/docs**

Acesse o site em: **http://localhost:8000/index.html** (ou porta 8001 se usar run_all.sh)

---

## 📁 Estrutura do repositório

```
.
├── index.html              # Landing completa
├── login.html              # Login com contas demo
├── cadastro.html           # Cadastro com escolha de nível de acesso e webcam
├── painel.html             # Acervo filtrado por nível + verificação facial
├── artigo.html             # Artigo com controle de acesso
├── privacidade.html        # Política LGPD
├── assets/
│   ├── css/style.css       # Estilização única
│   └── js/
│       ├── data.js         # Fonte da verdade (níveis, artigos, usuários demo)
│       ├── auth.js         # Auth (login/cadastro/sair)
│       └── app.js          # Nav, reveal, simulação facial
├── src/                    # Backend (reconhecimento facial - NÃO MODIFICAR)
│   ├── api.py              # Endpoints FastAPI
│   ├── reconhecimento.py   # DeepFace (outro time - não alterar)
│   ├── banco_dados.py      # Conexão PostgreSQL
│   ├── usuarios.py         # CRUD de usuários
│   ├── sessoes.py          # Sessões em memória
│   ├── servicos.py         # Controle de acesso por nível
│   ├── estado.py           # Estado do reconhecimento
│   ├── camera_compartilhada.py
│   ├── fotos_temporarias.py
│   ├── cadastro.py
│   └── main.py             # Entry point (API + câmera)
├── tests/                  # Testes pytest (10 arquivos)
├── sql/inicializacao.sql   # Schema do banco
├── compose.yaml            # PostgreSQL via Docker
├── requirements.txt        # Dependências Python
├── .env.example            # Modelo de variáveis de ambiente
├── .env                    # SEGREDO - não commitar (criar localmente)
├── run_all.sh              # Script único para rodar tudo
├── stop_all.sh             # Script para parar tudo
├── setup_backend.sh        # Script automatizado de setup backend
├── instalar_tudo.sh        # Script alternativo de instalação
├── AGENTS.md               # Instruções para agentes de IA
└── .gitignore
```

---

## 🔒 Regras importantes

| Regra | Detalhe |
|-------|---------|
| **Não commitar `.env`** | Está no `.gitignore`. Crie localmente com `POSTGRES_PASSWORD` |
| **Reconhecimento facial intocável** | `src/reconhecimento.py`, `camera_compartilhada.py`, `estado.py`, `fotos_temporarias.py` são de outro time |
| **Não abrir via `file://`** | Use `python3 -m http.server 8000` |
| **Porta 8000 compartilhada** | Frontend e backend usam a mesma porta (se rodar separado) |
| **Conteúdo acadêmico** | Use `[PROVISÓRIO]` ou `[DEMO]` para lacunas |

---

## 🧪 Testes

```bash
# Requer PostgreSQL rodando (docker compose up)
pytest tests/

# Arquivo específico
pytest tests/test_api.py
```

---

## 👥 Contribuição

- Mudanças pequenas e navegáveis
- `git status` + `git diff` antes de commit
- Sem push/PR sem pedido explícito
- Idioma: pt-BR

---

**Repositório:** https://github.com/serverlatinhaseca-lgtm/APS-6Semestre